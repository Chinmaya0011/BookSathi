'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Do customers need to create an account?',
      a: 'No. Customers never need to create an account, register passwords, or download an app. They simply enter their name and mobile number, verify via email OTP, and confirm their slot in under 30 seconds.',
    },
    {
      q: 'Do customers need to download an app?',
      a: 'No app download is ever required. BookSaathi runs entirely as a lightweight, fast web application that opens smoothly on Chrome, Safari, WhatsApp in-app browser, or any smartphone.',
    },
    {
      q: 'How does booking lookup work?',
      a: 'Customers can visit the "Find Booking" page anytime, enter their registered mobile number, and instantly see all their upcoming and past bookings with tokens, dates, and doctor clinic locations.',
    },
    {
      q: 'Can I add walk-in customers?',
      a: 'Yes. From your Today queue dashboard, click "+ Add Walk-in" to immediately inject offline patients who arrived directly at your chamber into the active queue with sequential token numbers.',
    },
    {
      q: 'How does the Today queue work?',
      a: 'The Today queue automatically compiles your daily appointments in chronological order. You can see who is completed, who is waiting, and click "Mark Done" or "Cancel" in 1 click.',
    },
    {
      q: 'Can I use WhatsApp confirmations?',
      a: 'Yes. Every booking generates a 1-tap WhatsApp confirmation slip with the appointment date, time, reference code, and clinic location that clients can save directly to their chats.',
    },
    {
      q: "What's included in the Free plan?",
      a: 'The Free plan includes unlimited client appointments, your personal booking link, Today live queue, customer lookup flow, and 0% platform commission with zero time limits.',
    },
    {
      q: "What's included in Pro?",
      a: 'Pro adds automated WhatsApp reminders, 1-tap Book Again for returning clients, custom booking slug, practice verification badge, and priority support for just ₹199/month (or ₹125/mo billed annually).',
    },
    {
      q: 'How quickly can I create my booking page?',
      a: 'Under 2 minutes. Sign up with your mobile number or email, set your working hours and consultation fee, and your public booking link (e.g. booksaathi.in/book/your-name) is immediately live.',
    },
    {
      q: 'Is there any commission on bookings?',
      a: 'No. BookSaathi charges 0% platform commission on client consultation fees. You keep 100% of your earnings whether you collect fees online or at your clinic desk.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Questions? We've kept the answers simple.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Everything you need to know about setting up your booking page and managing appointments.
          </p>
        </div>

        {/* 10 Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in-50 duration-150 font-normal">
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
