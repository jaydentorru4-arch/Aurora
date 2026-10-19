import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed break-words space-y-3">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-white mt-3 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B]" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-white/90 mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 text-[#E2E8F0] last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-2 space-y-1 text-[#CBD5E1]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-2 space-y-1 text-[#CBD5E1]">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#FF2D2B]/70 pl-3.5 py-1 my-2 bg-white/[0.02] text-[#94A3B8] italic rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38BDF8] hover:text-[#7DD3FC] underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[#161B33] text-[#F43F5E] font-mono text-xs border border-white/10"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={codeString} language={match ? match[1] : ''} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy code:', e);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-[#070914] shadow-xl group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0C1024] border-b border-white/5 text-xs text-[#94A3B8] font-mono">
        <span className="uppercase tracking-wider text-[11px] text-[#A5B4FC]">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-[13px] font-mono text-[#E2E8F0] leading-relaxed">
        <pre className="m-0 p-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
