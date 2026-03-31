import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type FullscreenToggleProps = {
  isFullscreen: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function FullscreenToggle({ isFullscreen, onToggle, disabled }: FullscreenToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      disabled={disabled}
      className="h-11 w-11 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen focus'}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </Button>
  );
}

