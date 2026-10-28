import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Safe, zero-dependency Markdown renderer.
 * Converts markdown blocks and inlines into native React JSX elements.
 * Never uses dangerouslySetInnerHTML, completely preventing XSS attacks.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Split into block paragraphs separated by double newlines or lines
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];

  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push(
        <ul
          key={`list-${blocks.length}`}
          className="list-disc list-inside space-y-1.5 my-3 text-xs md:text-sm text-ink/90 font-light"
        >
          {currentListItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentListItems.push(line.slice(2).trim());
      continue;
    }

    flushList();

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-medium text-ink pt-3 pb-1"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2-${i}`}
          className="text-base md:text-lg font-light text-ink pt-4 pb-1.5 border-b border-line/40"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1-${i}`}
          className="text-xl md:text-2xl font-light text-ink pt-2 pb-2"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
    } else {
      // Normal paragraph
      blocks.push(
        <p
          key={`p-${i}`}
          className="my-2.5 text-xs md:text-sm text-ink/90 font-light leading-relaxed"
        >
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className={`space-y-1 text-left ${className}`}>{blocks}</div>;
};

/**
 * Parses inline formatting:
 * - Bold: **text**
 * - Italic: *text*
 * - Links: [label](url) where url is validated against javascript: schemes
 */
function renderInline(text: string): React.ReactNode {
  // Regex matches [label](url), **bold**, or *italic*
  const pattern = /(!?\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];

    // Markdown Link [text](url)
    if (fullMatch.startsWith('[') && match[2] && match[3]) {
      const label = match[2];
      const url = match[3].trim();

      // Disallow dangerous schemes like javascript: or data:
      const isSafe =
        url.startsWith('/') ||
        url.startsWith('https://') ||
        url.startsWith('http://') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:');

      if (isSafe) {
        const isExternal = url.startsWith('http') || url.startsWith('mailto:');
        nodes.push(
          <a
            key={match.index}
            href={url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-accent hover:underline font-normal transition-colors"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    }
    // Bold **text**
    else if (fullMatch.startsWith('**') && match[4]) {
      nodes.push(
        <strong key={match.index} className="font-medium text-ink">
          {match[4]}
        </strong>
      );
    }
    // Italic *text*
    else if (fullMatch.startsWith('*') && match[5]) {
      nodes.push(
        <em key={match.index} className="italic">
          {match[5]}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}

export default MarkdownRenderer;
