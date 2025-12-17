'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Plan {
  id?: string;
  name: string;
  tier: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  lemonsqueezyVariantId?: string;
  active: boolean;
  highlight?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SubscriptionPlanManagerProps {
  initialPlans: Plan[];
}

const tierLabels: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export function SubscriptionPlanManager({ initialPlans }: SubscriptionPlanManagerProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [formState, setFormState] = useState({
    name: '',
    tier: 'premium',
    description: '',
    price: 19,
    currency: 'USD',
    interval: 'monthly' as 'monthly' | 'yearly',
    features: 'Personalized course recommendations\nUnlimited quizzes',
    lemonsqueezyVariantId: '',
    highlight: false,
  });
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const orderedPlans = useMemo(() => {
    return plans.slice().sort((a, b) => a.price - b.price);
  }, [plans]);

  const resetForm = () => {
    setFormState({
      name: '',
      tier: 'premium',
      description: '',
      price: 19,
      currency: 'USD',
      interval: 'monthly',
      features: 'Personalized course recommendations\nUnlimited quizzes',
      lemonsqueezyVariantId: '',
      highlight: false,
    });
    setEditingPlan(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formState.name,
        tier: formState.tier,
        description: formState.description,
        price: formState.price,
        currency: formState.currency,
        interval: formState.interval,
        features: formState.features
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        lemonsqueezyVariantId: formState.lemonsqueezyVariantId,
        highlight: formState.highlight,
        active: true,
      };

      if (editingPlan?.id) {
        const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update plan');
        setPlans((prev) => prev.map((plan) => (plan.id === editingPlan.id ? data.plan : plan)));
      } else {
        const res = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create plan');
        setPlans((prev) => [...prev, data.plan]);
      }

      resetForm();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(error);
      alert(msg || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormState({
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features.join('\n'),
      lemonsqueezyVariantId: plan.lemonsqueezyVariantId || '',
      highlight: plan.highlight || false,
    });
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !plan.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update plan');
      setPlans((prev) => prev.map((item) => (item.id === plan.id ? data.plan : item)));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(error);
      alert(msg || 'Unable to toggle plan');
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Archive ${plan.name}? Learners will no longer see it.`)) return;
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to archive plan');
      setPlans((prev) => prev.map((item) => (item.id === plan.id ? data.plan : item)));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(error);
      alert(msg || 'Unable to archive plan');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Active plans</h2>
              <p className="text-sm text-slate-500">Toggle visibility or edit pricing instantly.</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-400">{plans.length} plan(s)</span>
          </div>

          <div className="space-y-4">
            {orderedPlans.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No plans configured yet. Create one using the form on the right.
              </div>
            ) : (
              orderedPlans.map((plan) => (
                <Card key={plan.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                        <Badge variant={plan.active ? 'success' : 'default'}>
                          {plan.active ? 'Active' : 'Archived'}
                        </Badge>
                        {plan.highlight && <Badge variant="info">Featured</Badge>}
                      </div>
                      <div className="text-sm text-slate-500">
                        {tierLabels[plan.tier] || plan.tier} • {plan.currency} {plan.price}/{plan.interval}
                      </div>
                      <ul className="text-sm text-slate-500 list-disc pl-5 space-y-1">
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      {plan.lemonsqueezyVariantId && (
                        <div className="text-xs text-slate-400">Lemon Squeezy Variant: {plan.lemonsqueezyVariantId}</div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="inverse" size="sm" onClick={() => handleEdit(plan)}>
                        Edit Plan
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(plan)}>
                        {plan.active ? 'Pause' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(plan)}>
                        Archive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingPlan ? 'Edit subscription plan' : 'Create new plan'}
            </h2>
            <p className="text-sm text-slate-500">
              Sync these details with your payment provider. Highlight a plan to promote it across marketing pages.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Plan name
                <input
                  required
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Premium"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tier
                <select
                  value={formState.tier}
                  onChange={(e) => setFormState((prev) => ({ ...prev, tier: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Price
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={formState.price}
                  onChange={(e) => setFormState((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Currency
                <input
                  value={formState.currency}
                  onChange={(e) => setFormState((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Billing interval
                <select
                  value={formState.interval}
                  onChange={(e) => setFormState((prev) => ({ ...prev, interval: e.target.value as 'monthly' | 'yearly' }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Lemon Squeezy Variant ID (optional)
                <input
                  value={formState.lemonsqueezyVariantId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, lemonsqueezyVariantId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="variant_..."
                />
              </label>
            </div>

            <label className="space-y-1 text-sm text-slate-600 block">
              Description
              <textarea
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                placeholder="Everything you need to master new skills."
              />
            </label>

            <label className="space-y-1 text-sm text-slate-600 block">
              Feature bullets (one per line)
              <textarea
                value={formState.features}
                onChange={(e) => setFormState((prev) => ({ ...prev, features: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={4}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={formState.highlight}
                onChange={(e) => setFormState((prev) => ({ ...prev, highlight: e.target.checked }))}
              />
              Highlight this plan on marketing pages
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingPlan ? 'Save changes' : 'Create plan'}
              </Button>
              {editingPlan && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
