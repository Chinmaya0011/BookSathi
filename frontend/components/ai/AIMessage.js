'use client';

import React, { useState } from 'react';
import { User as UserIcon, Copy, Check, Sparkles } from 'lucide-react';
import { AIResponseRenderer } from './AIResponseRenderer';
import { AIQuickActions } from './AIQuickActions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AIMessage({ msg, onPromptClick, onActionClick }) {
  const [copied, setCopied] = useState(false);
  if (!msg) return null;

  const isUser = msg.sender === 'user';

  const handleCopy = () => {
    const textToCopy = msg.text || msg.message || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Response copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col animate-in fade-in duration-150 group font-sans',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      {/* Message Author Meta Line */}
      <div
        className={cn(
          'flex items-center gap-1.5 mb-1 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isUser ? (
          <div className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-md bg-slate-700 text-white flex items-center justify-center shrink-0">
            <UserIcon className="w-2.5 h-2.5" />
          </div>
        )}

        <span className="text-[11px] font-bold text-slate-800">{msg.name}</span>
        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

        {!isUser && (
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer ml-1"
            title="Copy text"
            aria-label="Copy text"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Message Bubble Card */}
      <div
        className={cn(
          'max-w-[96%] sm:max-w-[92%] rounded-2xl text-xs leading-relaxed transition-all',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-xs px-4 py-2.5 font-normal ml-auto shadow-xs'
            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs p-3.5 mr-auto shadow-xs'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-line leading-relaxed text-white font-normal">{msg.text}</p>
        ) : (
          <AIResponseRenderer
            message={msg.message}
            sections={msg.sections}
            rawText={msg.text}
            onActionClick={onActionClick}
          />
        )}

        {/* Action Link Buttons */}
        {!isUser && msg.actions && msg.actions.length > 0 && (
          <AIQuickActions
            actions={msg.actions}
            onActionClick={onActionClick}
            className="mt-3"
          />
        )}

        {/* Interactive Quick Prompts Chips */}
        {!isUser && msg.prompts && msg.prompts.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
            {msg.prompts.map((p, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => onPromptClick && onPromptClick(p.replace(/^[^\w\s]+/, '').trim())}
                className="text-[11px] font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 hover:border-indigo-300 cursor-pointer text-left"
              >
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
