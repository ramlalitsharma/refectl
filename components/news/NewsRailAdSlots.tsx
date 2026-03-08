'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Sparkles } from 'lucide-react';

type SlotConfig = {
  id: string;
  title: string;
  label: string;
  minHeight: number;
};

const SLOT_CONFIGS: SlotConfig[] = [
  { id: 'premium-native-1', title: 'Premium Placement', label: 'Sponsored', minHeight: 220 },
  { id: 'premium-native-2', title: 'Partner Insight', label: 'Partner', minHeight: 160 },
];

export function NewsRailAdSlots() {
  const [visibleSlots, setVisibleSlots] = useState<Record<string, boolean>>({});
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSlots((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            const slotId = target.dataset.slotId;
            if (slotId && entry.isIntersecting) {
              next[slotId] = true;
            }
          }
          return next;
        });
      },
      { rootMargin: '240px 0px', threshold: 0.01 }
    );

    for (const cfg of SLOT_CONFIGS) {
      const el = slotRefs.current[cfg.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="news-rail-module news-rail-ads" aria-label="Sponsored placements">
      <h4 className="news-rail-module-title">
        <Megaphone size={14} />
        Premium Placements
      </h4>

      <div className="news-rail-ad-stack">
        {SLOT_CONFIGS.map((slot) => {
          const isVisible = Boolean(visibleSlots[slot.id]);
          return (
            <div
              key={slot.id}
              ref={(el) => {
                slotRefs.current[slot.id] = el;
              }}
              data-slot-id={slot.id}
              className="news-rail-ad-slot"
              style={{ minHeight: `${slot.minHeight}px` }}
            >
              <div className="news-rail-ad-badge">{slot.label}</div>
              {isVisible ? (
                <div className="news-rail-ad-content">
                  <p className="news-rail-ad-title">{slot.title}</p>
                  <p className="news-rail-ad-copy">Contextual campaign surface with UX-safe rendering and stable layout bounds.</p>
                  <Link href="/news/subscribe" className="news-rail-ad-cta">
                    Explore Offer
                  </Link>
                </div>
              ) : (
                <div className="news-rail-ad-placeholder" aria-hidden="true">
                  <Sparkles size={14} />
                  <span>Loading slot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
