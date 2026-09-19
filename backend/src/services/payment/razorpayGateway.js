import crypto from 'crypto';
import { BasePaymentGateway, registerGateway } from './gatewayAdapter.js';

/**
 * Razorpay Payment Gateway Driver (Ready for API Keys)
 * Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to activate
 */
export class RazorpayPaymentGateway extends BasePaymentGateway {
  constructor() {
    super('RAZORPAY');
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.isConfigured = Boolean(this.keyId && this.keySecret);
  }

  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    if (!this.isConfigured) {
      console.warn('Razorpay keys not configured. Falling back to simulated order.');
      const orderId = `order_rzp_mock_${Date.now()}`;
      return {
        orderId,
        amount,
        currency,
        receipt,
        status: 'created',
        provider: 'RAZORPAY',
        keyId: this.keyId || 'rzp_test_placeholder',
        raw: { id: orderId, amount: Math.round(amount * 100), currency },
      };
    }

    // When Razorpay SDK is installed and keys configured:
    // const Razorpay = (await import('razorpay')).default;
    // const instance = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    // const order = await instance.orders.create({ amount: Math.round(amount * 100), currency, receipt, notes });
    // return { orderId: order.id, amount, currency, receipt, status: order.status, raw: order };

    // Standard REST fallback
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || 'Razorpay Order Creation Failed');
    }

    return {
      orderId: data.id,
      amount,
      currency,
      receipt,
      status: data.status,
      provider: 'RAZORPAY',
      keyId: this.keyId,
      raw: data,
    };
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    if (!this.isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        const err = new Error('Razorpay gateway keys are not configured in production environment.');
        err.statusCode = 500;
        throw err;
      }
      // Mock validation only in development/test mode
      return {
        isValid: true,
        status: 'SUCCESS',
        paymentId: paymentId || `pay_rzp_mock_${Date.now()}`,
        orderId,
        raw: { mock: true, provider: 'RAZORPAY' },
      };
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = expectedSignature === signature;

    return {
      isValid,
      status: isValid ? 'SUCCESS' : 'FAILED',
      paymentId,
      orderId,
      raw: { signature, expectedSignature, isValid },
    };
  }

  async processRefund({ paymentId, amount, reason }) {
    if (!this.isConfigured) {
      return {
        refundId: `rfnd_rzp_mock_${Date.now()}`,
        paymentId,
        amount,
        status: 'PROCESSED',
        reason,
        raw: { mock: true },
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount ? Math.round(amount * 100) : undefined,
        notes: { reason },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || 'Razorpay Refund Failed');
    }

    return {
      refundId: data.id,
      paymentId,
      amount: data.amount / 100,
      status: data.status === 'processed' ? 'PROCESSED' : 'PENDING',
      reason,
      raw: data,
    };
  }

  async getPaymentDetails(paymentId) {
    if (!this.isConfigured) return { id: paymentId, mock: true };
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.json();
  }
}

const razorpayInstance = new RazorpayPaymentGateway();
registerGateway('RAZORPAY', razorpayInstance);
