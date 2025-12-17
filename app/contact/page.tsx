'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CHANNELS = [
  {
    label: 'Email',
    value: 'support@adaptiq.io',
    hint: 'We reply within 24 hours on business days.',
  },
  {
    label: 'Community Forum',
    value: 'Join the community →',
    href: '/forum',
    hint: 'Crowd-sourced answers from teachers and peers.',
  },
  {
    label: 'Enterprise Inquiries',
    value: 'enterprise@adaptiq.io',
    hint: 'For partnerships, campus programs, and resellers.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in email, subject, and message.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          priority: form.priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setStatus({ type: 'success', message: 'We received your message. Expect a reply shortly!' });
      setForm({ email: '', subject: '', message: '', priority: 'medium' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Unable to send message.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-widest text-teal-600 font-semibold">Need a hand?</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Talk to the AdaptIQ team</h1>
          <p className="text-lg text-slate-600">
            We’re here for students, teachers, and enterprise partners. Reach out for onboarding help, billing
            questions, learning-path guidance, or just to say hello.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/forum" className="inline-flex">
              <Button variant="inverse">Visit community forum</Button>
            </Link>
            <Link href="/live" className="inline-flex">
              <Button variant="ghost" className="text-teal-700 border border-teal-200 bg-white/70">
                Explore live classes
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-xl border border-teal-100">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <p className="text-sm text-slate-500">Our support leads respond personally—no bots, no autoresponders.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@email.com"
                  required
                />
                <Input
                  label="Subject"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Let us know how we can help"
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Tell us more about your request or share links/screenshots."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low — it can wait</option>
                    <option value="medium">Normal — reply soon</option>
                    <option value="high">High — blocking my learners</option>
                  </select>
                </div>
                {status && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {status.message}
                  </div>
                )}
                <Button type="submit" variant="inverse" className="w-full" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {CHANNELS.map((channel) => (
              <Card key={channel.label} className="border border-white/60 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-slate-700">{channel.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {channel.href ? (
                    <Link href={channel.href} className="text-teal-600 font-semibold hover:underline">
                      {channel.value}
                    </Link>
                  ) : (
                    <p className="font-semibold text-slate-900">{channel.value}</p>
                  )}
                  {channel.hint && <p className="text-sm text-slate-500 mt-2">{channel.hint}</p>}
                </CardContent>
              </Card>
            ))}
            <Card className="bg-gradient-to-br from-teal-600 to-emerald-500 text-white">
              <CardContent className="space-y-3">
                <p className="text-sm uppercase tracking-widest text-white/80">Prefer live?</p>
                <h3 className="text-2xl font-semibold">Book a live onboarding call</h3>
                <p className="text-sm text-white/90">
                  Perfect for schools, creators, and teams migrating to AdaptIQ.
                </p>
                <Link href="/live" className="inline-flex">
                  <Button variant="inverse" className="bg-white text-teal-700 hover:bg-white/90">
                    See live calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

