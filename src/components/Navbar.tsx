import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X, PenLine, UserCircle, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, userProfile, signout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'writer';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <nav className="border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <PenLine className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">INFOiyo</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/chat" className="flex items-center hover:text-gray-600">
              <MessageCircle className="h-5 w-5 mr-1" />
              <span>Chat</span>
            </Link>
            {canCreatePost && (
              <Link to="/create-post" className="hover:text-gray-600">Create Post</Link>
            )}
            {isAdmin && (
              <Link to="/admin/users" className="flex items-center hover:text-gray-600">
                <Shield className="h-5 w-5 mr-1" />
                <span>Users</span>
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center hover:text-gray-600">
                  <UserCircle className="h-5 w-5 mr-1" />
                  <span>{user.displayName}</span>
                </Link>
                <button onClick={() => signout()} className="hover:text-gray-600">Sign Out</button>
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
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 hover:bg-gray-100">Home</Link>
            <Link to="/chat" className="block px-3 py-2 hover:bg-gray-100">Chat</Link>
            {canCreatePost && (
              <Link to="/create-post" className="block px-3 py-2 hover:bg-gray-100">Create Post</Link>
            )}
            {isAdmin && (
              <Link to="/admin/users" className="block px-3 py-2 hover:bg-gray-100">
                Manage Users
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 hover:bg-gray-100">Profile</Link>
                <button onClick={() => signout()} className="block w-full text-left px-3 py-2 hover:bg-gray-100">
                  Sign Out
                </button>
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