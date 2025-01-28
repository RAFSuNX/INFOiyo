import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';
import BackButton from '../components/BackButton';

export default function ApplyWriter() {
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Please sign in to apply</h2>
        <p className="mt-2">You need to be signed in to submit a writer application.</p>
      </div>
    );
  }

  if (userProfile.role === 'writer' || userProfile.role === 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">You're already a writer!</h2>
        <p className="mt-2">You can create posts from your profile.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (!reason.trim() || !experience.trim() || !topics.trim()) {
        throw new Error('Please fill in all fields');
      }

      setLoading(true);
      
      await addDoc(collection(db, 'writer_applications'), {
        userId: user.uid,
        username: user.displayName,
        email: user.email,
        reason: reason.trim(),
        experience: experience.trim(),
        topics: topics.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      navigate('/profile');
      alert('Your application has been submitted! We will review it shortly.');
    } catch (err) {
      handleError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-3xl font-bold mb-8">Apply to Become a Writer</h1>

      {error && <ErrorAlert message={error.message} onClose={clearError} />}

      <div className="bg-white border border-black rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">What we're looking for:</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Passion for writing and sharing knowledge</li>
          <li>• Clear and engaging writing style</li>
          <li>• Commitment to quality content</li>
          <li>• Regular contribution to the platform</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Why do you want to become a writer?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-black rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Share your motivation for becoming a writer..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            What's your writing experience?
          </label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full border border-black rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="Tell us about your writing background..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            What topics would you like to write about?
          </label>
          <textarea
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            className="w-full border border-black rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="List the topics you're interested in covering..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-200"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}