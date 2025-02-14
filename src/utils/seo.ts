/**
 * Generates meta description from content
 * Strips markdown and trims to appropriate length
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove markdown syntax
  let plainText = content
    .replace(/#{1,6}\s/g, '')           // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/[*_~`]/g, '')             // Remove emphasis markers
    .replace(/\n/g, ' ')                // Replace newlines with spaces
    .trim();

  // Trim to maxLength while keeping whole words
  if (plainText.length > maxLength) {
    plainText = plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  }

  return plainText;
}

/**
 * Extracts keywords from content
 * Uses title and content to generate relevant keywords
 */
export function extractKeywords(title: string, content: string): string {
  // Combine title and content
  const text = `${title} ${content}`.toLowerCase();
  
  // Remove markdown and special characters
  const cleanText = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into words and filter common words
  const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
  const words = cleanText.split(' ').filter(word => 
    word.length > 2 && !commonWords.has(word)
  );

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sort by frequency and get top keywords
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return sortedWords.join(', ');
}

/**
 * Generates structured data for a blog post
 */
export function generateArticleSchema(post: {
  title: string;
  content: string;
  author: string;
  createdAt: any;
  imageUrl?: string;
  slug: string;
}) {
  const siteUrl = 'https://infoiyo.cc';
  const description = post.content.length > 160 ? post.content.slice(0, 157) + '...' : post.content;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    image: post.imageUrl,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'INFOiyo',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo512.png`
      }
    },
    datePublished: post.createdAt?.toDate().toISOString(),
    dateModified: post.createdAt?.toDate().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/post/${post.slug}`
    }
  };
}

/**
 * Generates breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string; }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generates structured data for the website
 */
export function generateWebsiteSchema() {
  const siteUrl = 'https://infoiyo.cc';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'INFOiyo',
    'url': siteUrl,
    'description': 'The premier platform for engaging discussions and insightful content.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/explore?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates structured data for the organization
 */
export function generateOrganizationSchema() {
  const siteUrl = 'https://infoiyo.cc';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'INFOiyo',
    'url': siteUrl,
    'logo': `${siteUrl}/logo512.png`,
    'sameAs': [
      'https://twitter.com/infoiyo',
      'https://facebook.com/infoiyo',
      'https://linkedin.com/company/infoiyo'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': 'team@infoiyo.cc'
    }
  };
}