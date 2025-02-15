import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query, where, limit } from 'firebase/firestore';
import { db, getCachedData, setCachedData, checkRateLimit } from '../lib/firebase';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PostStatus } from '../types/user';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
  excerpt?: string;
  imageUrl?: string;
  author: string;
  createdAt: any;
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const cacheKey = 'explore-posts';
    
    const cachedPosts = getCachedData(cacheKey);
    if (cachedPosts) {
      setPosts(cachedPosts);
      setFilteredPosts(cachedPosts);
      setLoading(false);
      return;
    }

    if (!checkRateLimit()) {
      console.warn('Rate limit exceeded, using cached data if available');
      return;
    }

    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      
      setPosts(postsData);
      setFilteredPosts(postsData);
      setCachedData(cacheKey, postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const results = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(results);
  }, [searchTerm, posts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Explore"
        description="Explore articles and discussions on INFOiyo"
        keywords="explore, articles, blog posts, community content"
      />

      <div className="mb-6">
        <BackButton />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
            Explore Articles
          </h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-base border border-black rounded-full focus:ring-2 focus:ring-black focus:outline-none shadow-sm hover:shadow-md transition-all duration-300 glass"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group border border-black p-6 rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in glass"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  key={post.imageUrl}
                  alt={post.title}
                  className={`w-full h-48 object-cover rounded-lg mb-6 transform group-hover:scale-105 transition-transform duration-300 ${imageErrors[post.id] ? 'hidden' : ''}`}
                  onError={() => setImageErrors(prev => ({ ...prev, [post.id]: true }))}
                  loading="lazy"
                />
              )}
              <Link to={`/post/${post.slug}`}>
                <h2 className="text-xl font-bold mb-3 group-hover:text-gray-600 line-clamp-2 transition-colors duration-300">{post.title}</h2>
              </Link>
              <div className="text-gray-600 text-sm mb-6 line-clamp-3">
                {post.excerpt || <MarkdownRenderer content={post.content.slice(0, 160)} />}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-200 pt-4">
                <span className="font-medium">By {post.author}</span>
                <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-12 border border-black rounded-lg">
          <p className="text-xl font-semibold mb-2">No articles found</p>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}