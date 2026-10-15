import crypto from 'crypto';
import { BasePaymentGateway, registerGateway } from './gatewayAdapter.js';

/**
 * Cashfree Payment Gateway Adapter (Cashfree PG API v2023-08-01)
 *
 * Supports:
 * - Order Creation (generates payment_session_id for Cashfree Drop / Checkout)
 * - UPI, Cards, Net Banking, Wallets
 * - Server-to-Server Payment Verification
 * - Webhook HMAC-SHA256 Signature Verification
 * - Automated & Manual Order Refunds
 * - Sandbox & Production switching via environment variables
 */
export class CashfreePaymentGateway extends BasePaymentGateway {
  constructor() {
    super('CASHFREE');
    this.appId = process.env.CASHFREE_APP_ID || '';
    this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
    this.apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
    this.environment = (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase();
    this.baseUrl =
      this.environment === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
    this.isConfigured = Boolean(this.appId && this.secretKey);
  }

  /**
   * Helper to build Cashfree standard headers
   */
  getHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
      'x-api-version': this.apiVersion,
      'x-request-id': `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      ...customHeaders,
    };
  }

  /**
   * Format Cashfree-safe Order ID (alphanumeric, underscores, hyphens, max 45 chars)
   */
  formatOrderId(prefix = 'order', code = '') {
    const cleanCode = (code || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
    const rand = crypto.randomBytes(3).toString('hex');
    const timestamp = Date.now();
    return `${prefix}_${cleanCode ? `${cleanCode}_` : ''}${timestamp}_${rand}`.slice(0, 45);
  }

  /**
   * Create an Order with Cashfree PG API
   * @param {Object} params - { amount, currency, receipt, customer, notes, returnUrl, notifyUrl }
   * @returns {Promise<{ orderId: string, cfOrderId: string, paymentSessionId: string, amount: number, currency: string, status: string, provider: string, environment: string, raw: any }>}
   */
  async createOrder({
    amount,
    currency = 'INR',
    receipt,
    customer = {},
    notes = {},
    returnUrl,
    notifyUrl,
  }) {
    const formattedAmount = Number(Number(amount).toFixed(2));
    const orderId = this.formatOrderId('cf_ord', receipt);

    // Cashfree Demo Mode when API credentials are not configured
    if (!this.isConfigured) {
      const demoOrderId = this.formatOrderId('cf_demo_ord', receipt);
      const demoSessionId = `session_demo_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
      const demoCfOrderId = `cf_demo_${Date.now()}`;

      return {
        orderId: demoOrderId,
        cfOrderId: demoCfOrderId,
        paymentSessionId: demoSessionId,
        amount: formattedAmount,
        currency,
        receipt,
        status: 'ACTIVE',
        provider: 'CASHFREE',
        environment: 'DEMO',
        isDemo: true,
        isSimulated: true,
        demoNotice: 'Cashfree Demo Mode: No API keys configured. Transactions are strictly for demonstration.',
        raw: {
          order_id: demoOrderId,
          cf_order_id: demoCfOrderId,
          order_amount: formattedAmount,
          order_currency: currency,
          order_status: 'ACTIVE',
          payment_session_id: demoSessionId,
          is_demo: true,
        },
      };
    }

    // Sanitize customer details according to Cashfree PG constraints
    const cleanPhone = (customer.phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    const validPhone = cleanPhone.length === 10 ? cleanPhone : '9999999999';

    const customerId = (customer.id || customer.userId || `cust_${crypto.randomBytes(4).toString('hex')}`)
      .toString()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 50);

