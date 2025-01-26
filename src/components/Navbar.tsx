import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PenLine, UserCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';

export default function Navbar() {
  const { user, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'writer';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <nav className="border-b border-black sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:text-gray-600">
              <PenLine className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">INFOiyo</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/chat" className="hover:text-gray-600">Chat</Link>
            {canCreatePost && (
              <Link to="/create-post" className="hover:text-gray-600">Create Post</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center hover:text-gray-600">
                  {userProfile?.photoURL ? (
                    <img
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '';
                        target.onerror = null;
                        if (user) {
                          const userRef = doc(db, 'users', user.uid);
                          updateDoc(userRef, { photoURL: null });
                        }
                      }}
                      src={userProfile.photoURL}
                      alt={user.displayName || ''}
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                      <UserCircle className="h-5 w-5" />
                    </div>
                  )}
                  <span className="ml-2">{user.displayName}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin" className="hover:text-gray-600">Sign In</Link>
                <Link to="/signup" className="hover:text-gray-600">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-4 hover:bg-gray-100 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className="block px-3 py-4 hover:bg-gray-100 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
            {canCreatePost && (
              <Link to="/create-post" className="block px-3 py-2 hover:bg-gray-100">Create Post</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center px-3 py-2 hover:bg-gray-100">
                  {userProfile?.photoURL ? (
                    <img
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '';
                        target.onerror = null;
                        if (user) {
                          const userRef = doc(db, 'users', user.uid);
                          updateDoc(userRef, { photoURL: null });
                        }
                      }}
                      src={userProfile.photoURL}
                      alt={user.displayName || ''}
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                      <UserCircle className="h-5 w-5" />
                    </div>
                  )}
                  <span className="ml-2">Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin" className="block px-3 py-2 hover:bg-gray-100">Sign In</Link>
                <Link to="/signup" className="block px-3 py-2 hover:bg-gray-100">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}