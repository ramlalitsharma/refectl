'use client';

import { usePolling } from '@/hooks/use-polling';

export function PollingWrapper() {
    // This component purely activates the hook
    // We do this to ensure it runs inside the ToastProvider context
    usePolling(30000); // Poll every 30s
    return null;
}
