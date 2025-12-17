'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastManager';

export function usePolling(intervalMs: number = 30000) {
    const { addToast } = useToast();
    const lastCheckRef = useRef<number>(Date.now());

    useEffect(() => {
        const poll = async () => {
            // Only poll if tab is visible
            if (document.hidden) return;

            try {
                const since = lastCheckRef.current;
                const res = await fetch(`/api/notifications/poll?since=${since}`);
                if (!res.ok) return;

                const data = await res.json();

                if (data.success && data.hasUpdates) {
                    // Update timestamp
                    lastCheckRef.current = data.timestamp;

                    // Handle Notifications
                    if (data.data.notifications && data.data.notifications.length > 0) {
                        data.data.notifications.forEach((notif: any) => {
                            addToast({
                                type: notif.type === 'achievement_unlocked' ? 'achievement' : 'info',
                                title: notif.title,
                                message: notif.message,
                            });
                        });
                    }

                    // Handle Stats (Silent update or subtle toast?)
                    // For now, we rely on SWR or context re-fetch elsewhere for UI updates,
                    // but we could trigger a global revalidate here if we used SWRConfig.
                }
            } catch (error) {
                console.error('Polling tick failed', error);
            }
        };

        const timer = setInterval(poll, intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs, addToast]);
}
