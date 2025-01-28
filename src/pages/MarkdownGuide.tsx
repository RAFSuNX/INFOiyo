import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Book, Layout, Type, ListOrdered, Link as LinkIcon, Image, Code, Table } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function MarkdownGuide() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const examples = {
    headers: {
      markdown: `# Main Title (H1)
## Section Title (H2)
### Subsection (H3)
#### Smaller Section (H4)
##### Even Smaller (H5)
###### Smallest (H6)`,
      description: "Headers help structure your content hierarchically. Use # symbols to create different levels of headings."
    },
    emphasis: {
      markdown: `Regular text
**Bold text**
*Italic text*
***Bold and italic text***
~~Strikethrough text~~
> Blockquote
>> Nested blockquote`,
      description: "Use various symbols to add emphasis and style to your text."
    },
    lists: {
      markdown: `- Unordered list item
- Another item
  - Nested item
  - Another nested item
    - Even deeper

1. First ordered item
2. Second item
   1. Nested ordered item
   2. Another nested item
3. Third item`,
      description: "Create organized content with ordered and unordered lists. Nest them for hierarchical information."
    },
    links: {
      markdown: `[Basic link](https://example.com)
[Link with title](https://example.com "Hover over me!")

Reference-style links:
[Link text][reference]
[Another link][1]

[reference]: https://example.com
[1]: https://example.com/another`,
      description: "Links help connect your content to other resources. Use them to reference external content or other sections of your post."
    },
    images: {
      markdown: `![Alt text for image](https://example.com/image.jpg)
![Alt text with title](https://example.com/image.jpg "Image title")

Reference-style images:
![Alt text][image-id]

[image-id]: https://example.com/image.jpg`,
      description: "Images make your content more engaging. Always include descriptive alt text for accessibility."
    },
    code: {
      markdown: `Inline \`code\` in a sentence

\`\`\`javascript
// Code block with syntax highlighting
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`css
/* CSS example */
.container {
  display: flex;
  justify-content: center;
}
\`\`\``,
      description: "Share code snippets with syntax highlighting. Use inline code for short references and code blocks for longer examples."
    },
    tables: {
      markdown: `| Header 1 | Header 2 | Header 3 |
|-----------|-----------|-----------|
| Cell 1    | Cell 2    | Cell 3    |
| Cell 4    | Cell 5    | Cell 6    |
| Left      | Center    | Right     |
| aligned   | aligned   | aligned   |`,
      description: "Tables help organize structured data. Use alignment options to control how content is displayed."
    }
  };

  const sections = [
    { id: 'headers', icon: Type, title: 'Headers' },
    { id: 'emphasis', icon: Layout, title: 'Text Emphasis' },
    { id: 'lists', icon: ListOrdered, title: 'Lists' },
    { id: 'links', icon: LinkIcon, title: 'Links' },
    { id: 'images', icon: Image, title: 'Images' },
    { id: 'code', icon: Code, title: 'Code' },
    { id: 'tables', icon: Table, title: 'Tables' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      
      <div className="flex items-center gap-3 mb-8">
        <Book className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Markdown Writing Guide</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-black rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedExample(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedExample === section.id
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white border border-black rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Tips for Great Writing</h2>
            <ul className="space-y-3 text-sm">
              <li>• Use headers to create clear sections</li>
              <li>• Break long paragraphs into smaller chunks</li>
              <li>• Include relevant images to illustrate points</li>
              <li>• Use code blocks for technical content</li>
              <li>• Preview your content before publishing</li>
              <li>• Add links to reference sources</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-black rounded-lg p-6">
            {selectedExample ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {sections.find(s => s.id === selectedExample)?.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {examples[selectedExample as keyof typeof examples].description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Markdown</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <code>{examples[selectedExample as keyof typeof examples].markdown}</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Preview</h3>
                    <div className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-gray-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {examples[selectedExample as keyof typeof examples].markdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a Topic</h2>
                <p className="text-gray-600">
                  Choose a section from the navigation menu to see examples and previews.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}