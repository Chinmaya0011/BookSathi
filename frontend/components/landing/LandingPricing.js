'use client';

import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPricing() {
  const plans = [
    {
      id: 'solo-free',
      name: 'Solo Practitioner',
      badge: 'Free Forever',
      price: '₹0',
      period: 'lifetime free',
      desc: 'Essential personal booking link for newly starting individual practitioners.',
      popular: false,
      hardwareIncluded: false,
      features: [
        'Personal Custom Link (/book/your-name)',
        'Unlimited Patient & Client Bookings',
        'Direct UPI & In-Person Cash Support',
        '0% Platform Booking Commission',
        'Standard Availability & Schedule Controls',
      ],
      ctaText: 'Get Started Free',
      ctaHref: '/register',
    },
    {
      id: 'pro-1m',
      name: '1 Month Pro Flex',
      badge: 'Monthly Plan',
      price: '₹499',
      period: 'per month',
      desc: 'Ideal for independent advisors wanting advanced automated scheduling.',
      popular: false,
      hardwareIncluded: false,
      features: [
        'Everything in Free Plan',
        'Automated WhatsApp & SMS Reminders',
        'High-Resolution Vector QR Kit Download',
        'Custom Service Durations & Buffer Times',
        'Revenue & Peak-Hours Dashboard Analytics',
      ],
      ctaText: 'Start 1-Month Pro',
      ctaHref: '/register',
    },
    {
      id: 'pro-6m',
      name: '6 Months Pro + Kit',
      badge: 'Most Popular',
      price: '₹2,199',
      period: '6 Months (₹366/mo • Save 26%)',
      desc: 'Complete software plus physical acrylic standee & clinic vinyl banner.',
      popular: true,
      hardwareIncluded: true,
      features: [
        'Everything in Pro Plan',
        '1x Branded Acrylic Desk Standee with QR',
        '1x Clinic / Office Wall Vinyl Banner',
        'Free Express Courier Delivery across India',
        'Priority Dedicated Support Relay',
      ],
      ctaText: 'Get 6-Month Plan & Free Kit',
      ctaHref: '/register',
    },
    {
      id: 'pro-12m',
      name: '12 Months Annual VIP',
      badge: 'Best Value',
      price: '₹3,599',
      period: '12 Months (₹299/mo • Save 40%)',
      desc: 'Full practice automation with annual VIP support and free hardware replacements.',
      popular: false,
      hardwareIncluded: true,
      features: [
        'Everything in 6-Month Plan',
        '1x Branded Acrylic Desk Standee with QR',
        '1x Clinic / Office Wall Vinyl Banner',
        'Free Lifetime Hardware Standee Replacement',
        'Dedicated VIP Account Setup Specialist',
      ],
      ctaText: 'Get Annual VIP Plan',
      ctaHref: '/register',
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Plans built for Indian professionals
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Keep 100% of your earnings. Zero booking commissions, zero surprise deductions.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-md relative'
                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{plan.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      plan.popular
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 min-h-[36px] leading-relaxed">
                  {plan.desc}
                </p>

                {/* Free Hardware Notification Badge */}
                {plan.hardwareIncluded && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Includes 1x Desk Standee & 1x Banner</span>
                  </div>
                )}

                {/* Feature Checklist */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    What is included:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-5 border-t border-slate-100">
                <Link
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
