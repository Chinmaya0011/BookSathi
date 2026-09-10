'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { qrBannerService } from '@/services/qrBanner.service';
import { calculateQrBannerPrice, QR_BANNER_PLANS } from '@/lib/qrPricingCalculator';
import { useAuth } from '@/hooks/useAuth';
import { useQrBannerStore } from '@/stores/useQrBannerStore';

export function useQrBannerOrder() {
  const { profile, user } = useAuth();
  const { hasActivePurchase, order: activeOrder, fetchMyOrder, setOrderOptimistic } = useQrBannerStore();

  const [selectedPlanKey, setSelectedPlanKey] = useState('HALF_YEARLY');
  const [selectedDesign, setSelectedDesign] = useState('classic-indigo');

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Odisha',
    pincode: '',
    landmark: '',
  });

  // Modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [pendingCreatedOrder, setPendingCreatedOrder] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [checkoutError, setCheckoutError] = useState(null);

  // Auto-populate shipping form from profile
  useEffect(() => {
    if (profile) {
      setShippingForm((prev) => ({
        ...prev,
        recipientName: prev.recipientName || profile.name || '',
        phone: prev.phone || profile.phone || '',
        street: prev.street || profile.address || '',
        city: prev.city || profile.city || 'Bhubaneswar',
        state: prev.state || profile.state || 'Odisha',
      }));
    }
  }, [profile]);

  // Initial fetch of active order
  useEffect(() => {
    if (user) {
      fetchMyOrder();
    }
  }, [user, fetchMyOrder]);

  // Dynamic live pricing calculation for the selected plan
  const currentPricing = useMemo(() => {
    return calculateQrBannerPrice(selectedPlanKey);
  }, [selectedPlanKey]);

  const handleShippingChange = (field, value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlanKey(planKey);
  };

  const handleSelectDesign = (designId) => {
    setSelectedDesign(designId);
  };

  const handleOpenReview = () => {
    setReviewModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    if (e) e.preventDefault();

    if (!shippingForm.recipientName.trim() || !shippingForm.phone.trim() || !shippingForm.street.trim() || !shippingForm.city.trim() || !shippingForm.pincode.trim()) {
      toast.error('Please fill in all required shipping address fields.');
      return;
    }

    if (shippingForm.pincode.replace(/\D/g, '').length !== 6) {
      toast.error('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        planKey: selectedPlanKey,
        bannerDesignId: selectedDesign,
        shippingAddress: shippingForm,
        customization: {
          doctorName: profile?.name || '',
          specialization: profile?.specialization || profile?.profession || '',
          clinicAddress: [profile?.address, profile?.city].filter(Boolean).join(', '),
          phone: profile?.phone || '',
          qrTargetUrl: `https://booksaathi.in/book/${profile?.bookingSlug}`,
        },
      };

      const res = await qrBannerService.createOrder(payload);
      const createdOrder = res.data?.order;

      setPendingCreatedOrder(createdOrder);
      setReviewModalOpen(false);
      setCheckoutModalOpen(true);
      toast.info('Order created! Please complete payment to confirm dispatch.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleProcessPayment = async (success = true) => {
    if (!pendingCreatedOrder) return;
    setProcessingPayment(true);
    setCheckoutError(null);

    try {
      if (success) {
        const res = await qrBannerService.verifyPayment(
          pendingCreatedOrder._id,
          paymentMethod
        );

        const confirmedOrder = res.data;
        setOrderOptimistic(confirmedOrder);
        setCheckoutModalOpen(false);
        setPendingCreatedOrder(null);
        toast.success('🎉 QR & Banner Order Confirmed! Printing queue started.');
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        setCheckoutError('Payment transaction was declined or cancelled. Please retry.');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  return {
    profile,
    hasActivePurchase,
    activeOrder,
    plans: QR_BANNER_PLANS,
    selectedPlanKey,
    selectedDesign,
    currentPricing,
    shippingForm,
    reviewModalOpen,
    setReviewModalOpen,
    checkoutModalOpen,
    setCheckoutModalOpen,
    pendingCreatedOrder,
    submittingOrder,
    processingPayment,
    paymentMethod,
    setPaymentMethod,
    checkoutError,
    handleShippingChange,
    handleSelectPlan,
    handleSelectDesign,
    handleOpenReview,
    handleCreateOrder,
    handleProcessPayment,
  };
}
