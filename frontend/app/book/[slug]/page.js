'use client';

import { useParams } from 'next/navigation';
import { usePublicBooking } from '@/hooks/usePublicBooking';
import BookingDoctorHero from '@/components/booking/BookingDoctorHero';
import BookingStepIndicator from '@/components/booking/BookingStepIndicator';
import BookingSlotPicker from '@/components/booking/BookingSlotPicker';
import BookingPatientForm from '@/components/booking/BookingPatientForm';
import BookingSuccessView from '@/components/booking/BookingSuccessView';
import BookingQueueView from '@/components/booking/BookingQueueView';
import BookingQueueSuccessView from '@/components/booking/BookingQueueSuccessView';
import BookingCheckoutModal from '@/components/booking/BookingCheckoutModal';
import BookingOtpModal from '@/components/booking/BookingOtpModal';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle, ShieldCheck, Lock, Sparkles, CheckCircle2, CalendarX2, Settings, Search, ArrowLeft } from 'lucide-react';
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
    isQueueMode,
    queueStatus,
    loadingQueue,
    fetchQueueStatus,
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
    websiteHp,
    setWebsiteHp,
    submitting,
    confirmedBooking,
    confirmedPayment,
    downloadingPdf,
    showCheckoutModal,
    setShowCheckoutModal,
    showOtpModal,
    setShowOtpModal,
    handleVerifyOtpAndConfirm,
    handleResendBookingOtp,
    sendingBookingOtp,
    verifyingBookingOtp,
    otpModalError,
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center mb-4 text-indigo-600 shadow-lg shadow-indigo-500/10 relative z-10">
          <Sparkles className="w-7 h-7 animate-pulse text-indigo-600" />
        </div>
        <Spinner size="lg" label="Loading practitioner booking calendar..." className="text-slate-800 relative z-10" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <EmptyState
          icon={AlertCircle}
          title="Practitioner Not Found"
          description={error || 'The requested practitioner profile or booking link is inactive or does not exist.'}
          className="max-w-md w-full bg-white border-slate-200/90 text-slate-900 shadow-xl rounded-3xl relative z-10"
        />
      </div>
    );
  }

  const hasServices = Boolean(profile.appointmentTypes && profile.appointmentTypes.length > 0) || isQueueMode;
  const isOwner = Boolean(
    user && (user._id === profile._id || user.bookingSlug === slug || user.email === profile.email)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100/80 text-slate-900 flex flex-col justify-between py-4 sm:py-8 px-3.5 sm:px-6 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Dynamic ambient backdrop decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-100/50 via-violet-50/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${profile.name} • Book Appointment | BookSaathi`} />
      <meta
        property="og:description"
        content={`Book an appointment directly with ${profile.name} (${profile.profession}) on BookSaathi.`}
      />

      {/* Top Navigation Header */}
      <header className="max-w-2xl w-full mx-auto mb-4 flex items-center justify-between text-xs px-2 relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
            Book<span className="text-indigo-600">Saathi</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-700 text-[11px] font-semibold shadow-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>256-Bit SSL Secured</span>
        </div>
      </header>

      {/* Main Booking Card Container */}
      <main className="max-w-2xl w-full mx-auto bg-white rounded-3xl sm:rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden text-slate-900 relative z-10 transition-all duration-300">
        {/* Doctor Hero Card with Step Indicator */}
        <div className="border-b border-slate-100 bg-white">
          <BookingDoctorHero profile={profile} />
          {hasServices && !isQueueMode && (
            <div className="px-5 sm:px-7 pb-4 bg-slate-50/60 border-t border-slate-100">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure Services in Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/lookup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Lookup My Booking</span>
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
        ) : isQueueMode ? (
          /* QUEUE MODE INTERFACE */
          currentStep === 3 ? (
            <BookingQueueSuccessView
              confirmedBooking={confirmedBooking}
              confirmedPayment={confirmedPayment}
              profile={profile}
              currentFee={currentFee}
              downloadingPdf={downloadingPdf}
              onDownloadPdf={handleDownloadPdf}
              icsDownloadUrl={icsDownloadUrl}
              whatsappShareUrl={whatsappShareUrl}
              onBookAnother={handleBookAnother}
              queueStatus={queueStatus}
            />
          ) : (
            <BookingQueueView
              profile={profile}
              appointmentTypes={profile.appointmentTypes}
              selectedType={selectedType}
              onTypeSelect={handleTypeSelect}
              availableDays={availableDays}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              queueStatus={queueStatus}
              loadingQueue={loadingQueue}
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
              websiteHp={websiteHp}
              setWebsiteHp={setWebsiteHp}
              submitting={submitting}
              onSubmit={handleSubmitBooking}
            />
          )
        ) : (
          /* TIME_SLOT MODE INTERFACE */
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
                websiteHp={websiteHp}
                setWebsiteHp={setWebsiteHp}
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

      {/* Booking Email OTP Verification Modal */}
      <BookingOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={patientEmail}
        patientName={patientName}
        onVerifyAndConfirm={handleVerifyOtpAndConfirm}
        onResendOtp={handleResendBookingOtp}
        sendingOtp={sendingBookingOtp}
        verifying={verifyingBookingOtp}
        error={otpModalError}
      />

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
      <footer className="mt-8 max-w-2xl w-full mx-auto text-center space-y-3 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Practitioner Booking</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Convenience Fees</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant WhatsApp & Calendar Sync</span>
          </span>
        </div>

        <div className="pt-1">
          <Link
            href="/lookup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Already booked? Find your appointment with your phone number</span>
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Powered by{' '}
          <span className="font-bold text-slate-700">BookSaathi</span> Scheduling Network (India)
        </p>
      </footer>
    </div>
  );
}
