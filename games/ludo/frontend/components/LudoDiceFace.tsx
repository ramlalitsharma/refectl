'use client';

import React, { useEffect, useState } from 'react';

export function LudoDiceFace({
  value,
  rolling = false,
  className = '',
  pipColor = '#111318',
  glowColor = 'rgba(17,19,24,0.12)',
}: {
  value: number | null;
  rolling?: boolean;
  className?: string;
  pipColor?: string;
  glowColor?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState<number>(1);

  useEffect(() => {
    if (!rolling) {
      return;
    }

    let frame = value ?? 1;

    const interval = window.setInterval(() => {
      frame = (frame % 6) + 1;
      setAnimatedValue(frame);
    }, 90);

    return () => window.clearInterval(interval);
  }, [rolling, value]);

  const displayValue = rolling ? animatedValue : value;

  const pipMap = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  } as const;

  const positions = [
    'left-[14%] top-[14%]',
    'left-1/2 top-[14%] -translate-x-1/2',
    'right-[14%] top-[14%]',
    'left-[14%] top-1/2 -translate-y-1/2',
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'right-[14%] top-1/2 -translate-y-1/2',
    'left-[14%] bottom-[14%]',
    'left-1/2 bottom-[14%] -translate-x-1/2',
    'right-[14%] bottom-[14%]',
  ] as const;

  return (
    <div
      className={`relative h-16 w-16 rounded-[1.2rem] border-[3px] border-[#f8fbff] bg-[linear-gradient(180deg,#ffffff,#f1f5fb_68%,#e4ebf5)] shadow-[inset_0_4px_0_rgba(255,255,255,0.98),inset_0_-4px_10px_rgba(184,196,214,0.42),0_10px_0_rgba(126,140,166,0.42),0_16px_30px_-18px_rgba(0,0,0,0.62)] ${rolling ? 'animate-[spin_0.35s_linear_infinite]' : ''} ${className}`}
      style={{ boxShadow: `inset 0 4px 0 rgba(255,255,255,0.98), inset 0 -4px 10px rgba(184,196,214,0.42), 0 0 0 1px rgba(255,255,255,0.34), 0 0 24px ${glowColor}, 0 10px 0 rgba(126,140,166,0.42), 0 16px 30px -18px rgba(0,0,0,0.62)` }}
    >
      <span className="pointer-events-none absolute inset-[7%] rounded-[0.95rem] border border-[#d9e1ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,253,255,0.82)_35%,rgba(237,243,250,0.96))]" />
      {(displayValue ? pipMap[displayValue as keyof typeof pipMap] : []).map((index) => (
        <span
          key={index}
          className={`absolute rounded-full shadow-[0_1px_0_rgba(255,255,255,0.18)] ${rolling ? 'animate-pulse' : ''} ${positions[index]}`}
          style={{
            width: '18%',
            height: '18%',
            backgroundColor: pipColor,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.18), 0 1px 0 rgba(255,255,255,0.18), 0 2px 4px ${glowColor}`,
          }}
        />
      ))}
    </div>
  );
}

