import { useState, useCallback } from 'react'

export function useHistory(initialState) {
  const [history, setHistory] = useState([initialState])
  const [index, setIndex] = useState(0)

  const current = history[index]

  const push = useCallback((newState) => {
    setHistory((prev) => {
      const next = prev.slice(0, index + 1)
      return [...next, newState]
    })
    setIndex((prev) => prev + 1)
  }, [index])

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(history.length - 1, prev + 1))
  }, [history.length])

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  return { current, push, undo, redo, canUndo, canRedo }
}
