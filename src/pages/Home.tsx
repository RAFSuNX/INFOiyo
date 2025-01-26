import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-10">
      {posts.map(post => (
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
    </div>
  );
}