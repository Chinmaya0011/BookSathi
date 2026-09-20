'use client';

import { useState, useRef } from 'react';
import { Percent, Smartphone, Clock, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TrustBar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const metrics = [
    {
      stat: '0%',
      label: 'Platform Commission',
      desc: 'Direct UPI straight to your bank account with zero middleman deductions',
      icon: Percent,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      stat: 'Zero App',
      label: 'For Your Clients',
      desc: 'Book in 30 seconds via WhatsApp or Web without registering or downloading',
      icon: Smartphone,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      stat: '2 Minutes',
      label: 'Quick Setup',
      desc: 'Get your custom practice booking link & working hours configured instantly',
      icon: Clock,
      accent: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      stat: 'Live Tokens',
      label: 'Clinic & Office Queue',
      desc: 'Real-time status updates and wait times for patients and walk-ins',
      icon: QrCode,
      accent: 'text-violet-600 bg-violet-50 border-violet-100',
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIdx = Math.round(scrollLeft / (clientWidth * 0.82));
    setActiveIndex(Math.min(Math.max(newIdx, 0), metrics.length - 1));
  };

  const scrollToIndex = (idx) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth * 0.82;
    scrollRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth',
    });
    setActiveIndex(idx);
  };

  return (
    <section className="py-8 sm:py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Mobile Header with Prev / Next Arrow controls */}
        <div className="flex sm:hidden items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Why Professionals Trust Us
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous slide"
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === 0
                  ? 'border-slate-100 text-slate-300 opacity-40'
                  : 'border-slate-200 text-slate-700 bg-slate-50 active:scale-90'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollToIndex(Math.min(metrics.length - 1, activeIndex + 1))}
              disabled={activeIndex === metrics.length - 1}
              aria-label="Next slide"
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === metrics.length - 1
                  ? 'border-slate-100 text-slate-300 opacity-40'
                  : 'border-slate-200 text-slate-700 bg-slate-50 active:scale-90'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel on Mobile, Clean Grid on Tablet & Desktop */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`min-w-[84vw] sm:min-w-0 snap-center shrink-0 p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  activeIndex === idx ? 'ring-1 ring-indigo-500/20 shadow-xs sm:ring-0 sm:shadow-none' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${item.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {item.stat}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.label}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Active Carousel Indicators (Dots) */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-4">
          {metrics.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
