import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from '../components/ErrorAlert';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, handleError, clearError } = useErrorHandler();
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please fill in all fields');
      }
      await signin(email, password);
      navigate('/');
    } catch (err) {
      handleError(handleApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold">Sign In to INFOiyo</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-black rounded-lg sm:px-10 animate-scale-in">
          {error && <ErrorAlert message={error.message} onClose={clearError} />}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}