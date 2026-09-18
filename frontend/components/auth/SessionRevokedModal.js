'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Laptop2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SessionRevokedModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(
    'Your account was signed in from another device or browser. For your security, this session has been logged out.'
  );

  useEffect(() => {
    const handleRevoked = (event) => {
      if (event.detail?.message) {
        setMessage(event.detail.message);
      }
      setIsOpen(true);
    };

    window.addEventListener('booksaathi:session_revoked', handleRevoked);
    return () => {
      window.removeEventListener('booksaathi:session_revoked', handleRevoked);
    };
  }, []);

  const handleLoginRedirect = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Icon Accent */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
            <Laptop2 className="w-3.5 h-3.5" />
            <span>Single Active Session</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Session Ended
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Security Notice Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium text-left flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
          <span>
            BookSaathi enforces a strict single-device login policy to safeguard your appointments, sensitive records, and payment data.
          </span>
        </div>

        {/* Login Again Action */}
        <div className="pt-2">
          <Button
            onClick={handleLoginRedirect}
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Again</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
