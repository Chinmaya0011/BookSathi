'use client';

import { useState } from 'react';
import { Share2, Check, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function LinkedInIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34M7.86 18.5V10.13H5.07V18.5h2.79Z" />
    </svg>
  );
}

function XTwitterIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function BlogShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? window.location.href : url || 'https://booksaathi.in/blog';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`*${title}*\n\nRead this guide on BookSaathi: ${fullUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`${title} via @BookSaathi`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`, '_blank');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs my-8">
      <div className="flex items-center gap-2 font-bold text-slate-700">
        <Share2 className="w-4 h-4 text-indigo-600" />
        <span>Share this guide with colleagues:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95 shadow-2xs"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={shareLinkedIn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-bold transition-all active:scale-95 shadow-2xs"
          title="Share on LinkedIn"
        >
          <LinkedInIcon className="w-3.5 h-3.5" />
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={shareTwitter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95 shadow-2xs"
          title="Share on X / Twitter"
        >
          <XTwitterIcon className="w-3.5 h-3.5" />
          <span>X</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all active:scale-95 shadow-2xs"
          title="Copy Link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
