import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db, getCachedData, setCachedData, checkRateLimit, invalidatePostCache } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import BlogPostSchema from '../components/BlogPostSchema';
import { AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  author: string;
  createdAt: any;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
}

export default function ViewPost() {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { slug } = useParams();
  const [postId, setPostId] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      // Check cache first
      const cacheKey = `post-${slug}`;
      const cachedPost = getCachedData(cacheKey);
      if (cachedPost) {
        setPost(cachedPost);
        setPostId(cachedPost.id);
        return;
      }

      // Check rate limit
      if (!checkRateLimit()) {
        console.warn('Rate limit exceeded, using cached data if available');
        return;
      }

      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('slug', '==', slug));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const postDoc = snapshot.docs[0];
          setPostId(postDoc.id);
          setPost({ id: postDoc.id, ...postDoc.data() } as Post);
          
          // Cache the results
          setCachedData(cacheKey, { id: postDoc.id, ...postDoc.data() });
        } else {
          // Try fetching by ID for backward compatibility with old posts
          const postDoc = await getDoc(doc(db, 'posts', slug));
          if (postDoc.exists()) {
            setPostId(postDoc.id);
            setPost({ id: postDoc.id, ...postDoc.data() } as Post);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (postId) {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Comment));
        setComments(commentsData);
      });

      return () => unsubscribe();
    }
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postId || !newComment.trim()) return;
    
    // Rate limit check for comments
    if (!checkRateLimit()) {
      alert('Please wait a moment before posting another comment.');
      return;
    }

    if (!user.emailVerified) {
      alert('Please verify your email before commenting.');
      return;
    }

    if (userProfile?.status === 'banned') {
      alert('You have been banned from commenting.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Sanitize comment content
      const sanitizedComment = newComment.trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit comment length
      
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        content: sanitizedComment,
        author: user.displayName,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      
      // Invalidate post cache after new comment
      invalidatePostCache();
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-12">Post not found</div>;
  }

  const renderCommentForm = () => {
    if (!user) {
      return (
        <div className="p-6 bg-gray-50 border border-black rounded-lg text-center">
          <p className="text-gray-800 mb-4">Join the discussion</p>
          <a 
            href="/signin" 
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200"
          >
            Sign in to comment
          </a>
        </div>
      );
    }

    if (!user.emailVerified) {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-800">Email Verification Required</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            Please verify your email address to join the discussion.
          </p>
          <button
            onClick={() => user.sendEmailVerification()}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition duration-200"
          >
            Resend Verification Email
          </button>
        </div>
      );
    }

    if (userProfile?.status === 'banned') {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-800">Account Restricted</h3>
          </div>
          <p className="text-red-700">
            Your account has been restricted from commenting.
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmitComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full border border-black rounded-lg p-4 min-h-[120px] mb-4 focus:ring-2 focus:ring-black focus:outline-none transition duration-200"
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition duration-200"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <article className="max-w-4xl mx-auto px-4 overflow-x-hidden">
      <SEO
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        keywords={`${post.title.toLowerCase()}, ${post.author.toLowerCase()}, blog, article, infoyio`}
        image={post.imageUrl}
        article={true}
        pathname={`/post/${slug}`}
      />
      
      <BlogPostSchema post={post} />
      
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{post.title}</h1>
      
      <div className="mb-6 text-sm text-gray-600">
        <span>By {post.author}</span>
        <span className="mx-2">•</span>
        <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg mb-6 sm:mb-8"
        />
      )}

      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-8 sm:mb-12 overflow-x-auto">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => (
              <img 
                {...props} 
                loading="lazy"
                className="rounded-lg max-w-full h-auto"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-12 border-t border-black pt-8">
        <h2 className="text-2xl font-bold mb-4">Discussion ({comments.length})</h2>
        <p className="text-gray-600 mb-8">Join the conversation with our community.</p>

        <div className="space-y-8 mb-12">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No comments yet</p>
              <p className="text-sm text-gray-500">Be the first to share what you think!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-medium">
                      {comment.author[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{comment.author}</div>
                      <div className="text-sm text-gray-500">
                        {comment.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold mb-4">Leave a comment</h3>
          {renderCommentForm()}
        </div>
      </div>
    </article>
  );
}