export default function Navbar({ activeTab, onTabChange, savedCount }) {
  return (
    <nav
      className="sticky top-0 z-40 glass border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="font-pixel text-neon-green animate-pulse-glow hidden sm:block"
            style={{ fontSize: '11px', letterSpacing: '1px' }}
          >
            MEME FORGE
          </span>
          <span
            className="font-pixel text-neon-green animate-pulse-glow sm:hidden"
            style={{ fontSize: '9px' }}
          >
            MEME FORGE
          </span>
          <span className="text-lg animate-float">🔥</span>
        </div>

        {/* Tab Pills */}
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => onTabChange('templates')}
            className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold transition-all duration-200 uppercase tracking-wider ${
              activeTab === 'templates'
                ? 'bg-neon-green text-bg'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ fontSize: '10px' }}
          >
            TEMPLATES
          </button>
          <button
            onClick={() => onTabChange('vault')}
            className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold transition-all duration-200 uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-electric-purple text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ fontSize: '10px' }}
          >
            MY VAULT 🔒
            {savedCount > 0 && (
              <span
                className="text-xs rounded-full px-1.5 py-0.5 leading-none font-bold"
                style={{
                  background: activeTab === 'vault' ? 'rgba(0,0,0,0.3)' : '#8b5cf6',
                  color: '#fff',
                  fontSize: '9px',
                }}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right side badge */}
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs hidden md:block"
            style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}
          >
            ⛽ Gas: 0.00 MEME
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-pixel"
            style={{
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.2)',
              color: '#00ff88',
              fontSize: '8px',
            }}
          >
            gm
          </div>
        </div>
      </div>
    </nav>
  )
}
