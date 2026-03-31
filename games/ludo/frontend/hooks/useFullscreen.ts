import { useCallback, useEffect, useState } from 'react';

export function useFullscreen<T extends HTMLElement>(targetRef: React.RefObject<T>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onChange);
    onChange();
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const canFullscreen = Boolean(document.fullscreenEnabled);

  const toggleFullscreen = useCallback(async () => {
    const el = targetRef.current;
    if (!el || !canFullscreen) return;

    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // If fullscreen is blocked (permissions/unsupported), just keep current UI state.
    }
  }, [canFullscreen, targetRef]);

  return { isFullscreen, canFullscreen, toggleFullscreen };
}

