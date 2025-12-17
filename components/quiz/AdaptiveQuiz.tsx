'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: string;
}

interface AdaptiveQuizProps {
  topic: string;
  initialDifficulty?: 'easy' | 'medium' | 'hard';
}

export function AdaptiveQuiz({ topic, initialDifficulty = 'medium' }: AdaptiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [performance, setPerformance] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [selectedContext, setSelectedContext] = useState<{ subjectName?: string; levelName?: string; chapterName?: string; chapterId?: string } | null>(null);

  useEffect(() => {
    // Load selection from localStorage if present
    try {
      const raw = localStorage.getItem('adaptiq-subject-selection');
      if (raw) {
        const sel = JSON.parse(raw);
        setSelectedContext({ subjectName: sel.subjectName, levelName: sel.levelName, chapterName: sel.chapterName, chapterId: sel.chapterId });
        // Map level to difficulty
        if (sel.levelName === 'Basic') setDifficulty('easy');
        if (sel.levelName === 'Intermediate') setDifficulty('medium');
        if (sel.levelName === 'Advanced') setDifficulty('hard');
      }
    } catch {}
    generateNextQuestion();

    const handler = () => {
      // Reload selection and start new question set
      try {
        const raw = localStorage.getItem('adaptiq-subject-selection');
        if (raw) {
          const sel = JSON.parse(raw);
          setSelectedContext({ subjectName: sel.subjectName, levelName: sel.levelName, chapterName: sel.chapterName, chapterId: sel.chapterId });
          if (sel.levelName === 'Basic') setDifficulty('easy');
          if (sel.levelName === 'Intermediate') setDifficulty('medium');
          if (sel.levelName === 'Advanced') setDifficulty('hard');
        }
      } catch {}
      setScore(0);
      setQuestionNumber(1);
      setPerformance({ correct: 0, incorrect: 0 });
      setSelectedAnswer('');
      setShowExplanation(false);
      generateNextQuestion();
    };
    window.addEventListener('adaptiq-selection-updated', handler as any);
    return () => window.removeEventListener('adaptiq-selection-updated', handler as any);
  }, [topic]);

  const generateNextQuestion = async () => {
    setIsLoading(true);
    setShowExplanation(false);
    setSelectedAnswer('');

    try {
      const effectiveTopic = selectedContext?.subjectName || topic;
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: effectiveTopic,
          difficulty,
          previousPerformance: {
            correctAnswers: performance.correct,
            incorrectAnswers: performance.incorrect,
            weakTopics: [],
          },
          context: selectedContext || undefined,
        }),
      });

      if (!response.ok) {
        // Read response body as text first (can only be read once)
        let errorPayload: any = { status: response.status };
        try {
          const text = await response.text();
          // Try to parse as JSON, otherwise use as plain text
          try {
            const json = JSON.parse(text);
            errorPayload = { ...errorPayload, ...json };
          } catch {
            errorPayload = { 
              ...errorPayload,
              error: 'Request failed', 
              message: text || `HTTP ${response.status}: ${response.statusText || 'Unknown error'}` 
            };
          }
        } catch {
          // If we can't read the body at all, use status info
          errorPayload = { 
            ...errorPayload,
            error: 'Request failed', 
            message: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}` 
          };
        }
        console.error('API Error:', errorPayload);
        if (response.status === 401) {
          throw new Error('Unauthorized. Please sign in to generate questions.');
        }
        const errorMessage = errorPayload.error || errorPayload.message || `Failed to generate question (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      const question: Question = await response.json();
      setCurrentQuestion(question);
      setDifficulty(question.difficulty as 'easy' | 'medium' | 'hard');
    } catch (error: any) {
      console.error('Error generating question:', error);
      const errorMessage = error.message || 'Failed to generate question. Please check your OpenAI API key and try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setPerformance({ ...performance, correct: performance.correct + 1 });
    } else {
      setPerformance({ ...performance, incorrect: performance.incorrect + 1 });
    }

    setShowExplanation(true);
  };

  const handleNext = () => {
    setQuestionNumber(questionNumber + 1);
    generateNextQuestion();
  };

  const handleFinish = async () => {
    // Save progress
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: `adaptive-${(selectedContext?.subjectName || topic)}`,
          subject: selectedContext?.subjectName || topic,
          level: selectedContext?.levelName,
          chapterId: selectedContext?.chapterId,
          chapterName: selectedContext?.chapterName,
          score: (score / questionNumber) * 100,
          answers: [],
          knowledgeGapsIdentified: [],
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }

    // Redirect to results or dashboard
    window.location.href = '/dashboard';
  };

  if (isLoading && !currentQuestion) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Generating adaptive question...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const totalQuestions = 10; // You can make this dynamic
  const progress = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <div id="adaptive-quiz">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Question {questionNumber} of {totalQuestions}</CardTitle>
          <div className="text-sm text-gray-600 flex items-center gap-3">
            {selectedContext && (
              <span className="hidden md:inline text-gray-500">
                {selectedContext.subjectName}{selectedContext.levelName ? ` · ${selectedContext.levelName}` : ''}{selectedContext.chapterName ? ` · ${selectedContext.chapterName}` : ''}
              </span>
            )}
            <span className="font-semibold">Score: {score}/{questionNumber - 1}</span>
            <Badge variant={difficulty === 'hard' ? 'error' : difficulty === 'medium' ? 'warning' : 'success'} size="sm">
              {difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progress} showLabel={false} color="blue" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
            {currentQuestion.question}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all bg-white text-gray-900 disabled:opacity-100 disabled:text-gray-900 ${
                  selectedAnswer === option
                    ? showExplanation
                      ? option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : showExplanation && option === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {showExplanation && currentQuestion.explanation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
            <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!showExplanation ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="flex-1 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:text-white disabled:opacity-100"
            >
              Submit Answer
            </Button>
          ) : (
            <>
              <Button
                onClick={handleNext}
                variant="default"
                className="flex-1"
              >
                Next Question
              </Button>
              {questionNumber >= 1 && (
                <Button
                  onClick={handleFinish}
                  variant="outline"
                >
                  Finish Quiz
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
