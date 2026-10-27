import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

/**
 * CodeBlock component with syntax-styled container and copy-to-clipboard functionality.
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '0.875rem 0', borderRadius: 12, overflow: 'hidden', background: '#090d16', border: '1px solid #1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', background: '#111827', borderBottom: '1px solid #1f2937', fontSize: '0.75rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <Terminal size={13} color="#38bdf8" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#34d399' : '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, transition: 'all 0.15s' }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto', fontSize: '0.85rem', lineHeight: 1.6, color: '#f1f5f9', fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * TableBlock parses markdown tables into styled responsive HTML tables.
 */
function TableBlock({ rows }) {
  if (!rows || rows.length === 0) return null;
  const headerRow = rows[0];
  const bodyRows = rows.slice(1).filter(r => !r.every(cell => cell.match(/^[-:]+$/)));

  return (
    <div style={{ overflowX: 'auto', margin: '0.875rem 0', borderRadius: 10, border: '1px solid var(--surface-3)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--surface-1)', borderBottom: '1.5px solid var(--surface-3)' }}>
            {headerRow.map((cell, idx) => (
              <th key={idx} style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {renderInline(cell.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: '1px solid var(--surface-2)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                  {renderInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Inlines: bold, italic, code badges, links
 */
function renderInline(text) {
  if (!text) return null;

  // Split by inline markdown tokens: `code`, **bold**, *italic*, [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} style={{
          background: 'rgba(99, 102, 241, 0.08)',
          color: 'var(--brand-600, #4f46e5)',
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: '0.875em',
          fontWeight: 700,
          fontFamily: 'Consolas, Monaco, monospace',
          border: '1px solid rgba(99, 102, 241, 0.15)'
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{renderInline(part.slice(2, -2))}</strong>;
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return <em key={index} style={{ fontStyle: 'italic' }}>{renderInline(part.slice(1, -1))}</em>;
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-600, #4f46e5)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
          {linkMatch[1]} <ExternalLink size={11} />
        </a>
      );
    }

    return part;
  });
}

/**
 * Main FormattedChatMessage component
 */
export default function FormattedChatMessage({ content, isUser = false }) {
  if (!content) return null;

  if (isUser) {
    return (
      <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'white' }}>
        {content}
      </p>
    );
  }

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced Code Block (```lang ... ```)
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <CodeBlock key={`code-${elements.length}`} code={codeLines.join('\n')} language={language} />
      );
      continue;
    }

    // 2. Markdown Table (| col1 | col2 |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const row = lines[i].split('|').slice(1, -1);
        tableRows.push(row);
        i++;
      }
      elements.push(
        <TableBlock key={`table-${elements.length}`} rows={tableRows} />
      );
      continue;
    }

    // 3. Horizontal Rules (---, ***, ___)
    if (line.trim().match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      elements.push(
        <hr key={`hr-${elements.length}`} style={{ border: 'none', borderTop: '1px solid var(--surface-3)', margin: '1rem 0' }} />
      );
      i++;
      continue;
    }

    // 4. Headings (#, ##, ###, ####)
    if (line.trim().startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0 0.4rem', lineHeight: 1.3 }}>
          {renderInline(line.trim().slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '1.25rem 0 0.5rem', lineHeight: 1.3 }}>
          {renderInline(line.trim().slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '1.5rem 0 0.6rem', lineHeight: 1.3, borderBottom: '1px solid var(--surface-3)', paddingBottom: '0.35rem' }}>
          {renderInline(line.trim().slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elements.length}`} style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: '1.5rem 0 0.75rem', lineHeight: 1.25 }}>
          {renderInline(line.trim().slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // 5. Blockquotes (> quote)
    if (line.trim().startsWith('> ')) {
      const quoteLines = [line.trim().slice(2)];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={`quote-${elements.length}`} style={{ margin: '0.75rem 0', padding: '0.5rem 1rem', borderLeft: '3px solid var(--brand-500)', background: 'var(--surface-1)', borderRadius: '0 8px 8px 0', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} style={{ margin: 0, lineHeight: 1.55 }}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 5. Unordered List Items (- item or * item)
    if (line.match(/^(\s*)[-*]\s+(.*)$/)) {
      const listItems = [];
      while (i < lines.length) {
        const match = lines[i].match(/^(\s*)[-*]\s+(.*)$/);
        if (!match) break;
        listItems.push(match[2]);
        i++;
      }
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '0.6rem 0', paddingLeft: '1.25rem', listStyleType: 'disc', color: 'var(--text-primary)' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.35rem' }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Ordered List Items (1. item)
    if (line.match(/^(\s*)\d+\.\s+(.*)$/)) {
      const listItems = [];
      while (i < lines.length) {
        const match = lines[i].match(/^(\s*)\d+\.\s+(.*)$/);
        if (!match) break;
        listItems.push(match[2]);
        i++;
      }
      elements.push(
        <ol key={`ol-${elements.length}`} style={{ margin: '0.6rem 0', paddingLeft: '1.25rem', color: 'var(--text-primary)' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.35rem' }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Regular paragraph / text line
    if (line.trim() === '') {
      elements.push(<div key={`spacer-${elements.length}`} style={{ height: '0.5rem' }} />);
      i++;
      continue;
    }

    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !lines[i].match(/^(\s*)[-*]\s+/) &&
      !lines[i].match(/^(\s*)\d+\.\s+/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    elements.push(
      <p key={`p-${elements.length}`} style={{ margin: '0.4rem 0', fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
        {paraLines.map((pl, plIdx) => (
          <React.Fragment key={plIdx}>
            {renderInline(pl)}
            {plIdx < paraLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return <div style={{ wordBreak: 'break-word' }}>{elements}</div>;
}
