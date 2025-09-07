"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { questions } from "@/lib/questions"
import { Flag, Home, RotateCcw, CheckCircle, XCircle } from "lucide-react"

export default function ResultsPage() {
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([])
  const [showFlagged, setShowFlagged] = useState(false)

  useEffect(() => {
    // Load results from localStorage
    const savedAnswers = localStorage.getItem("userAnswers")
    const savedFlagged = localStorage.getItem("flaggedQuestions")

    if (savedAnswers) {
      setUserAnswers(JSON.parse(savedAnswers))
    }

    if (savedFlagged) {
      setFlaggedQuestions(JSON.parse(savedFlagged))
    }
  }, [])

  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length

  const score = userAnswers.length > 0 ? Math.round((correctAnswers / userAnswers.length) * 100) : 0

  const handleRestartQuiz = () => {
    // Clear saved data
    localStorage.removeItem("userAnswers")
    localStorage.removeItem("flaggedQuestions")
    localStorage.removeItem("eliminatedOptions")
  }

  const filteredQuestions = showFlagged ? questions.filter((_, index) => flaggedQuestions.includes(index)) : questions

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-48 h-48 relative flex items-center justify-center rounded-full border-8 border-primary/20">
                <div className="text-4xl font-bold">{score}%</div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <div className="text-xl font-bold">{correctAnswers}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                  <XCircle className="h-8 w-8 text-red-500 mb-2" />
                  <div className="text-xl font-bold">{userAnswers.length - correctAnswers}</div>
                  <div className="text-sm text-gray-500">Incorrect</div>
                </div>
              </div>

              {flaggedQuestions.length > 0 && (
                <div className="w-full">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setShowFlagged(!showFlagged)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {showFlagged ? "Show All Questions" : `Review ${flaggedQuestions.length} Flagged Questions`}
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/practice" className="w-full sm:w-auto">
                  <Button onClick={handleRestartQuiz} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Practice Again
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{showFlagged ? "Flagged Questions" : "All Questions"}</h2>

          {filteredQuestions.map((question, index) => {
            const questionIndex = showFlagged ? flaggedQuestions[index] : index

            const userAnswer = userAnswers[questionIndex]
            const isCorrect = userAnswer === question.correctAnswer

            return (
              <Card key={questionIndex} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                    {isCorrect ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span>Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500">
                        <XCircle className="h-5 w-5 mr-1" />
                        <span>Incorrect</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{question.stem}</p>

                  <div className="space-y-2">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 border rounded-lg ${
                          key === question.correctAnswer
                            ? "bg-green-50 border-green-500 dark:bg-green-900/20"
                            : userAnswer === key
                              ? "bg-red-50 border-red-500 dark:bg-red-900/20"
                              : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{key}.</span>
                          <span>{value}</span>
                          {key === question.correctAnswer && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold">Explanation:</p>
                    <p>{question.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
