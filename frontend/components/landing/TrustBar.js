'use client';

import { useEffect, useRef } from 'react';
import { Percent, Clock, Smartphone, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function TrustBar() {
  const containerRef = useRef(null);

  const metrics = [
    {
      stat: '0%',
      label: 'Platform Commission',
      sub: 'Keep 100% of your earnings',
      icon: Percent,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      stat: '2 min',
      label: 'Practice Setup',
      sub: 'Share your link immediately',
      icon: Clock,
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      stat: 'Zero App',
      label: 'Customer Booking',
      sub: 'No logins or downloads',
      icon: Smartphone,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      stat: 'WhatsApp',
      label: 'Instant Confirmation',
      sub: 'Digital slip & token pass',
      icon: MessageCircle,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.trust-metric-card');
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [16, 0],
          delay: stagger(100, { start: 150 }),
          duration: 650,
          ease: 'outQuad',
        });
      }
    }
  }, []);

  return (
    <section className="py-8 bg-slate-950/90 border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="trust-metric-card p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-slate-700 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                    {item.stat}
                  </div>
                  <div className="text-xs font-bold text-slate-300 mt-1">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden sm:block">
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
