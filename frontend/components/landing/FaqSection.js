'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs = [
    {
      category: 'clients',
      q: 'Do my patients or clients need to download an app or create an account?',
      a: 'No. Clients never need to create an account, remember passwords, or download an app. They simply tap your link in WhatsApp or browser, pick an available slot, and confirm in under 30 seconds. They receive a digital pass with token number and directions immediately.',
    },
    {
      category: 'payments',
      q: 'How does UPI payment collection and zero commission work?',
      a: 'You can configure your consultation fee as free, fixed, or advance deposit. During booking, clients pay directly to your personal or clinic UPI ID (Google Pay, PhonePe, Paytm, BHIM). BookSaathi takes 0% commission, and 100% of the funds settle directly to your bank.',
    },
    {
      category: 'queue',
      q: 'Can I manage offline walk-in patients alongside online bookings?',
      a: 'Yes. From your Today Queue calling desk, you or your receptionist can inject walk-in visitors in 5 seconds. The system automatically assigns the next sequential token number (#05, #06, etc.) and keeps your entire waiting list synchronized.',
    },
    {
      category: 'clients',
      q: 'How do clients look up their appointment pass if they lose their link?',
      a: 'Clients can visit the "Find Booking Pass" page on BookSaathi anytime and enter their registered mobile number to view their active digital pass, token number, doctor location pin, and status.',
    },
    {
      category: 'setup',
      q: 'Can I set buffer times between appointments to prevent running late?',
      a: 'Yes. You can customize slot lengths (15, 30, 45, 60 mins), add buffer times between slots (5, 10, 15 mins), block lunch hours, and mark emergency holidays with one click.',
    },
    {
      category: 'setup',
      q: 'What is the Tabletop Acrylic QR Standee feature in Pro?',
      a: 'Pro includes a custom printable QR Standee Studio that generates an elegant high-resolution PDF banner with your clinic/office branding, doctor specialty, and QR code ready to print and display at your reception desk.',
    },
    {
      category: 'payments',
      q: 'Is my client consultation and medical data kept confidential?',
      a: 'Yes. All client records and doctor notes are encrypted and isolated strictly to your account. We adhere to high data privacy standards and never sell client data to third parties.',
    },
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((item) => item.category === selectedCategory);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about setting up your practice and accepting bookings.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Questions
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('clients')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'clients'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Client Experience
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('payments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'payments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Payments & UPI
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Queue & Tokens
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('setup')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'setup'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Setup & Customization
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
