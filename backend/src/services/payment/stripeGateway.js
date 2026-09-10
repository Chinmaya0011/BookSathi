import { BasePaymentGateway, registerGateway } from './gatewayAdapter.js';

/**
 * Stripe Payment Gateway Driver (Ready for API Keys)
 * Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env to activate
 */
export class StripePaymentGateway extends BasePaymentGateway {
  constructor() {
    super('STRIPE');
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    this.isConfigured = Boolean(this.secretKey);
  }

  async createOrder({ amount, currency = 'INR', receipt, customer = {}, notes = {} }) {
    if (!this.isConfigured) {
      console.warn('Stripe keys not configured. Returning simulated Stripe intent.');
      const orderId = `pi_stripe_mock_${Date.now()}`;
      return {
        orderId,
        amount,
        currency,
        receipt,
        status: 'requires_payment_method',
        clientSecret: `pi_mock_secret_${Date.now()}`,
        provider: 'STRIPE',
        publishableKey: this.publishableKey || 'pk_test_placeholder',
        raw: { id: orderId, amount: Math.round(amount * 100), currency },
      };
    }

    // When Stripe is configured, call Stripe REST API
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)),
        currency: currency.toLowerCase(),
        'metadata[receipt]': receipt || '',
        'metadata[customerName]': customer.name || '',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe PaymentIntent creation failed');
    }

    return {
      orderId: data.id,
      amount,
      currency,
      receipt,
      status: data.status,
      clientSecret: data.client_secret,
      provider: 'STRIPE',
      publishableKey: this.publishableKey,
      raw: data,
    };
  }

  async verifyPayment({ orderId, paymentId }) {
    if (!this.isConfigured) {
      return {
        isValid: true,
        status: 'SUCCESS',
        paymentId: paymentId || orderId,
        orderId,
        raw: { mock: true, provider: 'STRIPE' },
      };
    }

    const targetId = orderId || paymentId;
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${targetId}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    const data = await response.json();

    const isSuccessful = data.status === 'succeeded';
    return {
      isValid: isSuccessful,
      status: isSuccessful ? 'SUCCESS' : 'PENDING',
      paymentId: data.id,
      orderId: data.id,
      raw: data,
    };
  }

  async processRefund({ paymentId, amount, reason }) {
    if (!this.isConfigured) {
      return {
        refundId: `re_stripe_mock_${Date.now()}`,
        paymentId,
        amount,
        status: 'PROCESSED',
        reason,
        raw: { mock: true },
      };
    }

    const bodyParams = { payment_intent: paymentId };
    if (amount) bodyParams.amount = String(Math.round(amount * 100));
    if (reason) bodyParams.reason = 'requested_by_customer';

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: new URLSearchParams(bodyParams),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe Refund Failed');
    }

    return {
      refundId: data.id,
      paymentId,
      amount: data.amount / 100,
      status: data.status === 'succeeded' ? 'PROCESSED' : 'PENDING',
      reason,
      raw: data,
    };
  }

  async getPaymentDetails(paymentId) {
    if (!this.isConfigured) return { id: paymentId, mock: true };
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentId}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    return response.json();
  }
}

const stripeInstance = new StripePaymentGateway();
registerGateway('STRIPE', stripeInstance);
