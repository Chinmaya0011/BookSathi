'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

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

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
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
        </motion.div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'clients', label: 'Client Experience' },
            { id: 'payments', label: 'UPI Payments & Fees' },
            { id: 'queue', label: 'Queue & Tokens' },
            { id: 'setup', label: 'Setup & Standees' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
