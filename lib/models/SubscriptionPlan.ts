export type BillingInterval = 'monthly' | 'yearly';
export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  _id?: any;
  name: string;
  tier: SubscriptionTier;
  description?: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  lemonsqueezyVariantId?: string;
  active: boolean;
  highlight?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function serializePlan(plan: SubscriptionPlan & { _id?: any }) {
  return {
    id: plan._id ? String(plan._id) : undefined,
    name: plan.name,
    tier: plan.tier,
    description: plan.description || '',
    price: plan.price,
    currency: plan.currency,
    interval: plan.interval,
    features: plan.features || [],
    lemonsqueezyVariantId: plan.lemonsqueezyVariantId || '',
    active: plan.active,
    highlight: plan.highlight || false,
    createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt,
    updatedAt: plan.updatedAt instanceof Date ? plan.updatedAt.toISOString() : plan.updatedAt,
  };
}
