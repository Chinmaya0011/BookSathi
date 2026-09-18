'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, Crown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIChatInput({
  input,
  setInput,
  onSend,
  loading = false,
  isExhausted = false,
  remaining = 10,
  limit = 10,
  isUnlimited = false,
  role = 'GUEST',
  plan = 'FREE',
  suggestions = [],
  onSelectSuggestion,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height as content expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading && !isExhausted) {
        onSend();
      }
    }
  };

  return (
    <div className="bg-white border-t border-slate-200/90 p-3 shrink-0 select-none">
      {/* Dynamic Prompt Suggestion Pills above input */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1.5 no-scrollbar">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion && onSelectSuggestion(s)}
              className="text-[11px] font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-lg border border-slate-200/90 hover:border-indigo-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading && !isExhausted) {
            onSend();
          }
        }}
        className="relative bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 focus-within:bg-white transition-all flex flex-col p-2"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isExhausted
              ? 'Daily AI limit reached (resets at midnight IST)...'
              : 'Ask BookSaathi AI anything...'
          }
          disabled={isExhausted || loading}
          className="w-full bg-transparent border-0 outline-hidden resize-none text-xs text-slate-900 placeholder-slate-400 font-medium py-1 px-1.5 max-h-28 overflow-y-auto leading-relaxed"
        />

        {/* Action Row inside input dock */}
        <div className="flex items-center justify-between pt-1 px-1 mt-0.5">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="hidden sm:inline">Enter to send • Shift+Enter for new line</span>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading || isExhausted}
            className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0 shadow-xs"
            title="Send Message"
            aria-label="Send Message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Footer Meta & Quota Status */}
      <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>Role-Isolated • DPDP Compliant</span>
        </span>

        <div className="flex items-center gap-1.5">
          {isUnlimited ? (
            <span className="text-emerald-700 font-bold">Unlimited Quota</span>
          ) : (
            <span className={cn(isExhausted ? 'text-rose-600 font-bold' : 'text-slate-600')}>
              {remaining} / {limit} left today
            </span>
          )}

          {role === 'PROFESSIONAL' && plan === 'FREE' && (
            <Link
              href="/dashboard/subscription"
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 ml-1 underline"
            >
              <Crown className="w-2.5 h-2.5" />
              <span>Pro (25/day)</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
