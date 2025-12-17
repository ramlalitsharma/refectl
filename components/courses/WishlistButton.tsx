'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@clerk/nextjs';

interface WishlistButtonProps {
  courseId: string;
  className?: string;
}

export function WishlistButton({ courseId, className }: WishlistButtonProps) {
  const { isSignedIn } = useUser();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/wishlist`);
      if (res.ok) {
        const data = await res.json();
        const wishlist = (data.wishlist || []) as Array<{ _id: string }>;
        const isWishlisted = wishlist.some((c) => String(c._id) === courseId);
        setIsInWishlist(isWishlisted);
      }
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  }, [courseId]);

  useEffect(() => {
    if (isSignedIn && courseId) {
      checkWishlistStatus();
    }
  }, [isSignedIn, courseId, checkWishlistStatus]);

  const handleToggleWishlist = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }

    setIsLoading(true);
    try {
      const action = isInWishlist ? 'remove' : 'add';
      const res = await fetch('/api/courses/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, action }),
      });

      if (res.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={className}
    >
      {isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
    </Button>
  );
}

