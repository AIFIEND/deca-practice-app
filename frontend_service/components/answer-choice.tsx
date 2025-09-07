"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnswerChoiceProps {
  text: string
  isEliminated: boolean
  isAnswered: boolean
  isCorrect?: boolean
  explanation?: string
  onSelect: () => void
  onToggleEliminate: () => void
}

export function AnswerChoice({
  text,
  isEliminated,
  isAnswered,
  isCorrect,
  explanation,
  onSelect,
  onToggleEliminate,
}: AnswerChoiceProps) {
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAnswered) {
      onToggleEliminate()
    }
  }

  const handleClick = () => {
    if (!isAnswered) {
      onSelect()
    }
  }

  const showFeedback = isAnswered && isCorrect !== undefined && explanation

  return (
    <div className="space-y-2">
      <Card
        className={cn(
          "p-4 transition-all",
          !isAnswered &&
            !isEliminated &&
            "cursor-pointer hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring",
          isEliminated && "opacity-50",
          isAnswered && isCorrect === false && "opacity-50 pointer-events-none",
          isAnswered && isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-900/20",
        )}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        role="button"
        tabIndex={isAnswered ? -1 : 0}
        aria-label={`Answer choice: ${text}${isEliminated ? " (eliminated)" : ""}${isAnswered ? (isCorrect ? " (correct)" : " (incorrect)") : ""}`}
        onKeyDown={(e) => {
          if (!isAnswered && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span className={cn("flex-1", isEliminated && "line-through")}>{text}</span>
          <div className="flex items-center gap-2">
            {!isAnswered && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleEliminate()
                }}
                aria-label={isEliminated ? "Restore choice" : "Eliminate choice"}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isAnswered && isCorrect === true && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isAnswered && isCorrect === false && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
      </Card>

      {showFeedback && (
        <Alert
          className={cn(
            "ml-4",
            isCorrect
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-red-500 bg-red-50 dark:bg-red-900/20",
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className={cn("font-semibold text-sm mb-1", isCorrect ? "text-green-700" : "text-red-700")}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </div>
              <AlertDescription className="text-sm">{explanation}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  )
}
