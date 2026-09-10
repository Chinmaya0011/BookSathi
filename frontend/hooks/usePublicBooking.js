
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { publicService } from '@/services/public.service';
import { paymentService } from '@/services/payment.service';
import { formatDisplayDate, format12Hour, formatINR, formatDateYYYYMMDD } from '@/lib/utils';
import { generateAppointmentPdf } from '@/lib/generateAppointmentPdf';
import { createIcsDownloadUrl } from '@/lib/generateIcs';

import { useAuthStore } from '@/stores/useAuthStore';

export function usePublicBooking(slug) {
  const { user, loading: authLoading, fetchCurrentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize authenticated user in background
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Wizard state: Step 1 (Slots & Service), Step 2 (Patient Details), Step 3 (Confirmed)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Slots state
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient details form (auto-filled from authenticated user if available)
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [reason, setReason] = useState('');
  const [paymentMode, setPaymentMode] = useState('OFFLINE'); // 'OFFLINE' (Pay at Clinic) or 'ONLINE'

  useEffect(() => {
    if (user) {
      if (!patientName && user.name) setPatientName(user.name);
      if (!patientEmail && user.email) setPatientEmail(user.email);
      if (!patientPhone && user.phone) setPatientPhone(user.phone);
    }
  }, [user, patientName, patientEmail, patientPhone]);

  // Booking & submission
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [selectedCheckoutMethod, setSelectedCheckoutMethod] = useState('UPI');
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // 1. Fetch Doctor Profile
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    async function fetchProfile() {
      setLoadingProfile(true);
      try {
        const res = await publicService.getDoctorProfile(slug);
        if (isMounted) {
          const rawProfile = res.data || {};
          const activeTypes = (rawProfile.appointmentTypes || []).filter((t) => t.enabled !== false);
          const sanitizedProfile = { ...rawProfile, appointmentTypes: activeTypes };
          setProfile(sanitizedProfile);
          if (activeTypes.length > 0) {
            const defaultType = activeTypes.find((t) => t.isDefault) || activeTypes[0];
            setSelectedType(defaultType);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Practitioner profile not found');
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const timezone = profile?.bookingSettings?.timezone || profile?.timezone || 'Asia/Kolkata';

  // 2. Generate 14-day date strip aligned with timezone
  const availableDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = formatDateYYYYMMDD(d, timezone);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: timezone });
      const dayNum = d.toLocaleDateString('en-IN', { day: 'numeric', timeZone: timezone });
      const monthName = d.toLocaleDateString('en-IN', { month: 'short', timeZone: timezone });
      days.push({
        dateStr,
        dayName,
        dayNum,
        monthName,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return days;
  }, [timezone]);

  // Set default selected date once days are computed
  useEffect(() => {
    if (availableDays.length > 0 && (!selectedDate || !availableDays.some(d => d.dateStr === selectedDate))) {
      setSelectedDate(availableDays[0].dateStr);
    }
  }, [availableDays, selectedDate]);

  // 3. Fetch Time Slots for Selected Date & Type
  const fetchSlots = useCallback(async () => {
    if (!slug || !selectedDate || loadingProfile) return;
    if (profile?.appointmentTypes?.length > 0 && !selectedType) return;

    setLoadingSlots(true);
    try {
      const res = await publicService.getDoctorSlots(slug, selectedDate, selectedType?._id);
      setSlots(res.data?.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug, selectedDate, selectedType, loadingProfile, profile]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // 4. Categorize slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    slots.forEach((s) => {
      const [hours] = s.time.split(':').map(Number);
      if (hours < 12) {
        morning.push(s);
      } else if (hours < 17) {
        afternoon.push(s);
      } else {
        evening.push(s);
      }
    });

    return { morning, afternoon, evening };
  }, [slots]);

  // Temporary Hold state
  const [holdToken, setHoldToken] = useState(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [holdCountdown, setHoldCountdown] = useState(0);

  // Hold countdown interval timer
  useEffect(() => {
    if (!holdExpiresAt) {
      setHoldCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - now) / 1000));
      setHoldCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setHoldToken(null);
        setHoldExpiresAt(null);
        if (currentStep === 2) {
          toast.warning('Your 5-minute slot reservation has expired. Please select a time slot again.');
          setCurrentStep(1);
          fetchSlots();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, currentStep, fetchSlots]);

  // Handlers
  const handleTypeSelect = (type) => {
    if (holdToken) {
      publicService.releaseHold(slug, holdToken).catch(() => {});
      setHoldToken(null);
      setHoldExpiresAt(null);
    }
    setSelectedType(type);
    setSelectedTime('');
  };

  const handleDateSelect = (dateStr) => {
    if (holdToken) {
      publicService.releaseHold(slug, holdToken).catch(() => {});
      setHoldToken(null);
      setHoldExpiresAt(null);
    }
    setSelectedDate(dateStr);
    setSelectedTime('');
  };

  const handleSlotSelect = async (time) => {
    setSelectedTime(time);
    try {
      // Place a 5-minute temporary hold on the selected slot
      const res = await publicService.holdSlot(slug, {
        date: selectedDate,
        time,
        startTime: time,
        appointmentTypeId: selectedType?._id,
      });

      if (res.data?.holdToken) {
        setHoldToken(res.data.holdToken);
        setHoldExpiresAt(res.data.holdExpiresAt);
        toast.info('Slot reserved for you for 5 minutes.');
      }
      setCurrentStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'This slot was just booked by another customer. Please select another available time.';
      toast.error(message);
      fetchSlots(); // Refresh live slots
    }
  };

  const handleBackToStep1 = () => {
    if (holdToken) {
      publicService.releaseHold(slug, holdToken).catch(() => {});
      setHoldToken(null);
      setHoldExpiresAt(null);
    }
    setCurrentStep(1);
    fetchSlots();
  };

  // 5. Booking Submission
  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();

    const storedUser = typeof window !== 'undefined' ? (() => {
      try {
        const raw = localStorage.getItem('bs_user');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })() : null;

    const currentUser = user || storedUser;

    if (!currentUser && !(typeof window !== 'undefined' && localStorage.getItem('bs_token'))) {
      toast.error('Please sign in or create an account to complete your booking.');
      if (typeof window !== 'undefined') {
        const redirectUrl = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      return;
    }

    if (!patientName.trim()) {
      toast.error('Please enter customer full name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const effectivePaymentMode = paymentMode === 'OFFLINE' ? 'PAY_AT_CLINIC' : paymentMode;
      const payload = {
        userId: currentUser?._id || user?._id || undefined,
        appointmentTypeId: selectedType?._id,
        date: selectedDate,
        time: selectedTime,
        startTime: selectedTime,
        customerName: patientName.trim(),
        customerEmail: patientEmail.trim() || undefined,
        customerPhone: patientPhone.trim(),
        reason: reason.trim() || undefined,
        paymentMode: effectivePaymentMode,
        holdToken: holdToken || undefined,
      };

      const res = await publicService.createAppointment(slug, payload);
      const appointment = res.data?.appointment;

      // Clear active hold
      setHoldToken(null);
      setHoldExpiresAt(null);

      if (paymentMode === 'ONLINE' && res.data?.paymentRequired) {
        setPendingOrder({
          appointment,
          payment: res.data.payment,
          paymentToken: res.data.paymentToken,
        });
        setShowCheckoutModal(true);
        toast.info('Proceeding to secure checkout gateway...');
      } else {
        setConfirmedBooking(appointment);
        setCurrentStep(3);
        toast.success('Appointment booked successfully!');
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch { }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'This slot was just booked by another customer. Please select another available time.';
      toast.error(errorMsg);
      if (err.response?.status === 409) {
        setCurrentStep(1);
        fetchSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };


  // 6. Simulated / Live Payment Finalizer
  const handleSimulatedPayment = async (success = true) => {
    if (!pendingOrder) return;
    setProcessingCheckout(true);
    setCheckoutError(null);

    try {
      if (success) {
        const verifyRes = await paymentService.verifyMockPayment({
          paymentId: pendingOrder.payment?._id || pendingOrder.payment?.id,
          method: selectedCheckoutMethod,
        });

        setShowCheckoutModal(false);
        setConfirmedPayment(verifyRes.data?.payment);
        setConfirmedBooking({
          ...pendingOrder.appointment,
          paymentStatus: 'PAID',
        });
        setCurrentStep(3);
        toast.success('Payment verified & appointment confirmed!');
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch { }
      } else {
        setCheckoutError('Payment authorization failed. Please retry.');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessingCheckout(false);
    }
  };

  // 7. PDF Slip Download
  const handleDownloadPdf = () => {
    if (!confirmedBooking || !profile) return;
    setDownloadingPdf(true);
    try {
      generateAppointmentPdf(confirmedBooking, profile);
      toast.success('PDF appointment slip downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF slip');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 8. Calendar & WhatsApp URLs
  const icsDownloadUrl = useMemo(() => {
    if (!confirmedBooking) return '';
    return createIcsDownloadUrl(confirmedBooking, profile);
  }, [confirmedBooking, profile]);

  const whatsappShareUrl = useMemo(() => {
    if (!confirmedBooking || !profile) return '';
    const dateFormatted = formatDisplayDate(confirmedBooking.date);
    const timeFormatted = format12Hour(confirmedBooking.startTime);
    const text = encodeURIComponent(
      `📅 *Appointment Confirmed!*\\n\\n` +
      `👤 *Patient:* ${confirmedBooking.customerName}\\n` +
      `🩺 *Practitioner:* ${profile.name}\\n` +
      `🗓️ *Date:* ${dateFormatted}\\n` +
      `⏰ *Time:* ${timeFormatted} IST\\n` +
      `🔢 *Booking Ref:* ${confirmedBooking.appointmentCode || 'Confirmed'}\\n` +
      `📍 *Location:* ${profile.address || ''}, ${profile.city || ''}\\n\\n` +
      `Booked securely via BookSaathi.`
    );
    return `https://wa.me/?text=${text}`;
  }, [confirmedBooking, profile]);

  const handleBookAnother = () => {
    setCurrentStep(1);
    setConfirmedBooking(null);
    setConfirmedPayment(null);
    setSelectedTime('');
    fetchSlots();
  };

  const openInvoice = () => {
    const paymentId = confirmedPayment?._id || confirmedBooking?.paymentId;
    if (paymentId) {
      window.open(`/payments/invoice/${paymentId}`, '_blank');
    } else {
      toast.info('Invoice is available after checkout confirmation');
    }
  };

  const currentFee = selectedType?.fee || profile?.consultationFee || 500;

  return {
    user,
    authLoading,
    profile,
    loadingProfile,
    error,
    currentStep,
    selectedType,
    selectedDate,
    selectedTime,
    availableDays,
    slots,
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
    holdToken,
    holdExpiresAt,
    handleTypeSelect,
    handleDateSelect,
    handleSlotSelect,
    handleBackToStep1,
    handleSubmitBooking,
    handleSimulatedPayment,
    handleDownloadPdf,
    handleBookAnother,
    openInvoice,
  };
}

