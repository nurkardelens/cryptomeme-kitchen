import { useRef, useCallback, useState } from 'react'

export default function TextOverlay({ box, isSelected, onSelect, onMove, onResize, onDelete }) {
  const elRef = useRef(null)
  const dragRef = useRef(null)
  const resizeRef = useRef(null)

  const handleDragStart = useCallback((e) => {
    if (e.target.dataset.resizeHandle) return
    e.stopPropagation()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragRef.current = { startX: clientX, startY: clientY, startLeft: box.x, startTop: box.y }

    const move = (e) => {
      if (!dragRef.current) return
      if (e.cancelable) e.preventDefault()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      onMove(box.id, {
        x: dragRef.current.startLeft + cx - dragRef.current.startX,
        y: dragRef.current.startTop + cy - dragRef.current.startY,
      })
    }
    const up = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
  }, [box, onMove])

  const handleResizeStart = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startW: box.width || 200,
      startH: box.height || 60,
    }

    const move = (e) => {
      if (!resizeRef.current) return
      if (e.cancelable) e.preventDefault()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      onResize(box.id, {
        width: Math.max(80, resizeRef.current.startW + cx - resizeRef.current.startX),
        height: Math.max(40, resizeRef.current.startH + cy - resizeRef.current.startY),
      })
    }
    const up = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
  }, [box, onResize])

  const strokeStyle = box.strokeEnabled
    ? `-${box.strokeWidth || 2}px -${box.strokeWidth || 2}px 0 ${box.strokeColor || '#000'}, ${box.strokeWidth || 2}px -${box.strokeWidth || 2}px 0 ${box.strokeColor || '#000'}, -${box.strokeWidth || 2}px ${box.strokeWidth || 2}px 0 ${box.strokeColor || '#000'}, ${box.strokeWidth || 2}px ${box.strokeWidth || 2}px 0 ${box.strokeColor || '#000'}`
    : 'none'

  return (
    <div
      ref={elRef}
      data-text-id={box.id}
      className={`text-overlay-box ${isSelected ? 'selected' : ''}`}
      style={{
        left: box.x,
        top: box.y,
        width: box.width || 200,
        minHeight: box.height || 60,
        cursor: 'move',
        padding: '4px',
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(box.id) }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div
        style={{
          fontFamily: box.fontFamily || 'Impact',
          fontSize: `${box.fontSize || 32}px`,
          color: box.color || '#ffffff',
          fontWeight: box.bold ? 'bold' : 'normal',
          fontStyle: box.italic ? 'italic' : 'normal',
          textAlign: box.align || 'center',
          opacity: (box.opacity ?? 100) / 100,
          textShadow: strokeStyle,
          lineHeight: 1.2,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {box.text || 'EDIT ME'}
      </div>

      {isSelected && (
        <>
          {/* Delete button */}
          <button
            className="absolute flex items-center justify-center rounded-full text-white font-bold transition-colors hover:bg-red-600"
            style={{
              top: -12,
              right: -12,
              width: 24,
              height: 24,
              background: '#ff3366',
              fontSize: '12px',
              zIndex: 10,
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(box.id) }}
          >
            ×
          </button>

          {/* Resize handle */}
          <div
            data-resize-handle="true"
            className="absolute cursor-se-resize"
            style={{
              bottom: -6,
              right: -6,
              width: 16,
              height: 16,
              background: '#00ff88',
              borderRadius: '2px',
              zIndex: 10,
              pointerEvents: 'all',
            }}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />
        </>
      )}
    </div>
  )
}
