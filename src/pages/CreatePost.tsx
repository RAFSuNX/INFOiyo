import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Info, Book } from 'lucide-react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'writer')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Unauthorized Access</h2>
        <p className="mt-2">You don't have permission to create posts.</p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      let imageUrl = '';

      if (image) {
        const imageRef = ref(storage, `blog-images/${Date.now()}-${image.name}`);
        const uploadResult = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const post = {
        title,
        content,
        imageUrl,
        author: user.displayName,
        authorId: user.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), post);
      navigate('/');
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || 'Nothing to preview'}</ReactMarkdown>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 max-h-64 object-contain rounded-lg" />
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