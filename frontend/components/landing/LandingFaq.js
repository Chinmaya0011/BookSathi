'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LandingFaq() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      q: 'Do my patients or clients need to download an app or create an account?',
      a: 'Never! Your clients simply click your link or scan your QR standee in any mobile browser, choose an available date and time slot, enter their name and phone, and confirm in under 30 seconds.',
    },
    {
      q: 'How does the Double-Booking Prevention Shield work?',
      a: 'BookSaathi uses database-level compound atomic unique indexing. The millisecond a slot is selected or held, that exact timestamp for your profile is locked, mathematically guaranteeing zero double-bookings or schedule overlaps.',
    },
    {
      q: 'How do payments work? Can I collect cash or UPI at my clinic/office?',
      a: 'Yes! BookSaathi offers a flexible hybrid system. You can require upfront digital payments (UPI, GPay, PhonePe, Cards) or allow clients to select "Pay In-Person at Desk". You can also record manual walk-in payments directly on your dashboard.',
    },
    {
      q: 'Can I get a physical acrylic QR standee for my clinic or office reception desk?',
      a: 'Yes! When you select the 6-Month or 12-Month Pro plan, we manufacture a custom branded acrylic tabletop standee and clinic wall vinyl banner with your unique QR code and deliver them via Express Courier with ₹0 delivery charge.',
    },
    {
      q: 'Is BookSaathi really 0% commission with zero hidden platform cuts?',
      a: 'Yes. You keep 100% of your consultation fees. There are no per-booking commissions or surprise transaction deductions taken from your client payments.',
    },
    {
      q: 'How quickly can I set up my booking link?',
      a: 'In less than 2 minutes! Just sign up, set your consultation fee, define your available hours (e.g. 10 AM - 1 PM, 5 PM - 8 PM), and your public booking link is live immediately.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Got questions? We have answers.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about setting up and automating your practice booking link.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-xl overflow-hidden transition-all bg-white shadow-2xs"
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
