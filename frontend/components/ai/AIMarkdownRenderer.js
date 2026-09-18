'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function AIMarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;

  return (
    <div className={cn('prose-xs max-w-none text-slate-900 leading-relaxed overflow-x-auto font-sans', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-sm font-bold text-slate-900 mt-2 mb-1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xs font-bold text-slate-900 mt-2 mb-1 flex items-center gap-1.5 border-b border-slate-100 pb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-slate-900 mt-1.5 mb-0.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 font-normal" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-1.5 text-slate-800 ml-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-1.5 text-slate-800 ml-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-indigo-500 pl-3 py-1 my-2 bg-indigo-50/60 rounded-r-lg text-slate-800 italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2.5 rounded-xl border border-slate-200 shadow-2xs bg-white">
              <table className="w-full text-xs text-left border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-[11px] font-bold text-slate-900 whitespace-nowrap" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-t border-slate-100 text-slate-800 hover:bg-slate-50/80 transition-colors whitespace-nowrap sm:whitespace-normal" {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className="bg-slate-100 text-indigo-700 font-mono text-[11px] px-1.5 py-0.5 rounded-md font-semibold border border-slate-200"
                {...props}
              />
            ) : (
              <code
                className="block bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto my-2 shadow-inner"
                {...props}
              />
            ),
          a: ({ node, ...props }) => (
            <a
              className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
