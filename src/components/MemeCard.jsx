import { useState } from 'react'

const BADGE_COLORS = {
  BASED: { bg: '#00ff88', text: '#0a0a0f' },
  NGMI: { bg: '#ff3366', text: '#fff' },
  WAGMI: { bg: '#8b5cf6', text: '#fff' },
  IYKYK: { bg: '#ffd700', text: '#0a0a0f' },
}

function formatFires(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function PlaceholderCard({ template }) {
  const shapes = Array.from({ length: 6 }, (_, i) => i)
  return (
    <div
      className="relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${template.gradientFrom}, ${template.gradientTo})`,
        minHeight: '120px',
        paddingTop: `${template.aspectRatio * 100}%`,
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        {/* Geometric decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {shapes.map((i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: `${30 + i * 15}%`,
                height: `${30 + i * 15}%`,
                borderColor: template.accentColor,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>

        {/* Diagonal lines pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${template.accentColor} 0px, ${template.accentColor} 1px, transparent 1px, transparent 10px)`,
          }}
        />

        {/* Meme name centered */}
        <div className="relative z-10 text-center px-2">
          <p
            className="font-pixel leading-relaxed"
            style={{
              color: template.accentColor,
              fontSize: 'clamp(6px, 2.5vw, 10px)',
              textShadow: `0 0 10px ${template.accentColor}`,
              wordBreak: 'break-word',
            }}
          >
            {template.name}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MemeCard({ template, onEdit, onSave }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const showPlaceholder = imgError || !imgLoaded
  const badgeStyle = template.badge ? BADGE_COLORS[template.badge] : null

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group fade-in-up"
      style={{
        background: '#13131a',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hovered
          ? `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${template.accentColor}40, 0 0 20px ${template.accentColor}20`
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative overflow-hidden">
        {/* Always render placeholder — hide when image loads */}
        <div
          style={{
            display: imgLoaded && !imgError ? 'none' : 'block',
          }}
        >
          <PlaceholderCard template={template} />
        </div>

        {/* Actual image */}
        <img
          src={template.image}
          alt={template.name}
          className="w-full block"
          style={{
            display: imgLoaded && !imgError ? 'block' : 'none',
            objectFit: 'cover',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true)
            setImgLoaded(false)
          }}
        />

        {/* Fire counter badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            fontSize: '10px',
            color: '#ff6600',
          }}
        >
          🔥 {formatFires(template.fires)}
        </div>

        {/* Badge (BASED / NGMI etc) */}
        {badgeStyle && (
          <div
            className="absolute top-2 left-2 rounded px-1.5 py-0.5 font-pixel"
            style={{
              background: badgeStyle.bg,
              color: badgeStyle.text,
              fontSize: '7px',
              letterSpacing: '0.5px',
            }}
          >
            {template.badge}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200"
          style={{
            background: 'rgba(0,0,0,0.7)',
            opacity: hovered ? 1 : 0,
            backdropFilter: 'blur(2px)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(template) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono font-bold text-bg transition-all duration-150 active:scale-95"
            style={{
              background: '#00ff88',
              fontSize: '11px',
              boxShadow: '0 0 16px rgba(0,255,136,0.5)',
            }}
          >
            ✏️ EDIT
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(template) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono font-bold text-white transition-all duration-150 active:scale-95"
            style={{
              background: '#8b5cf6',
              fontSize: '11px',
              boxShadow: '0 0 16px rgba(139,92,246,0.5)',
            }}
          >
            🔥 SAVE
          </button>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3">
        <p
          className="font-code text-white font-bold mb-2 truncate"
          style={{ fontSize: '11px' }}
        >
          {template.name}
        </p>
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded font-mono uppercase"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
