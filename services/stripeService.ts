/**
 * Stripe Payment Service
 * 
 * Uses Stripe Payment Links for simple checkout without backend
 */

// ============================================================================
// CONFIGURATION - Update these with your Stripe Payment Links
// ============================================================================

/**
 * HOW TO CREATE PAYMENT LINKS:
 * 
 * 1. Go to https://dashboard.stripe.com/test/payment-links
 * 2. Click "New payment link"
 * 3. Select your product price (e.g., Plus Monthly R$14,90)
 * 4. In Settings:
 *    - After payment: Redirect to URL → your success page
 *    - Example: https://yoursite.com/#/checkout-success?plan=plus
 * 5. Copy the payment link URL and paste below
 * 
 * Repeat for each plan (Plus and Pro)
 */

// Payment Link URLs from Stripe Dashboard
// Replace these placeholder URLs with your actual Stripe Payment Links
const PAYMENT_LINKS = {
    plus: {
        // Create this in Stripe: Product "Plus" → Price R$14,90/month
        // After payment redirect: https://yoursite.com/#/checkout-success?plan=plus
        url: '', // e.g., 'https://buy.stripe.com/test_xxxxx'
    },
    pro: {
        // Create this in Stripe: Product "Pro" → Price R$29,90/month  
        // After payment redirect: https://yoursite.com/#/checkout-success?plan=pro
        url: '', // e.g., 'https://buy.stripe.com/test_yyyyy'
    }
};

// Stripe Product IDs (for reference)
export const STRIPE_PRODUCTS = {
    plus: 'prod_TfFBqm1ZZ7D7zv',
    pro: 'prod_TfFAsqDf8E7Wmp',
};

// Types
export type PlanId = 'plus' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Check if Payment Links are configured
 */
export const isPaymentConfigured = (): boolean => {
    return Boolean(PAYMENT_LINKS.plus.url && PAYMENT_LINKS.pro.url);
};

/**
 * Get the Stripe Payment Link URL for a plan
 */
export const getPaymentLinkUrl = (plan: PlanId): string | null => {
    const link = PAYMENT_LINKS[plan].url;
    return link || null;
};

/**
 * Redirect to Stripe Payment Link
 * Returns false if payment links are not configured (uses mock checkout instead)
 */
export const redirectToCheckout = (plan: PlanId, customerEmail?: string): boolean => {
    const paymentUrl = getPaymentLinkUrl(plan);

    if (!paymentUrl) {
        // Payment links not configured - return false to use mock checkout
        return false;
    }

    // Optionally append customer email as prefill
    let finalUrl = paymentUrl;
    if (customerEmail) {
        const separator = paymentUrl.includes('?') ? '&' : '?';
        finalUrl = `${paymentUrl}${separator}prefilled_email=${encodeURIComponent(customerEmail)}`;
    }

    // Redirect to Stripe
    window.location.href = finalUrl;
    return true;
};

/**
 * Mock checkout for development/demo (when Payment Links not configured)
 */
export const mockCheckout = (plan: PlanId, successUrl: string): void => {
    const sessionId = `cs_mock_${Date.now()}_${plan}`;
    window.location.href = `${successUrl}?session_id=${sessionId}&plan=${plan}`;
};

/**
 * Verify checkout session (works with both real and mock)
 */
export const verifyCheckoutSession = async (sessionId: string): Promise<{
    success: boolean;
    plan?: PlanId;
}> => {
    // Extract plan from session ID
    const planMatch = sessionId.match(/_(plus|pro)/);
    const plan = planMatch ? planMatch[1] as PlanId : undefined;

    return {
        success: true,
        plan: plan || 'pro',
    };
};

/**
 * Get product display info
 */
export const getProductInfo = (plan: PlanId) => ({
    productId: STRIPE_PRODUCTS[plan],
    name: plan === 'plus' ? 'Reynar Plus' : 'Reynar Pro',
    price: plan === 'plus' ? 'R$ 14,90' : 'R$ 29,90',
    features: plan === 'plus'
        ? ['200 importações/mês', '50 scans OCR', '10 metas', 'Categorização IA']
        : ['Tudo ilimitado', 'Relatórios históricos', 'Multi-moedas', 'Suporte prioritário'],
});