    const payload = {
      order_id: orderId,
      order_amount: formattedAmount,
      order_currency: currency.toUpperCase(),
      customer_details: {
        customer_id: customerId,
        customer_name: (customer.name || 'Customer').trim().slice(0, 100),
        customer_email: (customer.email || 'customer@booksaathi.in').trim().toLowerCase(),
        customer_phone: validPhone,
      },
      order_meta: {
        return_url:
          returnUrl ||
          `${process.env.CLIENT_URL || 'http://localhost:3000'}/book/status?order_id={order_id}`,
        notify_url:
          notifyUrl ||
          `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      },
      order_note: (notes?.description || notes?.appointmentCode || `Consultation booking`).slice(0, 200),
      order_tags: notes ? Object.fromEntries(
        Object.entries(notes).map(([k, v]) => [k.slice(0, 50), String(v).slice(0, 100)])
      ) : {},
    };

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error?.description || data.error || 'Failed to create Cashfree order';
        console.error('Cashfree Order Creation API Error:', data);
        const err = new Error(errorMsg);
        err.statusCode = response.status || 400;
        err.raw = data;
        throw err;
      }

      return {
        orderId: data.order_id,
        cfOrderId: String(data.cf_order_id || ''),
        paymentSessionId: data.payment_session_id,
        amount: data.order_amount,
        currency: data.order_currency,
        receipt,
        status: data.order_status,
        provider: 'CASHFREE',
        environment: this.environment,
        raw: data,
      };
    } catch (error) {
      if (error.statusCode) throw error;
      const err = new Error(`Cashfree network failure: ${error.message}`);
      err.statusCode = 502;
      throw err;
    }
  }

  /**
   * Verify Payment Status directly with Cashfree API
   * @param {Object} params - { orderId, paymentId, simulateFailure }
   */
  async verifyPayment({ orderId, paymentId, simulateFailure = false }) {
    // Cashfree Demo Mode verification when API keys are not configured or demo order
    const isDemoOrder = !this.isConfigured || orderId?.includes('_demo_') || orderId?.startsWith('session_mock_') || orderId?.startsWith('cf_demo_');
    if (isDemoOrder) {
      if (simulateFailure) {
        return {
          isValid: false,
          status: 'FAILED',
          isDemo: true,
          error: 'Simulated payment failure (declined in Cashfree Demo Mode)',
          orderId,
          paymentId: paymentId || `cf_demo_pay_failed_${Date.now()}`,
          raw: { is_demo: true, provider: 'CASHFREE', status: 'DEMO_FAILED' },
        };
      }

      return {
        isValid: true,
        status: 'SUCCESS',
        isDemo: true,
        paymentId: paymentId || `cf_demo_pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        orderId,
        paymentMethod: 'CASHFREE_DEMO',
        raw: {
          is_demo: true,
          provider: 'CASHFREE',
          status: 'DEMO_SUCCESS',
          note: 'Verified via Cashfree Demo Simulation (No live charges were processed)',
        },
      };
    }

    if (!orderId) {
      const err = new Error('Order ID is required for Cashfree payment verification');
      err.statusCode = 400;
      throw err;
    }

    try {
      // 1. Fetch Order status from Cashfree
      const orderRes = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        const err = new Error(orderData.message || 'Cashfree Order Verification Failed');
        err.statusCode = orderRes.status || 400;
        err.raw = orderData;
        throw err;
      }

