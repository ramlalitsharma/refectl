'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface CheckoutPageProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  currency: string;
}

export function CheckoutPage({ courseId, courseSlug, courseTitle, amount, currency }: CheckoutPageProps) {
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState(amount);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setError(null);

    try {
      const res = await fetch(`/api/payments/coupons?code=${couponCode.toUpperCase()}`);
      const data = await res.json();

      if (res.ok && data.coupons && data.coupons.length > 0) {
        const coupon = data.coupons[0];
        let newAmount = amount;

        if (coupon.discountType === 'percentage') {
          newAmount = amount * (1 - coupon.discountValue / 100);
          if (coupon.maxDiscount) {
            newAmount = Math.max(newAmount, amount - coupon.maxDiscount);
          }
        } else {
          newAmount = Math.max(0, amount - coupon.discountValue);
        }

        setFinalAmount(newAmount);
        setDiscount(amount - newAmount);
      } else {
        setError('Invalid coupon code');
      }
    } catch (err: any) {
      setError('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/clerk/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseSlug,
          amount: finalAmount,
          currency,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Redirect to course after successful payment and enrollment
      if (data.enrolled) {
        router.push(`/courses/${courseSlug}?enrolled=true&payment=success`);
      } else {
        router.push(`/courses/${courseSlug}?payment=success`);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="text-slate-600 mt-2">Complete your enrollment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">{courseTitle}</h3>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Course Price</span>
              <span className="font-medium">
                {currency === 'USD' ? '$' : currency} {amount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1"
            />
            <Button variant="outline" onClick={handleApplyCoupon} disabled={applyingCoupon}>
              {applyingCoupon ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          {discount > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Discount Applied</span>
                <span className="font-semibold text-green-700">
                  -{currency === 'USD' ? '$' : currency} {discount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">
                {currency === 'USD' ? '$' : currency} {amount.toFixed(2)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount</span>
                <span>-{currency === 'USD' ? '$' : currency} {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-teal-600">
                {currency === 'USD' ? '$' : currency} {finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="inverse"
            size="lg"
            className="w-full"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing Payment...' : `Pay ${currency === 'USD' ? '$' : ''}${finalAmount.toFixed(2)}`}
          </Button>
          {error && (
            <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

