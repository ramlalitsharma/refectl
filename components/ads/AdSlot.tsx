'use client';

interface AdSlotProps {
  slotId: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'banner';
  enabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * Deprecated: manual slot rendering disabled.
 * Project uses AdSense Auto Ads globally via AdSenseScript.
 */
export function AdSlot({ slotId, className = '', format = 'auto', enabled, style }: AdSlotProps) {
  void slotId;
  void className;
  void format;
  void enabled;
  void style;
  return null;
}


