import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PenLine, UserCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'writer';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-black z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center hover:text-gray-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <PenLine className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">INFOiyo</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className="hover:text-gray-600 transition-colors duration-200">
                Home
              </Link>
              <Link to="/chat" className="hover:text-gray-600 transition-colors duration-200">
                Chat
              </Link>
              {canCreatePost && (
                <Link to="/create-post" className="hover:text-gray-600 transition-colors duration-200">
                  Create Post
                </Link>
              )}
              {user ? (
                <Link to="/profile" className="flex items-center hover:text-gray-600 transition-colors duration-200">
                  {userProfile?.photoURL ? (
                    <img
                      key={userProfile.photoURL}
                      src={userProfile.photoURL}
                      alt={user.displayName || ''}
                      className={`h-8 w-8 rounded-full object-cover ${imageError ? 'hidden' : ''}`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        setImageError(true);
                        if (user) {
                          const userRef = doc(db, 'users', user.uid);
                          updateDoc(userRef, { photoURL: null });
                        }
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                      <UserCircle className="h-5 w-5" />
                    </div>
                  )}
                  <span className="ml-2">{user.displayName}</span>
                </Link>
              ) : (
                <>
                  <Link to="/signin" className="hover:text-gray-600 transition-colors duration-200">
                    Sign In
                  </Link>
                  <Link to="/signup" className="hover:text-gray-600 transition-colors duration-200">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-200 sm:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-200 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-16 border-b border-black flex items-center justify-between px-4">
            <span className="text-lg font-bold">Menu</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {user && (
              <div className="flex items-center space-x-4 mb-6">
                {userProfile?.photoURL ? (
                  <img
                    key={userProfile.photoURL}
                    src={userProfile.photoURL}
                    alt={user.displayName || ''}
                    className={`h-12 w-12 rounded-full object-cover ${imageError ? 'hidden' : ''}`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      setImageError(true);
                      if (user) {
                        const userRef = doc(db, 'users', user.uid);
                        updateDoc(userRef, { photoURL: null });
                      }
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center">
                    <UserCircle className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/chat"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Chat
              </Link>
              {canCreatePost && (
                <Link
                  to="/create-post"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Post
                </Link>
              )}
              {user ? (
                <Link
                  to="/profile"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className="h-16" />
    </>
  );
}