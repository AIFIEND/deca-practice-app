"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlagButtonProps {
  isFlagged: boolean
  onToggle: () => void
}

export function FlagButton({ isFlagged, onToggle }: FlagButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isFlagged ? "default" : "outline"}
            size="sm"
            onClick={onToggle}
            aria-label={isFlagged ? "Remove flag" : "Flag for review"}
            aria-pressed={isFlagged}
            role="button"
          >
            <Bookmark className={cn("h-4 w-4", isFlagged && "fill-current")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Flag for review</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
