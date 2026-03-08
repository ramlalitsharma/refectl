'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PREMIUM_TOOLS = [
  {
    id: 'ai-analyzer',
    name: 'Neural Insight Analyzer',
    icon: '🧠',
    category: 'AI Analytics',
    price: 49.99,
    description: 'Deep-dive AI analysis tool for learning patterns and knowledge gap prediction.',
    features: ['Learning Analytics', 'Knowledge Gap Detection', 'Personalized Insights']
  },
  {
    id: 'proctor-shield',
    name: 'Proctor Shield v2',
    icon: '🛡️',
    category: 'Enterprise Security',
    price: 129.00,
    description: 'Enterprise-grade proctoring module with biometric verification capabilities.',
    features: ['Biometric Verification', 'Tamper Detection', 'Session Recording']
  }
];

export default function PremiumToolsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">💎 Premium Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock advanced features to supercharge your learning and teaching experience
          </p>
        </div>

        {/* Premium Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {PREMIUM_TOOLS.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-elite-bg">
                <div className="p-8">
                  <div className="text-5xl mb-4">{tool.icon}</div>
                  <h3 className="text-2xl font-black mb-2">{tool.name}</h3>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">
                    {tool.category}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{tool.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {tool.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <span className="text-purple-600">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-purple-200 dark:border-purple-800">
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                      ${tool.price}
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Get Now →
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Back to Shop */}
        <div className="text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              ← Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
