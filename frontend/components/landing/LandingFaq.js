'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function LandingFaq() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      q: 'Do my patients or clients need to create an account or download an app?',
      a: 'No! Clients simply click your link (e.g. booksaathi.in/book/dr-rajesh), select a date and open 30-min slot, enter their name and mobile number, and confirm. No passwords or app downloads required.',
    },
    {
      q: 'How does the zero-login booking lookup work for patients?',
      a: 'Any patient or client can visit /lookup on BookSaathi and enter their 10-digit mobile number. The system retrieves all their upcoming and past appointment tokens, doctor details, and WhatsApp links instantly without logging in.',
    },
    {
      q: 'How does the professional "Today" queue dashboard work?',
      a: 'The professional dashboard focuses on today’s active queue with a live count badge (e.g. Today (5)). Each row shows patient name, scheduled time, phone, WhatsApp direct link, and two 1-tap action buttons: Mark Done and Cancel. Past appointments are also auto-resolved to Done.',
    },
    {
      q: 'Can I add offline walk-in patients to my queue?',
      a: 'Yes. With the 3-field Quick Walk-In button, you just enter Patient Name, Mobile Number, and Time Slot (with a 1-tap "Right NOW" shortcut). The slot is immediately reserved and added to your Today queue.',
    },
    {
      q: 'What is the difference between the Free plan and the Pro plan?',
      a: 'The Free plan is ₹0 forever with unlimited bookings, personal link, Today queue with count badge, and customer phone lookup. The Pro plan (₹199/month or ₹1,499/year) adds automated WhatsApp reminders before appointments, 1-tap rebooking for returning customers, and custom vanity URL handles.',
    },
    {
      q: 'How quickly can I set up my practice and get my booking link?',
      a: 'In under 60 seconds! Our 2-step onboarding asks for your Name + Profession and your Daily Working Hours. Sane defaults (30-min slots, 10-min buffers, ₹500 fee) are automatically configured for you.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Clear Answers to Common Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about setting up and running your BookSaathi schedule.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
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
