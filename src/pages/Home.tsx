import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query, where, limit } from 'firebase/firestore';
import { db, getCachedData, setCachedData, checkRateLimit, invalidatePostCache } from '../lib/firebase';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Search } from 'lucide-react';
import { PostStatus } from '../types/user';
import SEO from '../components/SEO';
import { updateOldPosts } from '../utils/updateOldPosts';

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 10;

  const fetchPosts = useCallback(async () => {
    // Generate cache key based on page
    const cacheKey = `home-posts-${page}`;
    
    const cachedPosts = getCachedData(cacheKey);
    if (cachedPosts) {
      setPosts(prev => [...prev, ...cachedPosts]);
      setFilteredPosts(cachedPosts);
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      console.warn('Rate limit exceeded, using cached data if available');
      return;
    }

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(postsPerPage)
    );
    const snapshot = await getDocs(q);
    const postsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
    
    setPosts(prev => [...prev, ...postsData]);
    setFilteredPosts(postsData);
    setHasMore(postsData.length === postsPerPage);

    // Cache the results
    setCachedData(cacheKey, postsData);
  }, [page]);

  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    const init = async () => {
      await updateOldPosts();
      await fetchPosts();
    };
    init();
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
    <div>
      <SEO
        title="Home"
        description="Discover insightful articles and join meaningful discussions on INFOiyo."
        keywords="blog, articles, community, discussions, knowledge sharing"
      />
      
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-black rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      <div className="space-y-10">
        {filteredPosts.map((post) => (
          <article 
            key={post.id} 
            className="border border-black border-[1px] p-4 sm:p-6 rounded-lg hover-lift animate-fade-in"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 sm:mb-6"
                loading="lazy"
              />
            )}
            <Link to={`/post/${post.slug}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 hover:text-gray-600">{post.title}</h2>
            </Link>
            <div className="prose max-w-none line-clamp-3">
              <p>{post.excerpt || post.content.slice(0, 160)}</p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-sm text-gray-600">
              <span>By {post.author}</span>
              <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
            </div>
            <Link
              to={`/post/${post.slug}`}
              className="mt-4 inline-block text-sm hover:text-gray-600"
            >
              Read more →
            </Link>
          </article>
        ))}

        {filteredPosts.length === 0 && searchTerm && (
          <div className="text-center py-12 border border-black rounded-lg">
            <p className="text-xl font-semibold mb-2">No posts found</p>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}