'use client';

import { useRouter } from 'next/navigation';
import { LiveClassroom } from './LiveClassroom';

interface LiveClassroomWrapperProps {
  roomUrl: string;
  roomName: string;
  isInstructor?: boolean;
  provider?: 'jitsi' | 'daily';
}

export function LiveClassroomWrapper({
  roomUrl,
  roomName,
  isInstructor,
  provider,
}: LiveClassroomWrapperProps) {
  const router = useRouter();

  const handleLeave = () => {
    router.push('/dashboard');
  };

  return (
    <LiveClassroom
      roomUrl={roomUrl}
      roomName={roomName}
      isInstructor={isInstructor}
      provider={provider}
      onLeave={handleLeave}
    />
  );
}

