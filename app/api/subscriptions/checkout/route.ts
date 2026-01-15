import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Universal Subscription Checkout Gateway
 * This endpoint initiates a Clerk-authenticated checkout session.
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
        }

        const user = await currentUser();

        /**
         * CLERK BILLING INTEGRATION
         * Clerk Billing (via Stripe) handles the global payment flow.
         * We redirect to a hosted checkout session or the billing portal.
         * 
         * NOTE: To activate, ensure "Billing" is enabled in your Clerk Dashboard
         * and a Stripe account is connected.
         */

        // For now, we redirect to a Clerk Billing-ready URL or the User Profile
        // where they can manage their billing/subscription.
        // In a full production setup with Clerk Billing SDK, we would call:
        // const session = await clerkClient.billing.createCheckoutSession({ ... });

        // Fallback: Redirect to the user profile's billing section
        // Most users can upgrade directly within the Clerk <UserProfile /> component
        // but providing a direct link to the checkout is better for conversion.

        // Since we don't have the explicit checkout URL yet, we'll use a placeholder
        // that the USER can swap with their Stripe/Clerk checkout link.
        const checkoutUrl = process.env.CLERK_BILLING_CHECKOUT_URL || 'https://dashboard.clerk.com';

        const url = new URL(checkoutUrl);
        if (user?.primaryEmailAddress?.emailAddress) {
            url.searchParams.set('prefilled_email', user.primaryEmailAddress.emailAddress);
        }
        url.searchParams.set('client_reference_id', userId);

        return NextResponse.redirect(url);
    } catch (error: any) {
        console.error('Subscription checkout error:', error);
        return NextResponse.json(
            { error: 'Checkout failed', message: error.message },
            { status: 500 }
        );
    }
}
