'use client';

import { useParams } from 'next/navigation';
import { usePublicBooking } from '@/hooks/usePublicBooking';
import BookingDoctorHero from '@/components/booking/BookingDoctorHero';
import BookingStepIndicator from '@/components/booking/BookingStepIndicator';
import BookingSlotPicker from '@/components/booking/BookingSlotPicker';
import BookingPatientForm from '@/components/booking/BookingPatientForm';
import BookingSuccessView from '@/components/booking/BookingSuccessView';
import BookingCheckoutModal from '@/components/booking/BookingCheckoutModal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle, ShieldCheck, Lock, Sparkles, CheckCircle2, CalendarX2, Settings, Search } from 'lucide-react';
import { getProfessionalPublicUrl } from '@/lib/urlHelpers';
import { useAuthStore } from '@/stores/useAuthStore';
import Link from 'next/link';

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug;
  const canonicalUrl = getProfessionalPublicUrl(slug);
  const { user } = useAuthStore();

  const {
    profile,
    loadingProfile,
    error,
    currentStep,
    selectedType,
    selectedDate,
    selectedTime,
    availableDays,
    loadingSlots,
    groupedSlots,
    patientName,
    setPatientName,
    patientEmail,
    setPatientEmail,
    patientPhone,
    setPatientPhone,
    reason,
    setReason,
    paymentMode,
    setPaymentMode,
    submitting,
    confirmedBooking,
    confirmedPayment,
    downloadingPdf,
    showCheckoutModal,
    setShowCheckoutModal,
    pendingOrder,
    selectedCheckoutMethod,
    setSelectedCheckoutMethod,
    processingCheckout,
    checkoutError,
    currentFee,
    icsDownloadUrl,
    whatsappShareUrl,
    holdCountdown,
    handleTypeSelect,
    handleDateSelect,
    handleSlotSelect,
    handleBackToStep1,
    handleSubmitBooking,
    handleSimulatedPayment,
    handleDownloadPdf,
    handleBookAnother,
    openInvoice,
  } = usePublicBooking(slug);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <Spinner size="lg" label="Loading practitioner booking calendar..." className="text-white" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title="Practitioner Not Found"
          description={error || 'The requested practitioner profile or booking link is inactive or does not exist.'}
          className="max-w-md w-full bg-slate-900/90 border-slate-800 text-white shadow-2xl rounded-3xl"
        />
      </div>
    );
  }

  const hasServices = Boolean(profile.appointmentTypes && profile.appointmentTypes.length > 0);
  const isOwner = Boolean(user && (user._id === profile._id || user.bookingSlug === slug || user.email === profile.email));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-5 sm:py-10 px-3.5 sm:px-6 selection:bg-indigo-600 selection:text-white">
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${profile.name} • Book Appointment | BookSaathi`} />
      <meta property="og:description" content={`Book an appointment directly with ${profile.name} (${profile.profession}) on BookSaathi.`} />
      
      {/* Top Header Bar */}
      <header className="max-w-2xl w-full mx-auto mb-4 flex items-center justify-between text-xs px-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="font-extrabold text-white text-sm tracking-tight">
            Book<span className="text-indigo-400">Saathi</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium backdrop-blur-md">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Secured</span>
        </div>
      </header>

      {/* Main Booking Container */}
      <main className="max-w-2xl w-full mx-auto bg-white rounded-3xl sm:rounded-[32px] shadow-2xl shadow-indigo-950/40 border border-slate-200/80 overflow-hidden text-slate-900 ring-1 ring-white/10">
        {/* Doctor Hero Card */}
        <div className="bg-slate-950">
          <BookingDoctorHero profile={profile} />
          {hasServices && (
            <div className="px-6 pb-4">
              <BookingStepIndicator currentStep={currentStep} />
            </div>
          )}
        </div>

        {!hasServices ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <CalendarX2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                No Consultation Services Configured Yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {profile.name} has not published any consultation services or active booking slots yet. Please check back soon or explore other verified professionals.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {isOwner ? (
                <Link
                  href="/dashboard/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure Services in Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/find"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Available Professionals</span>
                </Link>
              )}
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Select Consultation Service & Time Slot */}
            {currentStep === 1 && (
              <BookingSlotPicker
                appointmentTypes={profile.appointmentTypes}
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
                availableDays={availableDays}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                loadingSlots={loadingSlots}
                groupedSlots={groupedSlots}
                onSlotSelect={handleSlotSelect}
              />
            )}

            {/* Step 2: Patient Information & Payment Selection */}
            {currentStep === 2 && (
              <BookingPatientForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedType={selectedType}
                profile={profile}
                user={user}
                patientName={patientName}
                setPatientName={setPatientName}
                patientPhone={patientPhone}
                setPatientPhone={setPatientPhone}
                patientEmail={patientEmail}
                setPatientEmail={setPatientEmail}
                reason={reason}
                setReason={setReason}
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
                submitting={submitting}
                onSubmit={handleSubmitBooking}
                onBack={handleBackToStep1}
                holdCountdown={holdCountdown}
              />
            )}

            {/* Step 3: Confirmation & Download Actions */}
            {currentStep === 3 && (
              <BookingSuccessView
                confirmedBooking={confirmedBooking}
                confirmedPayment={confirmedPayment}
                profile={profile}
                currentFee={currentFee}
                downloadingPdf={downloadingPdf}
                onDownloadPdf={handleDownloadPdf}
                icsDownloadUrl={icsDownloadUrl}
                whatsappShareUrl={whatsappShareUrl}
                onOpenInvoice={openInvoice}
                onBookAnother={handleBookAnother}
              />
            )}
          </>
        )}
      </main>

      {/* Payment Gateway Modal */}
      <BookingCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        pendingOrder={pendingOrder}
        currentFee={currentFee}
        selectedMethod={selectedCheckoutMethod}
        onSelectMethod={setSelectedCheckoutMethod}
        onProcessPayment={handleSimulatedPayment}
        processing={processingCheckout}
        error={checkoutError}
      />

      {/* Footer Branding & Guarantees */}
      <footer className="mt-8 max-w-2xl w-full mx-auto text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Practitioner Booking</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Booking Convenience Fees</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Calendar & WhatsApp Sync</span>
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Powered by{' '}
          <span className="font-bold text-slate-300">BookSaathi</span> Healthcare & Professional Scheduling Network (India)
        </p>
      </footer>
    </div>
  );
}
