import { generateArticleSchema, generateBreadcrumbSchema } from '../utils/seo';
import { Helmet } from 'react-helmet-async';

interface BlogPostSchemaProps {
  post: {
    title: string;
    content: string;
    author: string;
    createdAt: any;
    imageUrl?: string;
    slug: string;
  };
}

export default function BlogPostSchema({ post }: BlogPostSchemaProps) {
  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://infoyio.com' },
    { name: 'Blog', url: 'https://infoyio.com/blog' },
    { name: post.title, url: `https://infoyio.com/post/${post.slug}` }
  ]);

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}