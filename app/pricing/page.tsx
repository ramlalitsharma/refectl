'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Crown, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastManager';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Direct redirect to our active payment gateway
      window.location.href = '/api/subscriptions/checkout';
    } catch (error) {
      console.error('Checkout redirect failed', error);
      addToast({
        type: 'warning',
        title: 'Error',
        message: 'Could not initiate checkout. Please check your connection.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/dashboard" className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl w-full space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get unlimited access to AI tutoring, advanced analytics, and exclusive badges.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* Free Plan */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Basic</h3>
              <div className="text-4xl font-black mt-2 text-slate-900">$0 <span className="text-lg text-slate-500 font-normal">/ mo</span></div>
              <p className="text-slate-500 mt-2">Perfect for getting started.</p>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                '3 AI Quizzes per day',
                '5 AI Chat messages per day',
                'Basic Leaderboard Access',
                'Standard Analytics'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-600">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full py-6 text-lg rounded-xl" disabled>
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-3xl shadow-2xl text-white border border-indigo-700/50"
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" /> MOST POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400" /> Pro Power
              </h3>
              <div className="text-5xl font-black mt-2 text-white">$9.99 <span className="text-lg text-indigo-200 font-normal">/ mo</span></div>
              <p className="text-indigo-200 mt-2">For serious learners.</p>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited AI Quizzes',
                'Unlimited AI Tutor Chat',
                'Advanced Analytics & Insights',
                'Verified Gold "Pro" Badge',
                'Priority Support'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-indigo-50">
                  <div className="p-1 rounded-full bg-indigo-500/50 text-amber-300">
                    <Zap className="w-3 h-3 fill-amber-300" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-8 text-xl font-bold rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl transition-transform active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Upgrade Now'}
            </Button>
            <p className="text-center text-indigo-300 text-xs mt-4">
              30-day money-back guarantee. Cancel anytime.
            </p>
          </motion.div>

        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-slate-600"><Shield className="w-5 h-5" /> Secure Payment</div>
          <div className="flex items-center gap-2 font-bold text-slate-600"><Star className="w-5 h-5" /> 4.9/5 Rating</div>
        </div>

      </div>
    </div>
  );
}
