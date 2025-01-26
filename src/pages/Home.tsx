import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Search } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  createdAt: any;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      setPosts(postsData);
      setFilteredPosts(postsData);
    };

    fetchPosts();
  }, []);

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
        {filteredPosts.map(post => (
          <article key={post.id} className="border border-black border-[1px] p-6 rounded-lg">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <Link to={`/post/${post.id}`}>
              <h2 className="text-2xl font-bold mb-4 hover:text-gray-600">{post.title}</h2>
            </Link>
            <div className="prose max-w-none line-clamp-3">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>By {post.author}</span>
              <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
            </div>
            <Link
              to={`/post/${post.id}`}
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