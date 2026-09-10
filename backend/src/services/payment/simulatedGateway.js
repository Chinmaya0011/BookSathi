import crypto from 'crypto';
import { BasePaymentGateway, registerGateway } from './gatewayAdapter.js';

/**
 * Simulated / Sandbox Payment Gateway Driver
 * Provides instant end-to-end sandbox testing without needing active 3rd-party credentials.
 */
export class SimulatedPaymentGateway extends BasePaymentGateway {
  constructor() {
    super('SIMULATED');
  }

  async createOrder({ amount, currency = 'INR', receipt, customer = {}, notes = {} }) {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `order_sim_${timestamp}_${randomSuffix}`;

    return {
      orderId,
      amount,
      currency,
      receipt: receipt || `rcpt_${timestamp}`,
      status: 'created',
      clientSecret: `sim_sec_${crypto.randomBytes(12).toString('hex')}`,
      provider: 'SIMULATED',
      raw: {
        id: orderId,
        entity: 'order',
        amount: Math.round(amount * 100), // in paise / minor currency
        currency,
        receipt,
        status: 'created',
        created_at: Math.floor(timestamp / 1000),
      },
    };
  }

  async verifyPayment({ orderId, paymentId, signature, simulateFailure = false }) {
    if (simulateFailure) {
      return {
        isValid: false,
        status: 'FAILED',
        error: 'Simulated payment failure (user declined or card expired)',
        paymentId: paymentId || `pay_sim_failed_${Date.now()}`,
        raw: { error_code: 'SIMULATED_FAILURE', error_description: 'Payment failed in test simulation' },
      };
    }

    const generatedPaymentId = paymentId || `pay_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      isValid: true,
      status: 'SUCCESS',
      paymentId: generatedPaymentId,
      orderId,
      raw: {
        id: generatedPaymentId,
        entity: 'payment',
        status: 'captured',
        order_id: orderId,
        method: 'simulated_card_upi',
        captured: true,
        verified_at: new Date().toISOString(),
      },
    };
  }

  async processRefund({ paymentId, amount, reason }) {
    const refundId = `rfnd_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      refundId,
      paymentId,
      amount,
      status: 'PROCESSED',
      reason: reason || 'Customer requested refund',
      raw: {
        id: refundId,
        entity: 'refund',
        payment_id: paymentId,
        amount: Math.round(amount * 100),
        status: 'processed',
        created_at: Math.floor(Date.now() / 1000),
      },
    };
  }

  async getPaymentDetails(paymentId) {
    return {
      id: paymentId,
      status: 'captured',
      provider: 'SIMULATED',
      simulated: true,
    };
  }
}

// Auto-register simulated gateway
const simulatedInstance = new SimulatedPaymentGateway();
registerGateway('SIMULATED', simulatedInstance);
