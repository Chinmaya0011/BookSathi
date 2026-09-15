'use client';

import { useEffect, useRef } from 'react';
import { Percent, Clock, Smartphone, MessageCircle } from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function TrustBar() {
  const containerRef = useRef(null);

  const metrics = [
    {
      stat: '0%',
      label: 'Platform commission',
      sub: 'Keep 100% of your earnings',
      icon: Percent,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      stat: '2 min',
      label: 'Practice setup',
      sub: 'Share your link immediately',
      icon: Clock,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      stat: 'No app',
      label: 'Customer booking',
      sub: 'Zero logins or downloads',
      icon: Smartphone,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      stat: 'WhatsApp',
      label: 'Confirmation',
      sub: 'Instant booking slip & token',
      icon: MessageCircle,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
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
    <section className="py-8 bg-slate-50/80 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="trust-metric-card p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                    {item.stat}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {item.label}
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
