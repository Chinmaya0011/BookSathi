import crypto from 'crypto';

/**
 * Base Payment Gateway Adapter Interface
 * All concrete gateway implementations (Simulated, Razorpay, Stripe, Cashfree, etc.) must implement these methods.
 */
export class BasePaymentGateway {
  constructor(name) {
    this.name = name;
  }

  /**
   * Create an Order with the gateway
   * @param {Object} params - { amount, currency, receipt, customer, notes }
   * @returns {Promise<{ orderId: string, amount: number, currency: string, clientSecret?: string, raw: any }>}
   */
  async createOrder(params) {
    throw new Error(`createOrder not implemented on ${this.name}`);
  }

  /**
   * Verify Payment Signature or Status
   * @param {Object} params - { orderId, paymentId, signature, rawPayload }
   * @returns {Promise<{ isValid: boolean, status: string, paymentId: string, raw: any }>}
   */
  async verifyPayment(params) {
    throw new Error(`verifyPayment not implemented on ${this.name}`);
  }

  /**
   * Process a Refund
   * @param {Object} params - { paymentId, amount, reason, notes }
   * @returns {Promise<{ refundId: string, amount: number, status: string, raw: any }>}
   */
  async processRefund(params) {
    throw new Error(`processRefund not implemented on ${this.name}`);
  }

  /**
   * Fetch payment status directly from Gateway
   * @param {string} paymentId
   * @returns {Promise<any>}
   */
  async getPaymentDetails(paymentId) {
    throw new Error(`getPaymentDetails not implemented on ${this.name}`);
  }
}

// Registry of available gateway drivers
const registeredGateways = new Map();

export const registerGateway = (name, gatewayInstance) => {
  registeredGateways.set(name.toUpperCase(), gatewayInstance);
};

export const getPaymentGateway = (providerName) => {
  const selected = (providerName || process.env.PAYMENT_GATEWAY_DEFAULT || 'SIMULATED').toUpperCase();
  const gateway = registeredGateways.get(selected);
  if (!gateway) {
    // Fallback to SIMULATED if requested driver is not initialized
    const fallback = registeredGateways.get('SIMULATED');
    if (fallback) return fallback;
    throw new Error(`Payment gateway provider '${selected}' is not registered.`);
  }
  return gateway;
};
