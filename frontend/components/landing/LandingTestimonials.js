'use client';

import {
  Users,
  Star,
  Stethoscope,
  Scale,
  Calculator,
  GraduationCap,
  Scissors,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

export default function LandingTestimonials() {
  const testimonials = [
    {
      name: 'CA Neha Singhania, FCA',
      role: 'Corporate Tax & GST Auditor',
      location: 'New Delhi',
      quote:
        'During ITR & GST filing seasons, client scheduling was pure chaos. Sharing my BookSaathi link with pre-collected consultation fees increased our billable conversion by 40% and eliminated no-shows.',
      icon: Calculator,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      stats: '₹6.5L+ fees collected',
    },
    {
      name: 'Advocate Rameshwar Jena',
      role: 'High Court & Commercial Litigator',
      location: 'Cuttack, Odisha',
      quote:
        'The QR Standee on my reception desk allows walk-in clients to book their consultation token without disturbing ongoing chamber discussions. 100% direct UPI settlement is fantastic.',
      icon: Scale,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      stats: 'Zero double-bookings',
    },
    {
      name: 'Prof. Arvind Kulkarni',
      role: 'IIT-JEE Physics Specialist',
      location: 'Pune, Maharashtra',
      quote:
        'Managing 1-on-1 doubt sessions for 80+ students over WhatsApp was unmanageable. Now students pick available evening slots and get instant Google Calendar & WhatsApp invites.',
      icon: GraduationCap,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      stats: '2,200+ sessions booked',
    },
    {
      name: 'Dr. Alok Mohapatra, MD',
      role: 'Senior Pediatrician',
      location: 'Bhubaneswar, Odisha',
      quote:
        'Earlier, my receptionist spent 3-4 hours every day managing telephone calls and token disputes. With BookSaathi, parents book real-time slots and arrive right on time.',
      icon: Stethoscope,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      stats: '1,800+ visits managed',
    },
    {
      name: 'Riya Sen',
      role: 'Bridal Stylist & Skin Expert',
      location: 'Mumbai, Maharashtra',
      quote:
        'Clients can view my bridal packages, select 45-min styling slots, and pay advance token amounts online. My studio no-shows dropped to nearly zero!',
      icon: Scissors,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      stats: '98% on-time arrivals',
    },
    {
      name: 'Coach Rohan Mehra',
      role: 'Strength & Nutrition Coach',
      location: 'Bengaluru, Karnataka',
      quote:
        'Whether it is in-gym fitness assessments or online diet consultations, BookSaathi handles the scheduling and UPI payments seamlessly. Saved me 10+ hours every week.',
      icon: Dumbbell,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      stats: '450+ client plans active',
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Trusted Across India</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by leading practitioners & consultants
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            See how doctors, legal counsels, and financial advisors elevated their client consultation experience.
          </p>
        </div>

        {/* 6 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {t.stats}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/70 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${t.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.role} • {t.location}</p>
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
