import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { error, handleError, clearError } = useErrorHandler();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!email.trim() || !password.trim() || !username.trim()) {
        throw new Error('Please fill in all fields');
      }
      
      // Username validation
      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      if (username.length > 20) {
        throw new Error('Username must be less than 20 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }
      
      // Password validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      await signup(email, password, username);
      navigate('/');
    } catch (err) {
      handleError(handleApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold">Join INFOiyo</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-black rounded-lg sm:px-10 animate-scale-in">
          {error && <ErrorAlert message={error.message} onClose={clearError} />}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
                <span className="text-gray-500 text-xs ml-2">
                  (3-20 characters, letters, numbers, and underscores only)
                </span>
              </label>
              <input
                id="username"
                type="text"
                required
                pattern="^[a-zA-Z0-9_]+$"
                minLength={3}
                maxLength={20}
                className="mt-1 block w-full border border-black rounded-md shadow-sm p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full border border-black rounded-md shadow-sm p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full border border-black rounded-md shadow-sm p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-black rounded-md shadow-sm text-sm font-medium hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}