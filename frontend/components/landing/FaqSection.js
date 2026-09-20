'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Do my patients or clients need to download an app or create an account?',
      a: 'No. Clients never need to create an account, remember passwords, or download an app. They simply tap your link in WhatsApp or browser, pick an available slot, and confirm in under 30 seconds.',
    },
    {
      q: 'How does payment collection and UPI settlement work?',
      a: 'You can configure your consultation fee as free, fixed, or token deposit. Payments go directly to your personal or clinic UPI ID (Google Pay, PhonePe, Paytm). BookSaathi takes 0% commission.',
    },
    {
      q: 'Can I manage offline walk-in patients alongside online bookings?',
      a: 'Yes. From your Today Queue dashboard, you can inject walk-in visitors in 5 seconds. The system assigns the next sequential token number (#05, #06, etc.) and keeps your entire waiting list in sync.',
    },
    {
      q: 'How do clients look up their appointment pass later?',
      a: 'Clients can visit the "Find Booking" page anytime and enter their mobile number to view their active digital pass, token number, doctor location pin, and status.',
    },
    {
      q: 'Can I set buffer times between appointments to prevent running late?',
      a: 'Yes. You can customize slot lengths (15, 30, 45, 60 mins), add buffer times between slots (5, 10, 15 mins), block lunch breaks, and mark holidays with one click.',
    },
    {
      q: 'What is the Tabletop QR Standee feature in Pro?',
      a: 'Pro includes a custom printable QR Standee Studio that generates an elegant PDF banner with your clinic/office branding and QR code ready to print and display at your reception desk.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about setting up your practice and accepting bookings.
          </p>
        </div>

        {/* 6 Clean Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
