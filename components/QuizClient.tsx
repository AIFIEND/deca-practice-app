"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";

export interface Question {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

interface QuizClientProps {
  /** Passed from start‑quiz or resume page */
  attemptId: number;
  questions: Question[];
  /** In resume, this is the saved answers JSON; in start it can be {} */
  initialAnswers: { [key: number]: string };
}

export default function QuizClient({
  attemptId,
  questions,
  initialAnswers,
}: QuizClientProps) {
  const { data: session } = useSession();

  // 1) Compute where to start (first unanswered)
  const answered = Object.keys(initialAnswers).map((k) => parseInt(k, 10));
  const firstUnanswered = questions.findIndex((q) => !answered.includes(q.id));
  const [currentIndex, setCurrentIndex] = useState(
    firstUnanswered >= 0 ? firstUnanswered : 0
  );

  // 2) Full UI state
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({ ...initialAnswers });
  const [eliminated, setEliminated] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [flagged, setFlagged] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean>(
    Boolean(initialAnswers[questions[currentIndex]?.id])
  );
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState<number>(0);

  // whenever we move questions, recompute feedback visibility
  useEffect(() => {
    const qid = questions[currentIndex]?.id;
    setShowFeedback(selectedAnswers[qid] !== undefined);
  }, [currentIndex, selectedAnswers, questions]);

  const current = questions[currentIndex];
  const hasAnswered = selectedAnswers[current.id] !== undefined;
  const isCorrect =
    hasAnswered && selectedAnswers[current.id] === current.correctAnswer;

  // 3) Handle a user selecting an answer
 const handleAnswer = async (opt: string) => {
  console.log("handleAnswer called:", { attemptId, questionId: current.id, answer: opt });
    // 3a) update local state
    setSelectedAnswers((p) => ({ ...p, [current.id]: opt }));
    setShowFeedback(true);

    // 3b) persist the answer
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.backendToken}`,
        },
        body: JSON.stringify({
          attemptId,
          questionId: current.id,
          answer: opt,
        }),
      });
    } catch {
      toast.error("Failed to save answer");
    }
  };

  // 4) Move to next question or finish
  const handleNext = () => setCurrentIndex((i) => i + 1);

  const handleSubmit = async () => {
    // compute final score
    const correctCount = questions.reduce(
      (acc, q) => (selectedAnswers[q.id] === q.correctAnswer ? acc + 1 : acc),
      0
    );
    const final = Math.round((correctCount / questions.length) * 100);
    setScore(final);
    setShowScore(true);

    // persist final score
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.backendToken}`,
        },
        body: JSON.stringify({ attemptId, score: final }),
      });
    } catch {
      toast.error("Failed to submit quiz");
    }
  };

  // 5) Render
  if (showScore) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
            <CardDescription>Here’s how you did:</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="text-center">
              <AlertTitle className="text-2xl mb-2">Final Score</AlertTitle>
              <AlertDescription className="text-4xl font-bold">
                {score}%
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = "/start-quiz")}
              className="w-full mt-6"
            >
              Take Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-10 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {currentIndex + 1} of {questions.length}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setFlagged((f) =>
                  f.includes(current.id)
                    ? f.filter((x) => x !== current.id)
                    : [...f, current.id]
                )
              }
            >
              <Flag
                className={flagged.includes(current.id) ? "text-blue-500" : ""}
              />
            </Button>
          </div>
          <CardDescription className="pt-4 text-base">
            {current.question}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Button
                  variant={
                    selectedAnswers[current.id] === opt.id
                      ? "default"
                      : "outline"
                  }
                  className={`w-full justify-start h-auto text-left ${
                    (eliminated[current.id] || []).includes(opt.id)
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={hasAnswered}
                >
                  <span className="font-bold mr-2">{opt.id}.</span>
                  {opt.text}
                </Button>
                {!hasAnswered && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setEliminated((e) => ({
                        ...e,
                        [current.id]: [...(e[current.id] || []), opt.id],
                      }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {showFeedback && (
            <Alert
              variant={isCorrect ? "default" : "destructive"}
              className="mt-6"
            >
              <AlertTitle>
                {isCorrect ? "Correct!" : "Incorrect"}
              </AlertTitle>
              <AlertDescription>{current.explanation}</AlertDescription>
            </Alert>
          )}

          {showFeedback && (
            <div className="mt-6">
              {currentIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>Next Question</Button>
              ) : (
                <Button onClick={handleSubmit}>Show Score</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
