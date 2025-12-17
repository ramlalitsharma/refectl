'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Question {
    id: string; // or _id
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: { id: string; text: string; correct: boolean }[];
    correctAnswer?: string; // for True/False
    answerExplanation?: string;
    difficulty?: string;
}

interface QuizPlayerProps {
    title: string;
    questions: Question[];
    quizId: string;
}

export function QuizPlayer({ title, questions, quizId }: QuizPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);

    if (!questions || questions.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No questions available in this quiz.</p>
                    <Link href="/quizzes">
                        <Button className="mt-4">Back to Quizzes</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    const handleSelect = (optionId: string) => {
        if (showExplanation) return;
        setSelectedAnswer(optionId);
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        let isCorrect = false;
        if (currentQuestion.type === 'multiple-choice') {
            const option = currentQuestion.options?.find(o => o.id === selectedAnswer);
            isCorrect = option?.correct || false;
        } else if (currentQuestion.type === 'true-false') {
            // Assuming implementation matches string comparison or specific logic
            // For simplicity, let's assume options are provided for T/F too as "True" and "False" with correct flag
            const option = currentQuestion.options?.find(o => o.id === selectedAnswer);
            isCorrect = option?.correct || false;
        }

        if (isCorrect) setScore(score + 1);

        setAnswers([...answers, {
            questionId: currentQuestion.id,
            answer: selectedAnswer,
            correct: isCorrect
        }]);

        setShowExplanation(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setIsFinished(true);
            // Here you could save the score to the DB
        }
    };

    if (isFinished) {
        return (
            <Card className="max-w-2xl mx-auto mt-8">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Quiz Completed! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600 mb-2">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <p className="text-gray-600">
                            You scored {score} out of {questions.length}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                            {questions.map((q, idx) => {
                                const ans = answers.find(a => a.questionId === q.id);
                                return (
                                    <div key={q.id} className="flex items-center justify-between text-sm">
                                        <span className="truncate flex-1 pr-4">{idx + 1}. {q.question}</span>
                                        <Badge variant={ans?.correct ? 'success' : 'destructive'}>
                                            {ans?.correct ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/quizzes">
                            <Button variant="outline">Back to Quizzes</Button>
                        </Link>
                        <Button onClick={() => window.location.reload()}>Retry Quiz</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto mt-8">
            <CardHeader>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h1>
                        <p className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                    <Badge variant="outline">{currentQuestion.difficulty || 'Pre-defined'}</Badge>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <h2 className="text-lg font-medium mb-6 text-slate-800 dark:text-slate-100">{currentQuestion.question}</h2>

                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedAnswer === option.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                  ${showExplanation && option.correct ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                  ${showExplanation && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                  ${showExplanation ? 'pointer-events-none' : ''}
                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                    w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium
                    ${selectedAnswer === option.id ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-400 text-slate-500'}
                  `}>
                                        {option.id}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200">{option.text}</span>
                                    {showExplanation && option.correct && (
                                        <span className="ml-auto text-green-600 text-sm font-medium">Correct Answer</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {showExplanation && currentQuestion.answerExplanation && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        <strong>Explanation:</strong> {currentQuestion.answerExplanation}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                    {!showExplanation ? (
                        <Button onClick={handleSubmit} disabled={!selectedAnswer} size="lg">
                            Submit Answer
                        </Button>
                    ) : (
                        <Button onClick={handleNext} size="lg">
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
