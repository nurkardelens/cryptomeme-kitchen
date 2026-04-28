import { useCallback, useRef } from 'react'

export function useDraggable(onMove) {
  const dragState = useRef(null)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget.closest('[data-text-id]')
    if (!el) return
    dragState.current = {
      id: el.dataset.textId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: parseFloat(el.style.left) || 0,
      startTop: parseFloat(el.style.top) || 0,
    }

    const onMouseMove = (e) => {
      if (!dragState.current) return
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      onMove(dragState.current.id, {
        x: dragState.current.startLeft + dx,
        y: dragState.current.startTop + dy,
      })
    }

    const onMouseUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [onMove])

  const onTouchStart = useCallback((e) => {
    e.stopPropagation()
    const touch = e.touches[0]
    const el = e.currentTarget.closest('[data-text-id]')
    if (!el) return
    dragState.current = {
      id: el.dataset.textId,
      startX: touch.clientX,
      startY: touch.clientY,
      startLeft: parseFloat(el.style.left) || 0,
      startTop: parseFloat(el.style.top) || 0,
    }

    const onTouchMove = (e) => {
      if (!dragState.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const dx = touch.clientX - dragState.current.startX
      const dy = touch.clientY - dragState.current.startY
      onMove(dragState.current.id, {
        x: dragState.current.startLeft + dx,
        y: dragState.current.startTop + dy,
      })
    }

    const onTouchEnd = () => {
      dragState.current = null
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
  }, [onMove])

  return { onMouseDown, onTouchStart }
}