      // 2. Fetch Payments for this Order
      let paymentsData = [];
      try {
        const paymentsRes = await fetch(`${this.baseUrl}/orders/${orderId}/payments`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
        if (paymentsRes.ok) {
          paymentsData = await paymentsRes.json();
        }
      } catch (err) {
        console.warn('Could not fetch Cashfree payments list:', err.message);
      }

      // Find successful payment transaction
      const successfulPayment = Array.isArray(paymentsData)
        ? paymentsData.find((p) => p.payment_status === 'SUCCESS')
        : null;

      const latestPayment = Array.isArray(paymentsData) && paymentsData.length > 0
        ? paymentsData[paymentsData.length - 1]
        : null;

      const isPaid = orderData.order_status === 'PAID' || Boolean(successfulPayment);
      const isFailed =
        orderData.order_status === 'EXPIRED' ||
        orderData.order_status === 'TERMINATED' ||
        (latestPayment && (latestPayment.payment_status === 'FAILED' || latestPayment.payment_status === 'USER_DROPPED' || latestPayment.payment_status === 'CANCELLED'));

      // Resolve mapped payment method (UPI, CARD, NETBANKING, WALLET, etc.)
      let resolvedMethod = 'GATEWAY';
      const targetPaymentObj = successfulPayment || latestPayment;
      if (targetPaymentObj?.payment_method) {
        const m = targetPaymentObj.payment_method;
        if (m.upi) resolvedMethod = 'UPI';
        else if (m.card) resolvedMethod = 'CARD';
        else if (m.netbanking) resolvedMethod = 'NETBANKING';
        else if (m.app || m.wallet) resolvedMethod = 'WALLET';
      }

      const activePaymentId =
        successfulPayment?.cf_payment_id?.toString() ||
        latestPayment?.cf_payment_id?.toString() ||
        paymentId ||
        orderData.cf_order_id?.toString() ||
        '';

      if (isPaid) {
        return {
          isValid: true,
          status: 'SUCCESS',
          paymentId: activePaymentId,
          orderId: orderData.order_id,
          amount: orderData.order_amount,
          currency: orderData.order_currency,
          paymentMethod: resolvedMethod,
          raw: { order: orderData, payment: successfulPayment || latestPayment },
        };
      }

      if (isFailed) {
        return {
          isValid: false,
          status: 'FAILED',
          error: latestPayment?.payment_message || `Payment ${orderData.order_status}`,
          paymentId: activePaymentId,
          orderId: orderData.order_id,
          paymentMethod: resolvedMethod,
          raw: { order: orderData, payment: latestPayment },
        };
      }

      // Order is still ACTIVE / PENDING
      return {
        isValid: false,
        status: 'PENDING',
        paymentId: activePaymentId,
        orderId: orderData.order_id,
        raw: { order: orderData, payment: latestPayment },
      };
    } catch (error) {
      if (error.statusCode) throw error;
      const err = new Error(`Cashfree verification error: ${error.message}`);
      err.statusCode = 502;
      throw err;
    }
  }

  /**
   * Get Cashfree Order Status / Verification details
   * @param {string} orderId
   */
  async getOrderStatus(orderId) {
    return this.verifyPayment({ orderId });
  }

  /**
   * Verify Cashfree Webhook Signature
   * Signature is HMAC-SHA256 of `${timestamp}${rawBody}` with Cashfree Secret Key (base64 encoded)
   *
   * @param {Object} params - { signature, rawBody, timestamp }
   * @returns {boolean}
   */
  verifyWebhookSignature({ signature, rawBody, timestamp }) {
    if (!this.secretKey) {
      // In dev without keys, allow simulation
      return process.env.NODE_ENV !== 'production';
    }

    if (!signature || !rawBody || !timestamp) {
      return false;
    }

    try {
      const signedPayload = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signedPayload)
        .digest('base64');

      const sigBuf = Buffer.from(signature, 'utf8');
      const expectedBuf = Buffer.from(expectedSignature, 'utf8');

      if (sigBuf.length !== expectedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch (err) {
      console.error('Webhook signature verification exception:', err);
      return false;
    }
  }

  /**
   * Process a Refund with Cashfree PG API
   * @param {Object} params - { orderId, paymentId, amount, reason, speed }
   */
  async processRefund({ orderId, paymentId, amount, reason = 'Customer refund', speed = 'STANDARD' }) {
    if (!this.isConfigured) {
      return {
        refundId: `rfnd_cf_mock_${Date.now()}`,
        cfRefundId: `cf_rfnd_${Date.now()}`,
        paymentId,
        orderId,
        amount,
        status: 'PROCESSED',
        reason,
        raw: { mock: true, provider: 'CASHFREE' },
      };
    }

    const targetOrderId = orderId;
    if (!targetOrderId) {
      const err = new Error('Cashfree refund requires orderId');
      err.statusCode = 400;
      throw err;
    }

    const refundId = this.formatOrderId('rfnd', targetOrderId);
    const payload = {
      refund_id: refundId,
      refund_amount: Number(Number(amount).toFixed(2)),
      refund_note: (reason || 'Consultation refund').slice(0, 100),
      refund_speed: speed,
    };

    try {
      const response = await fetch(`${this.baseUrl}/orders/${targetOrderId}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error?.description || 'Cashfree Refund Failed';
        const err = new Error(errorMsg);
        err.statusCode = response.status || 400;
        err.raw = data;
        throw err;
      }

      const isSuccess = data.refund_status === 'SUCCESS' || data.refund_status === 'PROCESSED';
      return {
        refundId: data.refund_id,
        cfRefundId: String(data.cf_refund_id || ''),
        paymentId,
        orderId: targetOrderId,
        amount: data.refund_amount,
        status: isSuccess ? 'PROCESSED' : data.refund_status || 'PENDING',
        reason,
        raw: data,
      };
    } catch (error) {
      if (error.statusCode) throw error;
      const err = new Error(`Cashfree refund error: ${error.message}`);
      err.statusCode = 502;
      throw err;
    }
  }

  /**
   * Fetch Order & Payment Details from Cashfree
   * @param {string} orderId
   */
  async getPaymentDetails(orderId) {
    if (!this.isConfigured) {
      return { order_id: orderId, mock: true, provider: 'CASHFREE' };
    }
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }
}

// Instantiate and register
const cashfreeInstance = new CashfreePaymentGateway();
registerGateway('CASHFREE', cashfreeInstance);
