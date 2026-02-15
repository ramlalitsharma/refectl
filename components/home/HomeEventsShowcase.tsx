'use client';

import { useEffect, useState } from 'react';
import { EventShowcase, EventItem } from '@/components/news/EventShowcase';

export function HomeEventsShowcase() {
  const [items, setItems] = useState<EventItem[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/public/events?surface=home&limit=4', { cache: 'no-store' });
        const data = await res.json();
        if (!active) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!active) return;
        setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <EventShowcase items={items} compact />
    </section>
  );
}

