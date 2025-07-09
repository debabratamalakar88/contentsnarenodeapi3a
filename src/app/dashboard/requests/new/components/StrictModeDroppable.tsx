
"use client"

import { useEffect, useState } from "react"
import { Droppable, type DroppableProps } from "react-beautiful-dnd"

// This is a workaround for the react-beautiful-dnd library not being compatible with React 18 Strict Mode.
// See: https://github.com/atlassian/react-beautiful-dnd/issues/2396
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))

    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])

  if (!enabled) {
    return null
  }

  return <Droppable {...props}>{children}</Droppable>
}
