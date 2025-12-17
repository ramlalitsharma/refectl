/**
 * Jitsi Meet - Free Open-Source Video Conferencing
 * Alternative to Daily.co - completely free and self-hostable
 */

export interface JitsiRoom {
  roomName: string;
  roomUrl: string;
  config: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    enableClosePage?: boolean;
    enableNoAudioDetection?: boolean;
    enableNoisyMicDetection?: boolean;
    enableTalkWhileMuted?: boolean;
    enableLipSync?: boolean;
    channelLastN?: number;
    startAudioOnly?: boolean;
    startScreenSharing?: boolean;
    enableEmailInStats?: boolean;
    enableDisplayNameInStats?: boolean;
    enableCallStats?: boolean;
    defaultLanguage?: string;
    disableThirdPartyRequests?: boolean;
    enableLayerSuspension?: boolean;
    p2p?: {
      enabled: boolean;
      stunServers?: Array<{ urls: string }>;
    };
  };
}

/**
 * Generate Jitsi Meet room URL
 * Jitsi Meet is free and can be self-hosted or use their free public instance
 */
export function createJitsiRoom(config: {
  roomName: string;
  domain?: string; // Default: meet.jit.si (free public instance)
  isModerator?: boolean;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
}): JitsiRoom {
  const domain = config.domain || 'meet.jit.si'; // Free public Jitsi instance
  const roomName = config.roomName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Build Jitsi Meet URL with config
  const params = new URLSearchParams();
  if (config.isModerator) params.append('config.startWithAudioMuted', 'false');
  if (config.startWithAudioMuted) params.append('config.startWithAudioMuted', 'true');
  if (config.startWithVideoMuted) params.append('config.startWithVideoMuted', 'true');

  const roomUrl = `https://${domain}/${roomName}${params.toString() ? '?' + params.toString() : ''}`;

  return {
    roomName,
    roomUrl,
    config: {
      startWithAudioMuted: config.startWithAudioMuted || false,
      startWithVideoMuted: config.startWithVideoMuted || false,
      p2p: {
        enabled: true,
        stunServers: [
          { urls: 'stun:stun.l.google.com:19302' }, // Free Google STUN server
        ],
      },
    },
  };
}

/**
 * Get Jitsi Meet embed URL for iframe
 */
export function getJitsiEmbedUrl(roomName: string, domain?: string): string {
  const domainName = domain || 'meet.jit.si';
  return `https://${domainName}/${roomName}`;
}

/**
 * Self-hosted Jitsi setup instructions
 * For production, you can self-host Jitsi Meet on your own server (completely free)
 */
export const JITSI_SELF_HOST_SETUP = {
  docker: 'docker run -d -p 80:80 -p 443:443 -p 4443:4443 -p 10000:10000/udp jitsi/web',
  documentation: 'https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker',
  features: [
    'Free and open-source',
    'No usage limits',
    'Full control over data',
    'Custom branding',
    'Recording support',
    'Breakout rooms',
    'Screen sharing',
    'Chat',
    'Whiteboard (via Jitsi Meet plugins)',
  ],
};


