
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
import { connectSocket, joinQueueRoom, leaveQueueRoom } from '@/lib/socket';

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

  // Patient details form (auto-filled from authenticated user or localStorage)
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [reason, setReason] = useState('');
  const [paymentMode, setPaymentMode] = useState('OFFLINE'); // 'OFFLINE' (Pay at Clinic) or 'ONLINE'

  // Anti-spam states
  const [websiteHp, setWebsiteHp] = useState('');
  const [formLoadTime, setFormLoadTime] = useState(Date.now());

  // Auto-fill from localStorage for returning guest patients
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bs_patient_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && !patientName) setPatientName(parsed.name);
          if (parsed.phone && !patientPhone) setPatientPhone(parsed.phone);
          if (parsed.email && !patientEmail) setPatientEmail(parsed.email);
        }
      } catch (e) {}
    }
  }, []);

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

  // Booking Email OTP Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sendingBookingOtp, setSendingBookingOtp] = useState(false);
  const [verifyingBookingOtp, setVerifyingBookingOtp] = useState(false);
  const [otpModalError, setOtpModalError] = useState(null);

  // Queue state (for QUEUE booking mode)
  const [queueStatus, setQueueStatus] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

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
          if (rawProfile.liveQueueStatus) {
            setQueueStatus(rawProfile.liveQueueStatus);
          }
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

  const isQueueMode = profile?.bookingType === 'QUEUE';
  const timezone = profile?.bookingSettings?.timezone || profile?.timezone || 'Asia/Kolkata';

  // 2. Generate 14-day date strip aligned with timezone and weekly availability
  const availableDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const weeklyAvailability = profile?.weeklyAvailability || [];
    const hasWeeklyConfig = weeklyAvailability.length > 0;
    const weeklyMap = new Map(weeklyAvailability.map((w) => [w.dayOfWeek, w]));

    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = formatDateYYYYMMDD(d, timezone);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: timezone });
      const dayNum = d.toLocaleDateString('en-IN', { day: 'numeric', timeZone: timezone });
      const monthName = d.toLocaleDateString('en-IN', { month: 'short', timeZone: timezone });

      const [year, month, dayNumber] = dateStr.split('-').map(Number);
      const dateUtc = new Date(Date.UTC(year, month - 1, dayNumber));
      const dayOfWeek = dateUtc.getUTCDay();

      let isClosed = false;
      if (hasWeeklyConfig) {
        const config = weeklyMap.get(dayOfWeek);
        isClosed = !config || !config.enabled || !config.timeRanges?.length;
      } else {
        // Default: Sunday is closed
        isClosed = dayOfWeek === 0;
      }

      days.push({
        dateStr,
        dayName,
        dayNum,
        monthName,
        dayOfWeek,
        isClosed,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return days;
  }, [timezone, profile?.weeklyAvailability]);

  // Set default selected date to first open working day once days are computed
  useEffect(() => {
    if (availableDays.length > 0) {
      const currentSelectedObj = availableDays.find((d) => d.dateStr === selectedDate);
      if (!currentSelectedObj || (currentSelectedObj.isClosed && availableDays.some((d) => !d.isClosed))) {
        const firstOpenDay = availableDays.find((d) => !d.isClosed) || availableDays[0];
        setSelectedDate(firstOpenDay.dateStr);
      }
    }
  }, [availableDays, selectedDate]);

  // Fetch live queue status when date or slug changes (in QUEUE mode)
  const fetchQueueStatus = useCallback(async (dateToFetch) => {
    const targetDate = dateToFetch || selectedDate;
    if (!slug || !targetDate || !isQueueMode) return;
    setLoadingQueue(true);
    try {
      const res = await publicService.getQueueStatus(slug, targetDate);
      if (res.data) {
        setQueueStatus(res.data);
      }
    } catch {
      // Keep existing status on transient error
    } finally {
      setLoadingQueue(false);
    }
  }, [slug, selectedDate, isQueueMode]);

  useEffect(() => {
    if (isQueueMode && selectedDate) {
      fetchQueueStatus(selectedDate);
    }
  }, [isQueueMode, selectedDate, fetchQueueStatus]);

  // Real-time Queue updates via socket
  useEffect(() => {
    if (!isQueueMode || !profile?._id || !selectedDate) return;

    let socketInstance = null;
    try {
      socketInstance = connectSocket();
      joinQueueRoom(profile._id, selectedDate);

      const handleQueueUpdate = (data) => {
        if (data.dateString === selectedDate) {
          setQueueStatus((prev) => ({
            ...prev,
            ...data,
          }));
        }
      };

      const handleQueueCalled = (data) => {
        if (data.dateString === selectedDate) {
          setQueueStatus((prev) => ({
            ...prev,
            currentCallingNumber: data.queueNumber,
            currentCallingAppointment: data.appointment,
          }));
        }
      };

      if (socketInstance) {
        socketInstance.on('queue:updated', handleQueueUpdate);
        socketInstance.on('queue:called', handleQueueCalled);
      }

      return () => {
        leaveQueueRoom(profile._id, selectedDate);
        if (socketInstance) {
          socketInstance.off('queue:updated', handleQueueUpdate);
          socketInstance.off('queue:called', handleQueueCalled);
        }
      };
    } catch (e) {
      // Graceful fallback
    }
  }, [isQueueMode, profile?._id, selectedDate]);

  // 3. Fetch Time Slots for Selected Date & Type (Only in TIME_SLOT mode)
  const fetchSlots = useCallback(async () => {
    if (!slug || !selectedDate || loadingProfile || isQueueMode) return;
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
  }, [slug, selectedDate, selectedType, loadingProfile, profile, isQueueMode]);

  useEffect(() => {
    if (!isQueueMode) {
      fetchSlots();
    }
  }, [fetchSlots, isQueueMode]);

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
    const loadTime = Date.now();
    setFormLoadTime(loadTime);
    try {
      // Place a 3-minute temporary hold on the selected slot
      const res = await publicService.holdSlot(slug, {
        date: selectedDate,
        time,
        startTime: time,
        appointmentTypeId: selectedType?._id,
        website_hp: websiteHp,
        formLoadTime: loadTime,
      });

      if (res.data?.holdToken) {
        setHoldToken(res.data.holdToken);
        setHoldExpiresAt(res.data.holdExpiresAt);
        toast.info('Slot reserved for you for 3 minutes.');
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

  // 5. Booking Submission & OTP Verification Flow
  const executeBooking = async (otpOptions = {}) => {
    const storedUser = typeof window !== 'undefined' ? (() => {
      try {
        const raw = localStorage.getItem('bs_user');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })() : null;

    const currentUser = user || storedUser;

    const otp = typeof otpOptions === 'string' ? otpOptions : otpOptions?.otp;
    const otpVerificationToken = typeof otpOptions === 'object' ? otpOptions?.otpVerificationToken : undefined;

    setSubmitting(true);
    try {
      const effectivePaymentMode = paymentMode === 'OFFLINE' ? 'PAY_AT_CLINIC' : paymentMode;
      const isQueue = profile?.bookingType === 'QUEUE';

      const payload = {
        userId: currentUser?._id || user?._id || undefined,
        appointmentTypeId: selectedType?._id,
        date: selectedDate,
        dateString: selectedDate,
        time: isQueue ? undefined : selectedTime,
        startTime: isQueue ? undefined : selectedTime,
        bookingType: isQueue ? 'QUEUE' : 'TIME_SLOT',
        customerName: patientName.trim(),
        customerEmail: patientEmail.trim() || undefined,
        customerPhone: patientPhone.trim(),
        reason: reason.trim() || undefined,
        paymentMode: effectivePaymentMode,
        holdToken: isQueue ? undefined : (holdToken || undefined),
        website_hp: websiteHp,
        formLoadTime,
        otp: otp ? String(otp).trim() : undefined,
        otpVerificationToken: otpVerificationToken || undefined,
      };

      const res = isQueue
        ? await publicService.joinQueue(slug, payload)
        : await publicService.createAppointment(slug, payload);

      const rawAppointment = res.data?.appointment || res.data || {};

      const finalAppointment = {
        ...rawAppointment,
        customerName: patientName.trim() || rawAppointment?.customerName,
        customerPhone: patientPhone.trim() || rawAppointment?.customerPhone,
        customerEmail: patientEmail.trim() || rawAppointment?.customerEmail,
        appointmentTypeName: selectedType?.name || rawAppointment?.appointmentTypeName || 'General Consultation',
        fee: currentFee || rawAppointment?.fee || 500,
        startTime: isQueue ? undefined : (selectedTime || rawAppointment?.startTime),
        date: selectedDate || rawAppointment?.date || rawAppointment?.dateString,
        dateString: selectedDate || rawAppointment?.dateString,
      };

      // Save customer contact in local storage for instant 1-tap re-booking
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'bs_patient_profile',
            JSON.stringify({
              name: patientName.trim(),
              phone: patientPhone.trim(),
              email: patientEmail.trim(),
            })
          );
        } catch (err) {}
      }

      // Clear active hold
      setHoldToken(null);
      setHoldExpiresAt(null);

      if (paymentMode === 'ONLINE' && res.data?.paymentRequired) {
        setPendingOrder({
          appointment: finalAppointment,
          payment: res.data.payment,
          paymentToken: res.data.paymentToken,
        });
        setShowCheckoutModal(true);
        toast.info('Proceeding to secure checkout gateway...');
      } else {
        setConfirmedBooking(finalAppointment);
        setCurrentStep(3);
        if (isQueue) {
          toast.success(`Queue Token #${finalAppointment.queueNumber || 1} Confirmed!`);
        } else {
          toast.success('Appointment booked successfully!');
        }
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch { }
      }
      return finalAppointment;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Booking request could not be processed. Please try again.';
      toast.error(errorMsg);
      if (err.response?.status === 409 && profile?.bookingType !== 'QUEUE') {
        setCurrentStep(1);
        fetchSlots();
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();

    if (!patientName.trim()) {
      toast.error('Please enter customer full name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // If patient entered an email, send OTP verification code first
    if (patientEmail && patientEmail.includes('@')) {
      setSendingBookingOtp(true);
      setOtpModalError(null);
      try {
        await publicService.sendEmailOtp(slug, {
          email: patientEmail.trim(),
          customerName: patientName.trim(),
        });
        setShowOtpModal(true);
        toast.info(`Verification code sent to ${patientEmail}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not send verification code');
      } finally {
        setSendingBookingOtp(false);
      }
      return;
    }

    // Direct booking if no email provided
    await executeBooking();
  };

  const handleVerifyOtpAndConfirm = async (otp) => {
    setVerifyingBookingOtp(true);
    setOtpModalError(null);
    try {
      // Step 1: Verify OTP with server specifically for this email
      const verifyRes = await publicService.verifyEmailOtp(slug, {
        email: patientEmail.trim(),
        otp: String(otp).trim(),
      });

      const otpVerificationToken = verifyRes.data?.otpVerificationToken;

      // Step 2: Complete booking with verified token
      await executeBooking({
        otp: String(otp).trim(),
        otpVerificationToken,
      });

      setShowOtpModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP verification code';
      setOtpModalError(msg);
    } finally {
      setVerifyingBookingOtp(false);
    }
  };

  const handleResendBookingOtp = async () => {
    if (!patientEmail) return;
    setSendingBookingOtp(true);
    setOtpModalError(null);
    try {
      await publicService.sendEmailOtp(slug, {
        email: patientEmail.trim(),
        customerName: patientName.trim(),
      });
      toast.success('New OTP sent to your email');
    } catch (err) {
      setOtpModalError(err.response?.data?.message || 'Could not resend OTP');
    } finally {
      setSendingBookingOtp(false);
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
        toast.success('Payment verified & token confirmed!');
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
      const passData = {
        ...confirmedBooking,
        customerName: confirmedBooking.customerName || patientName.trim() || 'Visitor',
        customerPhone: confirmedBooking.customerPhone || patientPhone.trim() || 'N/A',
        customerEmail: confirmedBooking.customerEmail || patientEmail.trim() || 'Not Provided',
        appointmentTypeName: confirmedBooking.appointmentTypeName || selectedType?.name || 'General Consultation',
        fee: confirmedBooking.fee || currentFee,
        startTime: confirmedBooking.startTime || selectedTime,
        date: confirmedBooking.date || confirmedBooking.dateString || selectedDate,
        dateString: confirmedBooking.dateString || selectedDate,
      };
      generateAppointmentPdf(passData, profile);
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
    const dateFormatted = formatDisplayDate(confirmedBooking.date || confirmedBooking.dateString);
    const isQueue = confirmedBooking.bookingType === 'QUEUE' || confirmedBooking.queueNumber;

    let text = '';
    if (isQueue) {
      text = encodeURIComponent(
        `Live Queue Token Confirmed!\n\n` +
        `Patient: ${confirmedBooking.customerName}\n` +
        `Practitioner: ${profile.name}\n` +
        `Queue Token: #${confirmedBooking.queueNumber}\n` +
        `Date: ${dateFormatted}\n` +
        `Estimated Wait: ~${confirmedBooking.estimatedWaitMinutes || 30} mins\n` +
        `Ref Code: ${confirmedBooking.appointmentCode || 'Confirmed'}\n` +
        `Location: ${profile.address || ''}, ${profile.city || ''}\n\n` +
        `Track live queue updates via BookSaathi.`
      );
    } else {
      const timeFormatted = format12Hour(confirmedBooking.startTime);
      text = encodeURIComponent(
        `Appointment Confirmed!\n\n` +
        `Patient: ${confirmedBooking.customerName}\n` +
        `Practitioner: ${profile.name}\n` +
        `Date: ${dateFormatted}\n` +
        `Time: ${timeFormatted} IST\n` +
        `Booking Ref: ${confirmedBooking.appointmentCode || 'Confirmed'}\n` +
        `Location: ${profile.address || ''}, ${profile.city || ''}\n\n` +
        `Booked securely via BookSaathi.`
      );
    }
    return `https://wa.me/?text=${text}`;
  }, [confirmedBooking, profile]);

  const handleBookAnother = () => {
    setCurrentStep(1);
    setConfirmedBooking(null);
    setConfirmedPayment(null);
    setSelectedTime('');
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setReason('');
    if (isQueueMode) {
      fetchQueueStatus(selectedDate);
    } else {
      fetchSlots();
    }
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
    isQueueMode,
    queueStatus,
    loadingQueue,
    fetchQueueStatus,
    currentStep,
    setCurrentStep,
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
    websiteHp,
    setWebsiteHp,
    formLoadTime,
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

