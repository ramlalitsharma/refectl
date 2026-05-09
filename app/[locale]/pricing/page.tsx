'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coffee, Flame, Heart, Copy, Check, Bitcoin, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastManager';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

export default function SupportPage() {
  const { addToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [showWallets, setShowWallets] = useState(false);

  const copyToClipboard = (text: string, currency: string) => {
    navigator.clipboard.writeText(text);
    setCopied(currency);
    addToast({
      type: 'success',
      title: 'Address Copied',
      message: `${currency} address copied to clipboard.`,
    });
    setTimeout(() => setCopied(null), 3000);
  };

  const cryptoWallets = [
    {
      name: 'Bitcoin (BTC)',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Placeholder
      icon: <Bitcoin className="w-5 h-5" />,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    {
      name: 'Ethereum (ETH)',
      address: '', // Placeholder
      icon: <Wallet className="w-5 h-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      name: 'Solana (SOL)',
      address: '', // Placeholder
      icon: <Flame className="w-5 h-5" />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-orange-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <Link href="/dashboard" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-medium transition-colors z-10">
        <ArrowLeft className="w-5 h-5" /> Back to Hub
      </Link>

      <div className="max-w-2xl w-full z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl mb-4 backdrop-blur-md">
            <Coffee className="w-12 h-12 text-orange-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Fuel the Forge
          </h1>
          <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
            We operate independently to bring you the best tools and knowledge. If you love what we build, toss a coin to your developers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

          {!showWallets ? (
            <div className="text-center space-y-8 relative z-10">
              <div className="flex justify-center mb-6">
                <Heart className="w-16 h-16 text-rose-500 fill-rose-500/20 animate-pulse" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-white">Keep Us Running</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                No monthly subscriptions. No paywalls. Just open infrastructure funded entirely by the community. Give what feels right.
              </p>

              <Button
                onClick={() => setShowWallets(true)}
                className="w-full md:w-auto px-10 py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xl font-bold tracking-wide shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-1"
              >
                Support with Crypto <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Select Network</h3>
                <button
                  onClick={() => setShowWallets(false)}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                {cryptoWallets.map((wallet) => (
                  <div
                    key={wallet.name}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${wallet.border} ${wallet.bg} backdrop-blur-sm transition-all hover:bg-white/10 group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${wallet.color}`}>
                        {wallet.icon}
                      </div>
                      <div>
                        <div className="text-white font-bold">{wallet.name}</div>
                        <div className="text-slate-400 text-sm font-mono truncate w-32 md:w-64">
                          {wallet.address}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(wallet.address, wallet.name)}
                      className={`p-3 rounded-xl transition-all ${copied === wallet.name
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                        }`}
                    >
                      {copied === wallet.name ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-center text-slate-500 text-sm mt-8">
                Thank you for your support. Transfers are processed securely via the blockchain.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
