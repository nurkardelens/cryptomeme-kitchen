import Masonry from 'react-masonry-css'

const BREAKPOINTS = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 3,
  640: 2,
  0: 2,
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function Vault({ memes, onDelete, onDownload, onReEdit }) {
  if (memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <p
          className="font-pixel mb-4"
          style={{ color: '#00ff88', fontSize: '12px', lineHeight: 2 }}
        >
          YOUR VAULT IS EMPTY SER
        </p>
        <p
          className="font-mono"
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}
        >
          Go forge some memes. 🔥
        </p>
        <p
          className="font-mono mt-2"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}
        >
          NFA · DYOR · WAGMI
        </p>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <span
          className="font-mono"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}
        >
          {memes.length} MEME{memes.length !== 1 ? 'S' : ''} IN VAULT
        </span>
        <span
          className="font-pixel"
          style={{ color: '#8b5cf6', fontSize: '8px' }}
        >
          💎 STORED ON-CHAIN*
        </span>
      </div>

      <div className="px-4 md:px-6">
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {memes.map((meme) => (
            <VaultCard
              key={meme.id}
              meme={meme}
              onDelete={onDelete}
              onDownload={onDownload}
              onReEdit={onReEdit}
            />
          ))}
        </Masonry>
      </div>

      <p
        className="text-center font-mono mt-8 px-4"
        style={{ color: 'rgba(255,255,255,0.15)', fontSize: '9px' }}
      >
        *not actually on-chain, stored in localStorage. NFA.
      </p>
    </div>
  )
}

function VaultCard({ meme, onDelete, onDownload, onReEdit }) {
  return (
    <div
      className="rounded-xl overflow-hidden group"
      style={{
        background: '#13131a',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={meme.dataUrl}
          alt={meme.templateName}
          className="w-full block"
          style={{ display: 'block' }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
        >
          <button
            onClick={() => onReEdit(meme)}
            className="px-2.5 py-1.5 rounded-lg font-mono font-bold text-bg text-xs"
            style={{ background: '#00ff88', fontSize: '10px' }}
          >
            ✏️ EDIT
          </button>
          <button
            onClick={() => onDownload(meme)}
            className="px-2.5 py-1.5 rounded-lg font-mono font-bold text-white text-xs"
            style={{ background: '#8b5cf6', fontSize: '10px' }}
          >
            📥 DL
          </button>
          <button
            onClick={() => onDelete(meme.id)}
            className="px-2.5 py-1.5 rounded-lg font-mono font-bold text-white text-xs"
            style={{ background: '#ff3366', fontSize: '10px' }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2">
        <p className="font-code text-white font-bold truncate" style={{ fontSize: '10px' }}>
          {meme.templateName}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }} className="font-mono mt-0.5">
          {formatDate(meme.createdAt)}
        </p>
      </div>
    </div>
  )
}
