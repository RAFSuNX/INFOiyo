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
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://infoyio.cc';
  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/post/${post.slug}` }
  ]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{post.title} | INFOiyo</title>
      <meta name="description" content={post.content.slice(0, 160)} />
      <link rel="canonical" href={`${siteUrl}/post/${post.slug}`} />
      
      {/* OpenGraph Meta Tags */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.content.slice(0, 160)} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`${siteUrl}/post/${post.slug}`} />
      {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
      <meta property="article:published_time" content={post.createdAt?.toDate().toISOString()} />
      <meta property="article:author" content={post.author} />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.content.slice(0, 160)} />
      {post.imageUrl && <meta name="twitter:image" content={post.imageUrl} />}
      
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}