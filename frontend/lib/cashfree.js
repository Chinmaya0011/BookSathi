import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstance = null;
let currentMode = null;

/**
 * Initialize Cashfree JS SDK
 * @param {'sandbox' | 'production'} [mode]
 */
export async function getCashfree(mode) {
  const targetMode =
    mode ||
    process.env.NEXT_PUBLIC_CASHFREE_MODE?.toLowerCase() ||
    'sandbox';

  if (!cashfreeInstance || currentMode !== targetMode) {
    currentMode = targetMode;
    try {
      cashfreeInstance = await load({ mode: targetMode });
    } catch (err) {
      console.warn('Could not load Cashfree SDK:', err.message);
      return null;
    }
  }

  return cashfreeInstance;
}

/**
 * Launch Cashfree Checkout
 *
 * @param {Object} options
 * @param {string} options.paymentSessionId - Cashfree Payment Session ID from backend
 * @param {'_modal' | '_self'} [options.redirectTarget='_modal'] - Modal or redirect
 * @param {'sandbox' | 'production'} [options.mode]
 * @returns {Promise<{ error?: any, redirect?: boolean, isSimulated?: boolean }>}
 */
export async function launchCashfreeCheckout({
  paymentSessionId,
  redirectTarget = '_modal',
  mode,
}) {
  if (!paymentSessionId) {
    throw new Error('Payment Session ID is required to launch Cashfree Checkout');
  }

  // If demo or mock session, let caller know it is a simulated environment
  if (paymentSessionId.startsWith('session_mock_') || paymentSessionId.startsWith('session_demo_')) {
    return { isSimulated: true };
  }

  const cashfree = await getCashfree(mode);
  if (!cashfree) {
    return { isSimulated: true, sdkUnavailable: true };
  }

  const checkoutOptions = {
    paymentSessionId,
    redirectTarget,
  };

  return cashfree.checkout(checkoutOptions);
}
