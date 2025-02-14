import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PenLine, MessageCircle, UserPlus, LogIn } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { generateWebsiteSchema, generateOrganizationSchema } from '../utils/seo';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50">
      <SEO
        title="Home"
        description="INFOiyo - The premier platform for engaging discussions and insightful content. Join our community to share knowledge and explore ideas."
        keywords="blog, articles, community, discussions, knowledge sharing"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      
      <h1 className="text-center mb-12">
        <span className="flex items-center justify-center text-4xl sm:text-5xl font-bold">
          <PenLine className="h-12 w-12 sm:h-16 sm:w-16" />
          <span className="ml-4 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">INFOiyo</span>
        </span>
        <span className="sr-only">- The Premier Platform for Knowledge Sharing</span>
      </h1>
      
      <h2 className="text-xl sm:text-2xl text-gray-600 mb-4 text-center max-w-2xl">
        Discover, Share, and Engage with Quality Content
      </h2>
      
      <h3 className="text-lg text-gray-500 mb-8 text-center max-w-2xl">
        Join our community of writers and readers to explore insightful articles and meaningful discussions
      </h3>

      <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-4 pl-12 text-lg border border-black rounded-full focus:ring-2 focus:ring-black focus:outline-none shadow-sm hover:shadow-md transition-all duration-300 glass"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
          >
            Search
          </button>
        </div>
      </form>
      
      <nav className="flex flex-wrap justify-center gap-4 animate-fade-in">
        <Link
          to="/explore"
          className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
        >
          Explore Articles
        </Link>
        <Link
          to="/markdown-guide"
          className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
        >
          Writing Guide
        </Link>
        <Link
          to="/chat"
          className="inline-flex items-center px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat
        </Link>
        {!user && (
          <>
            <Link
              to="/signin"
              className="inline-flex items-center px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}