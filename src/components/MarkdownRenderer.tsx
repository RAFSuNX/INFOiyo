import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:mt-0 first:prose-headings:mt-0 ${className}`}
      components={{
        // Enhance image rendering
        img: ({node, ...props}) => (
          <div className="my-4">
            <img
              {...props}
              loading="lazy"
              className="rounded-lg max-w-full h-auto shadow-sm hover:shadow-md transition-shadow duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        ),
        // Style code blocks
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';
          return (
            <code
              className={`${className} ${
                inline 
                  ? 'bg-gray-100 rounded px-1 py-0.5 text-sm' 
                  : 'block bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm relative'
              }`}
              data-language={lang}
              {...props}
            >
              {!inline && lang && (
                <span className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded-bl">
                  {lang}
                </span>
              )}
              {children}
            </code>
          );
        },
        // Style tables
        table: ({node, children, ...props}) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-gray-200" {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({node, children, ...props}) => (
          <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left" {...props}>
            {children}
          </th>
        ),
        td: ({node, children, ...props}) => (
          <td className="border border-gray-200 px-4 py-2" {...props}>
            {children}
          </td>
        ),
        // Style blockquotes
        blockquote: ({node, children, ...props}) => (
          <blockquote
            className="border-l-4 border-black pl-4 italic my-6 text-gray-700 bg-gray-50 py-2 rounded-r"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Style headings
        h1: ({node, children, ...props}) => (
          <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>{children}</h1>
        ),
        h2: ({node, children, ...props}) => (
          <h2 className="text-2xl font-bold mt-6 mb-3" {...props}>{children}</h2>
        ),
        h3: ({node, children, ...props}) => (
          <h3 className="text-xl font-bold mt-5 mb-2" {...props}>{children}</h3>
        ),
        // Style links
        a: ({node, children, ...props}) => (
          <a
            className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        // Style lists
        ul: ({node, children, ...props}) => (
          <ul className="list-disc pl-6 my-4 space-y-2 marker:text-gray-500" {...props}>{children}</ul>
        ),
        ol: ({node, children, ...props}) => (
          <ol className="list-decimal pl-6 my-4 space-y-2 marker:text-gray-500" {...props}>{children}</ol>
        ),
        // Style paragraphs
        p: ({node, children, ...props}) => (
          <p className="my-4 leading-relaxed text-gray-800" {...props}>{children}</p>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}