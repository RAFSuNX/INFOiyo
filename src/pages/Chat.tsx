import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, doc, getDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Send, MessageCircle, Flag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';

interface ChatMessage {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorPhotoURL?: string;
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
  const [userPhotos, setUserPhotos] = useState<Record<string, string | null>>({});
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportedMessage, setReportedMessage] = useState<ChatMessage | null>(null);
  const { error, handleError, clearError } = useErrorHandler();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.emailVerified) return;

    const messagesRef = collection(db, 'chat');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const messageData = doc.data();
        return {
          id: doc.id,
          ...messageData
        } as ChatMessage;
      });
      
      setMessages(messagesData);
      
      if (shouldScrollToBottom) {
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [user?.emailVerified, shouldScrollToBottom]);

  // Fetch user profile photos separately
  useEffect(() => {
    const fetchUserPhotos = async () => {
      const newUserIds = messages
        .filter(message => !userPhotos[message.authorId])
        .map(message => message.authorId);
      
      if (newUserIds.length === 0) return;
      
      const newPhotos = await Promise.all(
        newUserIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.data();
          return [userId, userData?.photoURL || null] as [string, string | null];
        })
      );
      
      setUserPhotos(prev => ({
        ...prev,
        ...Object.fromEntries(newPhotos)
      }));
    };

    if (messages.length > 0) {
      fetchUserPhotos();
    }
  }, [messages]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    clearError();

    try {
      if (newMessage.length > 500) {
        throw new Error('Message is too long. Maximum 500 characters allowed.');
      }

      setSubmitting(true);
      await addDoc(collection(db, 'chat'), {
        content: newMessage.trim(),
        author: user.displayName,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleError(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (reason: string) => {
    if (!user || !reportedMessage) return;

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

    // Show confirmation alert
    alert('Report submitted successfully. An admin will review it shortly.');
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
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex items-center gap-3 p-4 border-b border-black bg-white">
        {error && <ErrorAlert message={error.message} onClose={clearError} />}
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-500">INFOiyo™</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scroll-smooth flex flex-col"
          onScroll={handleScroll} 
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.authorId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative max-w-[85%] sm:max-w-[70%] ${
                message.authorId === user.uid 
                  ? 'bg-black text-white ml-4' 
                  : 'bg-gray-100 mr-4'
              } rounded-2xl px-4 py-2 shadow-sm break-words`}>
                <p className="whitespace-pre-wrap break-words text-base">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  {userPhotos[message.authorId] ? (
                    <img
                      src={userPhotos[message.authorId]!}
                      alt={message.author}
                      className={`w-4 h-4 rounded-full object-cover`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        // Fallback to initial letter if image fails to load
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium ${
                    userPhotos[message.authorId] ? 'hidden' : ''
                  } ${message.authorId === user.uid ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    {message.author[0].toUpperCase()}
                  </div>
                  <div className={`text-[10px] ${message.authorId === user.uid ? 'text-gray-300' : 'text-gray-500'}`}>
                    {message.author}
                    <span className="mx-1">•</span>
                    {message.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.authorId !== user.uid && userProfile?.status !== 'banned' && (
                  <button
                    onClick={() => setReportedMessage(message)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-200"
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

        <div className="border-t border-black p-3 sm:p-4 bg-gray-50 shadow-lg">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 border border-black rounded-full px-6 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={submitting || !newMessage.trim()}
                  className="px-4 sm:px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            )}
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