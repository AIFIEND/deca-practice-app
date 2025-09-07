"use client"

import { useState, useEffect, useCallback } from "react"

interface QuestionStore {
  answers: Record<string, string>
  eliminatedOptions: Record<string, string[]>
  flaggedIds: string[]
  attempts: Record<string, number>
}

const STORAGE_KEY = "deca-practice-v1"

const initialState: QuestionStore = {
  answers: {},
  eliminatedOptions: {},
  flaggedIds: [],
  attempts: {},
}

export function useQuestionStore() {
  const [store, setStore] = useState<QuestionStore>(initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setStore(parsed)
      }
    } catch (error) {
      console.error("Failed to load question store:", error)
    }
  }, [])

  // Save to localStorage whenever store changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch (error) {
      console.error("Failed to save question store:", error)
    }
  }, [store])

  const toggleEliminate = useCallback((questionId: string, choiceId: string) => {
    setStore((prev) => {
      const currentEliminated = prev.eliminatedOptions[questionId] || []
      const isEliminated = currentEliminated.includes(choiceId)

      return {
        ...prev,
        eliminatedOptions: {
          ...prev.eliminatedOptions,
          [questionId]: isEliminated
            ? currentEliminated.filter((id) => id !== choiceId)
            : [...currentEliminated, choiceId],
        },
      }
    })
  }, [])

  const toggleFlag = useCallback((questionId: string) => {
    setStore((prev) => ({
      ...prev,
      flaggedIds: prev.flaggedIds.includes(questionId)
        ? prev.flaggedIds.filter((id) => id !== questionId)
        : [...prev.flaggedIds, questionId],
    }))
  }, [])

  const recordAnswer = useCallback((questionId: string, choiceId: string) => {
    setStore((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: choiceId,
      },
      attempts: {
        ...prev.attempts,
        [questionId]: (prev.attempts[questionId] || 0) + 1,
      },
    }))
  }, [])

  const resetAttempt = useCallback(() => {
    setStore(initialState)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear question store:", error)
    }
  }, [])

  return {
    ...store,
    toggleEliminate,
    toggleFlag,
    recordAnswer,
    resetAttempt,
  }
}
