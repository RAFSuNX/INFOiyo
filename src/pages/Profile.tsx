import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

interface UserPost {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function Profile() {
  const { user, userProfile, resendVerificationEmail } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('authorId', '==', user.uid));
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserPost));
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  if (!user || !userProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Please sign in to view your profile</h2>
      </div>
    );
  }

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send verification email');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white border border-black rounded-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-black text-white flex items-center justify-center">
            <UserCircle size={48} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
            <p className="text-gray-600">{userProfile.email}</p>
            <p className="text-sm mt-1">Role: {userProfile.role}</p>
          </div>
        </div>

        {!user.emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Email Verification Required</h3>
            <p className="text-yellow-700 mb-4">
              Please verify your email address to access all features.
            </p>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {verificationSent ? (
              <p className="text-green-600">Verification email sent! Please check your inbox.</p>
            ) : (
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition duration-200"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium">{userProfile.displayName}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="font-medium">
                  {user.emailVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending Verification</span>
                  )}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium capitalize">{userProfile.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
        {loading ? (
          <p className="text-center py-4">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Start sharing your thoughts with the community.</p>
            <Link
              to="/create-post"
              className="inline-flex items-center px-4 py-2 border border-black rounded-md shadow-sm text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {post.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/post/${post.id}/edit`}
                      className="p-2 text-gray-600 hover:text-black transition-colors duration-200"
                      title="Edit post"
                    >
                      <Pencil size={20} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                      title="Delete post"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2">{post.content}</p>
                
                {deleteConfirm === post.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}