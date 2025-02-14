import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Info, Book, AlertCircle } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { PostStatus } from '../types/user';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';
import BackButton from '../components/BackButton';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { error, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'writer')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Want to become a writer?</h2>
        <p className="text-gray-600 mb-6">
          Apply to become a writer and share your thoughts with our community.
        </p>
        <Link
          to="/apply-writer"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
        >
          Apply Now
        </Link>
      </div>
    );
  }

  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid
    const pattern = /^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (url && !pattern.test(url)) {
      handleError('Please enter a valid image URL ending with .jpg, .jpeg, .png, .gif, or .webp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    clearError();

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!content.trim()) {
        throw new Error('Content is required');
      }
      if (title.length > 100) {
        throw new Error('Title must be less than 100 characters');
      }
      if (excerpt.length > 160) {
        throw new Error('Excerpt must be less than 160 characters');
      }
    
      // Generate slug and check for uniqueness
      let slug = slugify(title);
      const postsRef = collection(db, 'posts');
      const slugQuery = query(postsRef, where('slug', '==', slug));
      const slugSnapshot = await getDocs(slugQuery);
    
      // If slug exists, append a timestamp
      if (!slugSnapshot.empty) {
        slug = `${slug}-${Date.now()}`;
      }

      if (!validateImageUrl(imageUrl)) {
        return;
      }

      const post = {
        title,
        content,
        slug,
        excerpt,
        imageUrl,
        author: user.displayName,
        authorId: user.uid,
        status: userProfile.role === 'admin' ? 'approved' as PostStatus : 'pending' as PostStatus,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), post);
      setLoading(false);
      navigate('/profile');
      
      if (userProfile.role !== 'admin') {
        alert('Your post has been submitted for review. An admin will approve it shortly.');
      }
    } catch (err) {
      handleError(handleApiError(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 overflow-x-hidden">
      <div className="mb-6">
        <BackButton />
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Create New Post</h1>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
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
            <label className="block text-sm font-medium mb-2">
              Excerpt (for SEO)
              <span className="text-gray-500 text-xs ml-2">
                Brief description of your post (max 160 characters)
              </span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={160}
              rows={2}
              className="w-full border border-black rounded-lg p-3 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter a brief description of your post..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {excerpt.length}/160 characters
            </p>
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
                rows={12}
                className="w-full border border-black rounded-lg p-4 font-mono focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Write your post content here..."
              />
            ) : (
              <div className="border border-black rounded-lg p-4 min-h-[300px] sm:min-h-[400px] prose prose-sm sm:prose-base lg:prose-lg max-w-none overflow-x-auto">
                <MarkdownRenderer content={content || 'Nothing to preview'} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Featured Image URL
              <span className="text-gray-500 text-xs ml-2">
                Enter a direct image URL (optional)
              </span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setError('');
                setImageUrl(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-black rounded-lg p-3 focus:ring-2 focus:ring-black focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              We recommend using <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">postimages.org</a> to host your image. After uploading, copy the "Direct link" URL.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Steps to use postimages.org:
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>Visit postimages.org</li>
                <li>Click "Choose Images" and select your file</li>
                <li>After upload, copy the "Direct link" URL</li>
                <li>Paste the URL here</li>
              </ol>
            </p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-4 max-h-64 object-contain rounded-lg"
                onError={() => {
                  setError('Unable to load image. Please check the URL.');
                }}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-200"
          >
            {loading ? 'Creating...' : 'Publish Post'}
          </button>
        </form>

        <div className="w-full md:w-96">
          <div className="sticky top-4 space-y-6">
            <Link
              to="/markdown-guide"
              className="block p-6 bg-white border border-black rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <Book className="h-6 w-6" />
                <h3 className="font-bold text-lg">Markdown Guide</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Learn how to format your posts with our comprehensive Markdown guide. 
                Get tips on headers, lists, code blocks, and more.
              </p>
              <span className="inline-block mt-4 text-sm font-medium hover:underline">
                View Full Guide →
              </span>
            </Link>

            <div className="bg-white border border-black rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5" />
                <h3 className="font-bold text-lg">Quick Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• Use clear, descriptive titles</li>
                <li>• Add relevant images to engage readers</li>
                <li>• Structure content with headers</li>
                <li>• Preview before publishing</li>
                <li>• Use markdown for better formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}