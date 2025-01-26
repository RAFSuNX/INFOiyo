import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
  pathname?: string;
  keywords?: string;
}

export default function SEO({ title, description, image, article, pathname, keywords }: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://infoyio.cc';
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const seo = {
    title: title ? `${title} | INFOiyo` : 'INFOiyo | Engage. Focus. Immerse.',
    description: description || 'Discover insightful articles and join meaningful discussions.',
    image: image || defaultImage,
    url: `${siteUrl}${pathname || ''}`,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="INFOiyo" />
      <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION} />
      <meta name="msvalidate.01" content={import.meta.env.VITE_BING_SITE_VERIFICATION} />

      {/* Performance Meta Tags */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

      {/* PWA Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="INFOiyo" />
      <meta name="application-name" content="INFOiyo" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="theme-color" content="#000000" />

      {/* Social Media Meta Tags */}
      <meta name="author" content="INFOiyo" />
      <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      {/* OpenGraph Meta Tags */}
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="INFOiyo" />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      {article && (
        <>
          <meta property="article:published_time" content={new Date().toISOString()} />
          <meta property="article:author" content={`${siteUrl}/author`} />
          <meta property="article:section" content="Blog" />
          {keywords && <meta property="article:tag" content={keywords} />}
        </>
      )}

      {/* Twitter Meta Tags */}
      {article && <meta property="og:type" content="article" />}

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:site" content="@infoyio" />
      <meta name="twitter:creator" content="@infoyio" />

      {/* RSS Feed */}
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title="INFOiyo Blog RSS Feed" 
        href="/rss.xml" 
      />

      {/* JSON-LD for Website */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'INFOiyo',
          'url': siteUrl,
          'description': 'Discover insightful articles and join meaningful discussions.',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}
      </script>

      {/* JSON-LD for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'INFOiyo',
          'url': siteUrl,
          'logo': `${siteUrl}/logo512.png`,
          'sameAs': [
            'https://twitter.com/infoyio',
            'https://facebook.com/infoyio',
            'https://linkedin.com/company/infoyio'
          ]
        })}
      </script>

      {/* Additional SEO Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="INFOiyo" />
      <meta name="application-name" content="INFOiyo" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="theme-color" content="#000000" />
      
      {/* JSON-LD for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'INFOiyo',
          'url': siteUrl,
          'logo': `${siteUrl}/logo512.png`,
          'sameAs': [
            'https://twitter.com/infoyio',
            'https://facebook.com/infoyio',
            'https://linkedin.com/company/infoyio'
          ]
        })}
      </script>
      
      {/* JSON-LD for WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'INFOiyo',
          'url': siteUrl,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}
      </script>
    </Helmet>
  );
}