'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  correctCount: number;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
}

export function FlashcardStudy({ flashcards: initialFlashcards }: FlashcardStudyProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleQuality = async (quality: number) => {
    if (!currentCard) return;

    try {
      const res = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      });

      if (res.ok) {
        // Move to next card
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // All cards reviewed
          setCurrentIndex(0);
        }
        setIsFlipped(false);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">No flashcards available for review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flashcard Study</h2>
          <p className="text-sm text-slate-600">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <div className="text-sm text-slate-600">
          {currentCard.reviewCount} reviews • {currentCard.correctCount} correct
        </div>
      </div>

      <div className="relative" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full"
        >
          <Card
            className="cursor-pointer min-h-[400px] flex items-center justify-center"
            onClick={() => {
              setIsFlipped(!isFlipped);
              setShowAnswer(true);
            }}
          >
            <CardContent className="p-8 text-center">
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-2xl font-semibold mb-4">Question</div>
                    <div className="text-xl">{currentCard.front}</div>
                    <p className="text-sm text-slate-500 mt-4">Click to flip</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-2xl font-semibold mb-4">Answer</div>
                    <div className="text-xl">{currentCard.back}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {showAnswer && (
        <Card>
          <CardHeader>
            <CardTitle>How well did you know this?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button
                variant="outline"
                onClick={() => handleQuality(0)}
                className="text-red-600 hover:bg-red-50"
              >
                0 - Blackout
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuality(1)}
                className="text-orange-600 hover:bg-orange-50"
              >
                1 - Incorrect
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuality(2)}
                className="text-yellow-600 hover:bg-yellow-50"
              >
                2 - Hard
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuality(3)}
                className="text-blue-600 hover:bg-blue-50"
              >
                3 - Good
              </Button>
              <Button
                variant="inverse"
                onClick={() => handleQuality(4)}
                className="text-emerald-600 hover:bg-emerald-50"
              >
                4 - Easy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

