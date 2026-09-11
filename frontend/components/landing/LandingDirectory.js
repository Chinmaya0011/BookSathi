'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ShieldCheck,
  Calendar,
  ArrowRight,
  UserCheck,
  Sparkles,
  Stethoscope,
  Calculator,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { publicService } from '@/services/public.service';
import { formatINR } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function LandingDirectory() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('ALL');

  useEffect(() => {
    loadProfessionals();
  }, [selectedProfession]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedProfession !== 'ALL') {
        params.profession = selectedProfession;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      const res = await publicService.getProfessionals(params);
      setProfessionals(res.data?.professionals || []);
    } catch (err) {
      console.error('Failed to load professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProfessionals();
  };

  const categories = [
    { id: 'ALL', label: 'All Professionals' },
    { id: 'Doctor', label: 'Doctors & Clinics', icon: Stethoscope },
    { id: 'CA', label: 'CAs & Tax Advisors', icon: Calculator },
    { id: 'Lawyer', label: 'Lawyers & Advocates', icon: Scale },
  ];

  return (
    <section id="directory" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Verified Practitioner Network</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Book Verified Professionals in India
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Select a verified practitioner below to view available time slots and book an appointment with 0% convenience fees.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="max-w-4xl mx-auto space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, specialization, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-6 rounded-xl shadow-xs"
            >
              Search
            </Button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedProfession(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedProfession === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real Professionals Grid */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold text-slate-500">Loading verified practitioners...</p>
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => {
              const bookingSlug = pro.bookingSlug || 'dr-rajesh';
              return (
                <div
                  key={pro._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  {/* Top: Avatar & Details */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                          {pro.name ? pro.name.replace(/^(Dr\.|CA|Adv\.)\s*/i, '').charAt(0) : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-black text-slate-900 leading-snug">
                              {pro.name}
                            </h3>
                            {pro.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified" />
                            )}
                          </div>
                          <p className="text-xs text-indigo-700 font-bold">
                            {pro.profession || 'Professional'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                        {formatINR(pro.consultationFee || 500)}
                      </span>
                    </div>

                    {pro.specialization && (
                      <p className="text-xs text-slate-600 font-medium line-clamp-1">
                        {pro.specialization}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{pro.city || 'Bhubaneswar'}, {pro.state || 'Odisha'}</span>
                    </div>
                  </div>

                  {/* Bottom: Book Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-400 truncate">
                      /{bookingSlug}
                    </span>

                    <Link
                      href={`/book/${bookingSlug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-200 max-w-md mx-auto space-y-2">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No practitioners found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
