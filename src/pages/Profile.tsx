import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Pencil, Trash2, AlertCircle, Image, Shield } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { PostStatus } from '../types/user';

interface UserPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  createdAt: any;
}

export default function Profile() {
  const { user, userProfile, resendVerificationEmail, signout } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
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

  const validateImageURL = async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      if (!url.match(/^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        setError('Please enter a valid image URL ending with .jpg, .jpeg, .png, .gif, .webp, or .svg');
        return false;
      }

      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    } catch {
      return false;
    }
  };

  const handleUpdatePhoto = async () => {
    if (!user) return;
    
    setError('');
    setIsPhotoLoading(true);

    try {
      // Handle photo removal
      if (!photoURL) {
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: null
        });
        setIsEditingPhoto(false);
        setIsPhotoLoading(false);
        return;
      }

      // Validate that URL points to an image
      const isValidImage = await validateImageURL(photoURL);
      if (!isValidImage) {
        setIsPhotoLoading(false);
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL
      });
      setIsEditingPhoto(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile photo';
      console.error('Error updating photo:', errorMessage);
      setError('Failed to update profile photo');
    } finally {
      setIsPhotoLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white border border-black rounded-lg p-8 animate-fade-in">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative group">
            {userProfile.photoURL ? (
              <img
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = '';
                  target.onerror = null;
                  // Remove the invalid photo URL from the user's profile
                  const userRef = doc(db, 'users', user.uid);
                  updateDoc(userRef, { photoURL: null });
                }}
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="h-20 w-20 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-black text-white flex items-center justify-center">
                <UserCircle size={48} />
              </div>
            )}
            <button
              onClick={() => setIsEditingPhoto(true)}
              className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Change profile photo"
            >
              <Image size={16} />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
            <p className="text-gray-600">{userProfile.email}</p>
            <p className="text-sm mt-1">Role: {userProfile.role}</p>
          </div>
        </div>

        {isEditingPhoto && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Update Profile Photo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full border border-gray-200 rounded-lg p-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a direct image URL (ending in .jpg, .png, .gif, or .webp), or leave empty to remove current photo. We recommend using <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">postimages.org</a> to host your image.
                </p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleUpdatePhoto}
                  disabled={isPhotoLoading}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPhotoLoading ? 'Saving...' : 'Save Photo'}
                </button>
                <button
                  onClick={() => setIsEditingPhoto(false)}
                  disabled={isPhotoLoading}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
          <div className="mt-8">
            <button
              onClick={() => {
                signout();
                navigate('/');
              }}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {userProfile.role === 'admin' && (
        <div className="bg-white border border-black rounded-lg p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Admin Tools</h2>
          </div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600 mb-4">
                Manage user accounts, roles, and permissions. Review reports and moderate content.
              </p>
              <Link
                to="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200"
              >
                <Shield className="h-5 w-5 mr-2" />
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-black rounded-lg p-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
        {loading ? (
          <p className="text-center py-4">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg animate-scale-in">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">
              {userProfile.role === 'user' 
                ? 'Want to share your thoughts with the community?' 
                : 'Start sharing your thoughts with the community.'}
            </p>
            {userProfile.role === 'user' ? (
              <Link
                to="/apply-writer"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Apply to Become a Writer
              </Link>
            ) : (userProfile.role === 'admin' || userProfile.role === 'writer') && (
              <Link
                to="/create-post"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200"
              >
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-6 animate-fade-in hover:shadow-lg transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {post.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {post.status !== 'rejected' && (
                      <Link
                        to={`/post/${post.slug}/edit`}
                        className="p-2 text-gray-600 hover:text-black transition-colors duration-200"
                        title="Edit post"
                      >
                        <Pencil size={20} />
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                      title="Delete post"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {deleteConfirm === post.id && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-800 mb-2">
                      Are you sure you want to delete this post?
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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