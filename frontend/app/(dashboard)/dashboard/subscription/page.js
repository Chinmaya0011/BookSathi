'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/booking-link');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] animate-in fade-in duration-200">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to Booking Link & Plan...</p>
      </div>
    </div>
  );
}
