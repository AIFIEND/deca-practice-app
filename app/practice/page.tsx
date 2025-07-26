'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Question } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Flag, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PracticePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<{ [key: number]: string[] }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions?${searchParams.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast.error("Could not load questions for the quiz.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [searchParams]);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = currentQuestion && selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer;

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    if (showFeedback) return;

    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    const correct = questions.find(q => q.id === questionId)?.correctAnswer === answerId;

    toast(correct ? 'Correct!' : 'Incorrect.', {
      description: correct ? 'Great job!' : 'Keep trying!',
      duration: 2000,
    });
    setShowFeedback(true);
  };

  const handleEliminateOption = (questionId: number, optionId: string) => {
    setEliminatedOptions(prev => ({ ...prev, [questionId]: [...(prev[questionId] || []), optionId] }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleShowScore();
    }
  };

  const handleShowScore = async () => {
    const correctCount = questions.reduce((acc, q) => (selectedAnswers[q.id] === q.correctAnswer ? acc + 1 : acc), 0);
    const finalScore = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    setScore(finalScore);
    setShowScore(true);

    const categories = searchParams.get('categories');
    const difficulties = searchParams.get('difficulties');
    let testName = "Practice Quiz";
    if (categories) {
      testName = `${categories.replace(/,/g, ', ')} Quiz`;
    } else if (difficulties) {
      testName = `${difficulties.replace(/,/g, ', ')} Difficulty Quiz`;
    }

    // Check if the user is logged in and has a token
    if (!session?.user?.backendToken) {
      toast.error("You must be logged in to save your score.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use the token from the session for authentication
          'Authorization': `Bearer ${session.user.backendToken}`,
        },
        body: JSON.stringify({
          score: Math.round(finalScore),
          totalQuestions: questions.length,
          testName: testName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save score on the server.');
      }

      toast.success("Quiz score saved successfully!");
    } catch (error) {
      console.error("Failed to save quiz score:", error);
      toast.error("Could not save your score.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading Questions...</div>;
  }

  if (!isLoading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert>
          <AlertTitle>No Questions Found</AlertTitle>
          <AlertDescription>
            No questions match the selected filters. Please go back and try different selections.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-10">
        <Card>
          <CardHeader><CardTitle>Quiz Complete!</CardTitle><CardDescription>Here's how you did:</CardDescription></CardHeader>
          <CardContent>
            <Alert variant="default" className="text-center">
              <AlertTitle className="text-2xl mb-2">Final Score</AlertTitle>
              <AlertDescription className="text-4xl font-bold">{score?.toFixed(0) ?? 0}%</AlertDescription>
            </Alert>
            <Button onClick={() => (window.location.href = '/start-quiz')} className="w-full mt-6">Take Another Quiz</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => handleFlagQuestion(currentQuestion.id)}>
              <Flag className={flaggedQuestions.includes(currentQuestion.id) ? 'text-blue-500 fill-current' : ''} />
            </Button>
          </div>
          <CardDescription className="pt-4 text-base">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <div key={option.id} className="flex items-center gap-2">
                <Button
                  variant={selectedAnswers[currentQuestion.id] === option.id ? 'default' : 'outline'}
                  className={`w-full justify-start h-auto text-wrap text-left ${(eliminatedOptions[currentQuestion.id] || []).includes(option.id) ? 'line-through text-muted-foreground' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                  disabled={(eliminatedOptions[currentQuestion.id] || []).includes(option.id) || showFeedback}
                >
                  <span className="font-bold mr-2">{option.id}.</span> {option.text}
                </Button>
                {!showFeedback && (
                  <Button variant="ghost" size="icon" onClick={() => handleEliminateOption(currentQuestion.id, option.id)} aria-label={`Eliminate option ${option.id}`}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {showFeedback && (
            <Alert variant={isCorrect ? 'default' : 'destructive'} className="mt-6">
              <AlertTitle>{isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
              <AlertDescription>{currentQuestion.explanation}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            {showFeedback && (
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Show Score' : 'Next Question'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}