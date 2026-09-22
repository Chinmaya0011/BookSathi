'use client';

import {
  Users,
  Star,
  Stethoscope,
  Scale,
  Calculator,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Quote,
} from 'lucide-react';

export default function LandingTestimonials() {
  const testimonials = [
    {
      name: 'Dr. Rajesh Sharma, MD',
      role: 'Senior General Physician',
      location: 'Bhubaneswar, Odisha',
      quote:
        'Earlier, my receptionist spent 3-4 hours every day managing phone calls and token disputes. With BookSaathi, parents book real-time OPD slots and arrive right on time. Our waiting hall is completely calm.',
      icon: Stethoscope,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      stats: '1,800+ OPD visits managed',
      stars: 5,
    },
    {
      name: 'CA Priya Agarwal, FCA',
      role: 'Corporate Tax & GST Auditor',
      location: 'Cuttack, Odisha',
      quote:
        'During ITR & GST filing seasons, client scheduling used to be chaotic. Sharing my BookSaathi link with upfront consultation fees increased our billable conversion by 40% and eliminated no-shows.',
      icon: Calculator,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      stats: '₹6.5L+ fees collected directly',
      stars: 5,
    },
    {
      name: 'Advocate Rohit Senapati',
      role: 'High Court & Commercial Litigator',
      location: 'High Court Chamber, Cuttack',
      quote:
        'The acrylic QR Standee on my reception desk allows walk-in clients to book their consultation token without disturbing ongoing chamber discussions. Direct UPI settlement with zero commission is fantastic.',
      icon: Scale,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      stats: 'Zero double-bookings',
      stars: 5,
    },
    {
      name: 'Prof. Ananya Mishra',
      role: 'IIT-JEE Physics Specialist',
      location: 'Pune & Online',
      quote:
        'Managing 1-on-1 doubt sessions for 80+ students over WhatsApp was unmanageable. Now students pick available evening slots and get instant Google Calendar & WhatsApp invites automatically.',
      icon: GraduationCap,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      stats: '2,200+ sessions booked',
      stars: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Practitioner Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by leading practitioners across India
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            See how clinics, legal chambers, and financial consultancies elevated their appointment booking experience.
          </p>
        </div>

        {/* Testimonials 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:bg-white transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {t.stats}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/70 flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{t.role} • {t.location}</p>
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
