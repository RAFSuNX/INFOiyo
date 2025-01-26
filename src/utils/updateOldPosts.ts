import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { slugify } from './slugify';
import { PostStatus } from '../types/user';

export async function updateOldPosts() {
  const postsRef = collection(db, 'posts');
  const snapshot = await getDocs(postsRef);
  
  for (const doc_ of snapshot.docs) {
    const post = doc_.data();
    const updates: { slug?: string; status?: PostStatus } = {};
    
    // Add slug if missing
    if (!post.slug) {
      let slug = slugify(post.title);
      
      // Check for duplicate slugs
      const slugQuery = await getDocs(collection(db, 'posts'));
      const existingSlugs = slugQuery.docs
        .map(d => d.data().slug)
        .filter(Boolean);
      
      // If slug exists, append the document ID
      if (existingSlugs.includes(slug)) {
        slug = `${slug}-${doc_.id}`;
      }
      updates.slug = slug;
    }

    // Add status if missing
    if (!post.status) {
      updates.status = 'approved' as PostStatus;
    }

    // Update the post if there are any changes
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'posts', doc_.id), updates);
    }
  }
}