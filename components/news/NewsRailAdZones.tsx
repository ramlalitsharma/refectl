'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Megaphone, ShieldCheck } from 'lucide-react';

type RailSlot = {
  id: string;
  title: string;
  subtitle: string;
  minHeight: number;
};

const SLOTS: RailSlot[] = [
  {
    id: 'rail-premium-01',
    title: 'Premium Placement',
    subtitle: 'High-attention slot for strategic campaigns',
    minHeight: 250,
  },
  {
    id: 'rail-premium-02',
    title: 'Industry Spotlight',
    subtitle: 'B2B visibility for decision-maker audiences',
    minHeight: 320,
  },
];

function useInView<T extends HTMLElement>(rootMargin = '150px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}

function RailSlotCard({ slot }: { slot: RailSlot }) {
  const { ref, inView } = useInView<HTMLDivElement>('200px');
  const placeholderStyle = useMemo(() => ({ minHeight: `${slot.minHeight}px` }), [slot.minHeight]);

  return (
    <div ref={ref} className="news-rail-ad-slot" style={placeholderStyle} data-slot-id={slot.id}>
      <div className="news-rail-ad-badge">Sponsored</div>
      {!inView ? (
        <div className="news-rail-ad-skeleton" />
      ) : (
        <div className="news-rail-ad-content">
          <div className="news-rail-ad-head">
            <Megaphone size={14} />
            <span>{slot.title}</span>
          </div>
          <p>{slot.subtitle}</p>
          <div className="news-rail-ad-proof">
            <ShieldCheck size={12} />
            Brand-safe editorial environment
          </div>
          <Link href="/contact?topic=advertising" className="news-rail-ad-cta">
            Advertise Here
          </Link>
        </div>
      )}
    </div>
  );
}

export function NewsRailAdZones() {
  return (
    <section className="news-rail-ad-stack" aria-label="Sponsored placements">
      {SLOTS.map((slot) => (
        <RailSlotCard key={slot.id} slot={slot} />
      ))}
    </section>
  );
}

