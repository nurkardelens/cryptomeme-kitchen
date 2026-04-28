import { useState, useRef, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import TextOverlay from './TextOverlay'
import FilterControls, { defaultFilters, filtersToCSS } from './FilterControls'
import { useHistory } from '../hooks/useHistory'

const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', '"Press Start 2P"', 'Bangers', 'Oswald']
const FONT_LABELS = ['Impact', 'Arial Black', 'Comic Sans', 'Press Start 2P', 'Bangers', 'Oswald']

let nextId = 1

const initialEditorState = {
  textBoxes: [],
}

export default function MemeEditor({ template, onClose, onSave }) {
  const { current, push, undo, redo, canUndo, canRedo } = useHistory(initialEditorState)
  const [selectedId, setSelectedId] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [imgError, setImgError] = useState(false)
  const [activePanel, setActivePanel] = useState('text') // 'text' | 'filters'
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef(null)

  const textBoxes = current.textBoxes
  const selectedBox = textBoxes.find((b) => b.id === selectedId)

  const addText = useCallback(() => {
    const newBox = {
      id: String(nextId++),
      text: 'EDIT ME',
      x: 40,
      y: 40,
      width: 240,
      height: 70,
      fontFamily: 'Impact',
      fontSize: 42,
      color: '#ffffff',
      bold: false,
      italic: false,
      align: 'center',
      opacity: 100,
      strokeEnabled: true,
      strokeColor: '#000000',
      strokeWidth: 2,
    }
    push({ ...current, textBoxes: [...textBoxes, newBox] })
    setSelectedId(newBox.id)
  }, [current, textBoxes, push])

  const updateBox = useCallback((id, updates) => {
    push({
      ...current,
      textBoxes: textBoxes.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })
  }, [current, textBoxes, push])

  const moveBox = useCallback((id, pos) => {
    // Direct mutation for smooth dragging (not pushed to history)
    const boxes = textBoxes.map((b) => (b.id === id ? { ...b, x: pos.x, y: pos.y } : b))
    push({ ...current, textBoxes: boxes })
  }, [current, textBoxes, push])

  const resizeBox = useCallback((id, size) => {
    const boxes = textBoxes.map((b) => (b.id === id ? { ...b, ...size } : b))
    push({ ...current, textBoxes: boxes })
  }, [current, textBoxes, push])

  const deleteBox = useCallback((id) => {
    push({ ...current, textBoxes: textBoxes.filter((b) => b.id !== id) })
    setSelectedId(null)
  }, [current, textBoxes, push])

  const deleteSelected = useCallback(() => {
    if (selectedId) deleteBox(selectedId)
  }, [selectedId, deleteBox])

  const renderToCanvas = useCallback(async () => {
    if (!canvasRef.current) return null
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      })
      return canvas
    } catch {
      return null
    }
  }, [])

  const handleDownload = useCallback(async () => {
    setSaving(true)
    const canvas = await renderToCanvas()
    if (canvas) {
      const link = document.createElement('a')
      link.download = `meme-${template.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    setSaving(false)
  }, [renderToCanvas, template.id])

  const handleCopy = useCallback(async () => {
    setSaving(true)
    const canvas = await renderToCanvas()
    if (canvas) {
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
        } catch {
          // clipboard write failed — silently ignore
        }
      })
    }
    setSaving(false)
  }, [renderToCanvas])

  const handleSaveVault = useCallback(async () => {
    setSaving(true)
    const canvas = await renderToCanvas()
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      onSave({
        id: Date.now(),
        templateId: template.id,
        templateName: template.name,
        dataUrl,
        createdAt: new Date().toISOString(),
      })
    }
    setSaving(false)
    onClose()
  }, [renderToCanvas, onSave, template, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          deleteSelected()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, undo, redo, selectedId, deleteSelected])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(5,5,10,0.97)', backdropFilter: 'blur(8px)' }}
      onClick={() => setSelectedId(null)}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="font-mono text-sm px-3 py-1.5 rounded-lg transition-colors hover:text-white"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '11px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            ✕ CLOSE
          </button>
          <span
            className="font-pixel text-white hidden sm:block"
            style={{ fontSize: '10px' }}
          >
            {template.name}
          </span>
        </div>

        {/* Undo/Redo + Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all disabled:opacity-30"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            ↩ UNDO
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all disabled:opacity-30"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            ↪ REDO
          </button>
          {selectedId && (
            <button
              onClick={deleteSelected}
              className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
              style={{
                background: 'rgba(255,51,102,0.15)',
                color: '#ff3366',
                fontSize: '11px',
                border: '1px solid rgba(255,51,102,0.3)',
              }}
            >
              🗑 DELETE
            </button>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg font-mono font-bold text-bg transition-all disabled:opacity-50 hidden sm:block"
            style={{
              background: '#00ff88',
              fontSize: '10px',
              boxShadow: '0 0 12px rgba(0,255,136,0.4)',
            }}
          >
            {saving ? '...' : '📥 DOWNLOAD'}
          </button>
          <button
            onClick={handleCopy}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg font-mono font-bold text-white transition-all disabled:opacity-50 hidden md:block"
            style={{
              background: '#8b5cf6',
              fontSize: '10px',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}
          >
            {saving ? '...' : '📋 COPY'}
          </button>
          <button
            onClick={handleSaveVault}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg font-mono font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              fontSize: '10px',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}
          >
            {saving ? '...' : '🔒 SAVE'}
          </button>
        </div>
      </div>

      {/* Main area: canvas + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div
          className="flex-1 flex items-center justify-center overflow-auto p-4 md:p-8"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="editor-open relative"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <div
              ref={canvasRef}
              className="editor-canvas-wrapper relative overflow-hidden rounded-xl"
              style={{
                display: 'inline-block',
                boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                maxWidth: 'min(600px, calc(100vw - 2rem))',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background image or placeholder */}
              {!imgError ? (
                <img
                  src={template.image}
                  alt={template.name}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    filter: filtersToCSS(filters),
                  }}
                  onError={() => setImgError(true)}
                  draggable={false}
                />
              ) : (
                <div
                  style={{
                    width: 560,
                    height: Math.round(560 * template.aspectRatio),
                    maxWidth: 'calc(100vw - 2rem)',
                    background: `linear-gradient(135deg, ${template.gradientFrom}, ${template.gradientTo})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: filtersToCSS(filters),
                  }}
                >
                  <div
                    className="font-pixel text-center px-4"
                    style={{
                      color: template.accentColor,
                      fontSize: 'clamp(8px, 2vw, 14px)',
                      textShadow: `0 0 20px ${template.accentColor}`,
                    }}
                  >
                    {template.name}
                  </div>
                </div>
              )}

              {/* Text overlays */}
              {textBoxes.map((box) => (
                <TextOverlay
                  key={box.id}
                  box={box}
                  isSelected={selectedId === box.id}
                  onSelect={setSelectedId}
                  onMove={moveBox}
                  onResize={resizeBox}
                  onDelete={deleteBox}
                />
              ))}
            </div>

            {/* Add text hint */}
            {textBoxes.length === 0 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', whiteSpace: 'nowrap' }}
              >
                ↑ Click &ldquo;ADD TEXT&rdquo; to start memeing
              </div>
            )}
          </div>
        </div>

        {/* Sidebar controls */}
        <div
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel tabs */}
          <div
            className="flex shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {['text', 'filters'].map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className="flex-1 py-3 font-mono uppercase font-semibold transition-colors"
                style={{
                  fontSize: '10px',
                  color: activePanel === panel ? '#00ff88' : 'rgba(255,255,255,0.4)',
                  borderBottom: activePanel === panel ? '2px solid #00ff88' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                {panel === 'text' ? '✏️ TEXT' : '🎨 FILTERS'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'text' ? (
              <TextPanel
                selectedBox={selectedBox}
                onUpdate={updateBox}
                onAdd={addText}
              />
            ) : (
              <FilterControls filters={filters} onChange={setFilters} />
            )}
          </div>

          {/* Mobile export buttons */}
          <div
            className="sm:hidden flex gap-2 p-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={handleDownload}
              disabled={saving}
              className="flex-1 py-2 rounded-lg font-mono font-bold text-bg text-xs"
              style={{ background: '#00ff88', fontSize: '10px' }}
            >
              📥 DL
            </button>
            <button
              onClick={handleSaveVault}
              disabled={saving}
              className="flex-1 py-2 rounded-lg font-mono font-bold text-white text-xs"
              style={{ background: '#8b5cf6', fontSize: '10px' }}
            >
              🔒 SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TextPanel({ selectedBox, onUpdate, onAdd }) {
  if (!selectedBox) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={onAdd}
          className="w-full py-3 rounded-xl font-mono font-bold text-bg transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            fontSize: '12px',
            boxShadow: '0 0 20px rgba(0,255,136,0.4)',
          }}
        >
          ADD TEXT +
        </button>
        <div
          className="text-center font-mono py-6"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}
        >
          Select a text box to edit its style
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onAdd}
        className="w-full py-2.5 rounded-xl font-mono font-bold text-bg transition-all active:scale-95 mb-1"
        style={{
          background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
          fontSize: '11px',
          boxShadow: '0 0 16px rgba(0,255,136,0.3)',
        }}
      >
        ADD TEXT +
      </button>

      {/* Text content */}
      <div>
        <label className="block font-mono uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
          TEXT CONTENT
        </label>
        <textarea
          value={selectedBox.text}
          onChange={(e) => onUpdate(selectedBox.id, { text: e.target.value })}
          rows={3}
          className="w-full rounded-lg px-3 py-2 font-mono text-white resize-none focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            color: '#fff',
          }}
        />
      </div>

      {/* Font family */}
      <div>
        <label className="block font-mono uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
          FONT
        </label>
        <select
          value={selectedBox.fontFamily}
          onChange={(e) => onUpdate(selectedBox.id, { fontFamily: e.target.value })}
          className="w-full rounded-lg px-3 py-2 font-mono focus:outline-none"
          style={{
            background: '#1a1a26',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '11px',
          }}
        >
          {['Impact', 'Arial Black', 'Comic Sans MS', '"Press Start 2P"', 'Bangers', 'Oswald'].map((f, i) => (
            <option key={f} value={f}>
              {['Impact', 'Arial Black', 'Comic Sans', 'Press Start 2P', 'Bangers', 'Oswald'][i]}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="font-mono uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
            SIZE
          </label>
          <span className="font-mono" style={{ color: '#00ff88', fontSize: '9px' }}>
            {selectedBox.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min={12}
          max={120}
          value={selectedBox.fontSize}
          onChange={(e) => onUpdate(selectedBox.id, { fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Color + Stroke row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block font-mono uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
            COLOR
          </label>
          <input
            type="color"
            value={selectedBox.color}
            onChange={(e) => onUpdate(selectedBox.id, { color: e.target.value })}
            className="w-full h-9 rounded-lg cursor-pointer border-0"
            style={{ background: 'none', padding: 0 }}
          />
        </div>
        <div className="flex-1">
          <label className="block font-mono uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
            OUTLINE
          </label>
          <div className="flex items-center gap-2 h-9">
            <input
              type="checkbox"
              checked={selectedBox.strokeEnabled}
              onChange={(e) => onUpdate(selectedBox.id, { strokeEnabled: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-neon-green"
            />
            {selectedBox.strokeEnabled && (
              <input
                type="color"
                value={selectedBox.strokeColor || '#000000'}
                onChange={(e) => onUpdate(selectedBox.id, { strokeColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                style={{ padding: 0 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Stroke width */}
      {selectedBox.strokeEnabled && (
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="font-mono uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
              OUTLINE WIDTH
            </label>
            <span className="font-mono" style={{ color: '#00ff88', fontSize: '9px' }}>
              {selectedBox.strokeWidth || 2}px
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={selectedBox.strokeWidth || 2}
            onChange={(e) => onUpdate(selectedBox.id, { strokeWidth: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      {/* Style toggles */}
      <div className="flex gap-2">
        {[
          { key: 'bold', label: 'B', style: { fontWeight: 'bold' } },
          { key: 'italic', label: 'I', style: { fontStyle: 'italic' } },
        ].map(({ key, label, style }) => (
          <button
            key={key}
            onClick={() => onUpdate(selectedBox.id, { [key]: !selectedBox[key] })}
            className="flex-1 py-1.5 rounded-lg font-mono font-bold transition-all"
            style={{
              ...style,
              background: selectedBox[key] ? '#00ff88' : 'rgba(255,255,255,0.06)',
              color: selectedBox[key] ? '#0a0a0f' : 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Text align */}
      <div className="flex gap-2">
        {['left', 'center', 'right'].map((align) => (
          <button
            key={align}
            onClick={() => onUpdate(selectedBox.id, { align })}
            className="flex-1 py-1.5 rounded-lg font-mono transition-all"
            style={{
              background: selectedBox.align === align ? '#00ff88' : 'rgba(255,255,255,0.06)',
              color: selectedBox.align === align ? '#0a0a0f' : 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {align === 'left' ? '⬅' : align === 'center' ? '⬛' : '➡'}
          </button>
        ))}
      </div>

      {/* Opacity */}
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="font-mono uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
            OPACITY
          </label>
          <span className="font-mono" style={{ color: '#00ff88', fontSize: '9px' }}>
            {selectedBox.opacity ?? 100}%
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={selectedBox.opacity ?? 100}
          onChange={(e) => onUpdate(selectedBox.id, { opacity: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  )
}
