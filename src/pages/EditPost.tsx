import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Info } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';

export default function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug || !user) return;

      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('slug', '==', slug));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          navigate('/profile');
          return;
        }

        const postDoc = snapshot.docs[0];
        const postData = postDoc.data();
        if (postData.authorId !== user.uid) {
          navigate('/profile');
          return;
        }

        setTitle(postData.title);
        setContent(postData.content);
      } catch (err) {
        handleError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, user, navigate, handleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !user) return;

    try {
      setLoading(true);
      clearError();

      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!content.trim()) {
        throw new Error('Content is required');
      }

      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('slug', '==', slug));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Post not found');
      }
      
      await updateDoc(doc(db, 'posts', snapshot.docs[0].id), {
        title: title.trim(),
        content: content.trim(),
      });
      navigate(`/post/${slug}`);
    } catch (err) {
      handleError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6">
        <BackButton />
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      
      {error && <ErrorAlert message={error.message} onClose={clearError} />}
      
      <div className="flex flex-col md:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-black rounded-lg p-3 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter your post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={`px-4 py-2 rounded-lg ${!showPreview ? 'bg-black text-white' : 'border border-black'}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`px-4 py-2 rounded-lg ${showPreview ? 'bg-black text-white' : 'border border-black'}`}
              >
                Preview
              </button>
            </div>
            {!showPreview ? (
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full border border-black rounded-lg p-4 font-mono focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Write your post content here..."
              />
            ) : (
              <div className="border border-black rounded-lg p-4 min-h-[400px] prose prose-sm md:prose-base lg:prose-lg max-w-none">
                <MarkdownRenderer content={content || 'Nothing to preview'} />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-200"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 py-3 border border-black rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="w-full md:w-96">
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5" />
              <h3 className="font-bold text-lg">Markdown Supported</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>You can use Markdown to format your post.</p>
              <p className="mt-2">See the Create Post page for a full Markdown guide.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}