import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Send, MessageCircle, Flag } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
}

interface ReportModalProps {
  message: ChatMessage;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

function ReportModal({ message, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit(reason);
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Report Message</h3>
        <p className="text-gray-600 mb-4">Message by: {message.author}</p>
        <p className="text-gray-600 mb-4">Content: {message.content}</p>
        
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">
            Reason for reporting
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-black rounded-lg p-3 mb-4 min-h-[100px]"
            placeholder="Please explain why you're reporting this message..."
            required
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportedMessage, setReportedMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!user?.emailVerified) return;

    const messagesRef = collection(db, 'chat');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      setMessages(messagesData.reverse());
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user?.emailVerified]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'chat'), {
        content: newMessage.trim(),
        author: user.displayName,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (reason: string) => {
    if (!user || !reportedMessage) return;

    // Check if user has already reported this message
    const reportRef = collection(db, 'reports');
    const reportedUserDoc = await getDoc(doc(db, 'users', reportedMessage.authorId));
    const reportedUser = reportedUserDoc.data();

    await addDoc(reportRef, {
      messageId: reportedMessage.id,
      messageContent: reportedMessage.content,
      reportedUserId: reportedMessage.authorId,
      reportedUserName: reportedMessage.author,
      reportedUserEmail: reportedUser?.email,
      reporterUserId: user.uid,
      reporterUserName: user.displayName,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Sign in to access chat</h2>
        <p className="mt-2">Join our community to participate in discussions.</p>
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-800">Email Verification Required</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            Please verify your email address to join the chat.
          </p>
          <button
            onClick={() => user.sendEmailVerification()}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition duration-200"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Community Chat</h1>
      </div>

      <div className="bg-white border border-black rounded-lg overflow-hidden">
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.authorId === user.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`group relative max-w-[70%] ${message.authorId === user.uid ? 'bg-black text-white' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className={`text-xs mb-1 ${message.authorId === user.uid ? 'text-gray-300' : 'text-gray-500'}`}>
                    {message.author}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  {message.authorId !== user.uid && (
                    <button
                      onClick={() => setReportedMessage(message)}
                      className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity duration-200"
                      title="Report message"
                    >
                      <Flag className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-black p-4">
            {userProfile?.status === 'banned' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">Your account has been restricted from sending messages.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-black rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={submitting || !newMessage.trim()}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {reportedMessage && (
        <ReportModal
          message={reportedMessage}
          onClose={() => setReportedMessage(null)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
}