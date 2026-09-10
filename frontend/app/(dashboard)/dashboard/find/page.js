'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Phone,
  Stethoscope,
  Calculator,
  Scale,
  Brain,
  Salad,
  Dumbbell,
  Layers,
  Check,
} from 'lucide-react';
import { publicService } from '@/services/public.service';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: Layers },
  { id: 'Doctor', label: 'Doctors', icon: Stethoscope },
  { id: 'CA', label: 'Chartered Accountants', icon: Calculator },
  { id: 'Lawyer', label: 'Lawyers', icon: Scale },
  { id: 'Therapist', label: 'Therapists', icon: Brain },
  { id: 'Nutritionist', label: 'Nutritionists', icon: Salad },
  { id: 'Consultant', label: 'Consultants', icon: Briefcase },
  { id: 'Trainer', label: 'Fitness Trainers', icon: Dumbbell },
];

export default function FindProfessionalsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  useEffect(() => {
    fetchProfessionals();
  }, [selectedCategory, selectedCity]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
      };
      if (selectedCategory !== 'ALL') params.profession = selectedCategory;
      if (selectedCity !== 'ALL') params.city = selectedCity;
      if (search.trim()) params.search = search.trim();

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
    fetchProfessionals();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Find & Book Professionals</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse verified Indian service providers with instant slot booking
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization, clinic name, or city..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills with Lucide Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No professionals found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
            }}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professionals.map((pro) => (
            <div
              key={pro._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="relative shrink-0">
                    {pro.profileImage ? (
                      <img
                        src={pro.profileImage}
                        alt={pro.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                        {pro.name.charAt(0)}
                      </div>
                    )}
                    {pro.isVerified && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {pro.name}
                      </h3>
                      {pro.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-xs font-bold text-indigo-600 truncate">{pro.profession}</p>
                    <p className="text-[11px] text-slate-500 truncate">{pro.specialization || 'Consultant'}</p>
                    {pro.city && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{pro.city}, {pro.state || 'India'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {pro.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {pro.bio}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Consultation</span>
                    <span className="font-extrabold text-slate-900">₹{pro.consultationFee}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Experience</span>
                    <span className="font-bold text-slate-700">{pro.yearsOfExperience || 5}+ yrs</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/book/${pro.bookingSlug || pro._id}`}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
