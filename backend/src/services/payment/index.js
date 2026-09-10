import './simulatedGateway.js';
import './razorpayGateway.js';
import './stripeGateway.js';

export { getPaymentGateway, registerGateway, BasePaymentGateway } from './gatewayAdapter.js';
