"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="sticky top-0 z-50 bg-background border-b p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" aria-live="polite">
            {current}/{total} answered
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
        <Progress
          value={percentage}
          className="h-2"
          aria-label={`Progress: ${current} of ${total} questions answered`}
        />
      </div>
    </div>
  )
}
