import { useState, useCallback } from 'react'
import Ticker from './components/Ticker'
import Navbar from './components/Navbar'
import MemeGrid from './components/MemeGrid'
import MemeEditor from './components/MemeEditor'
import Vault from './components/Vault'
import { memeTemplates } from './data/memeTemplates'

const VAULT_KEY = 'memeforge_vault_v1'

function loadVault() {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]')
  } catch {
    return []
  }
}

function saveVault(items) {
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(items))
  } catch {
    // localStorage full — silently fail
  }
}

// Matrix rain particles (CSS-only visual flair)
function MatrixParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i / 20) * 100}%`,
    delay: `${(i * 0.3) % 6}s`,
    duration: `${4 + (i % 4)}s`,
    height: `${20 + (i % 40)}px`,
    color: i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#8b5cf6' : '#ff3366',
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            height: p.height,
            background: `linear-gradient(transparent, ${p.color})`,
            width: '1px',
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('templates')
  const [editorTemplate, setEditorTemplate] = useState(null)
  const [vaultMemes, setVaultMemes] = useState(loadVault)
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2500)
  }, [])

  const handleEdit = useCallback((template) => {
    setEditorTemplate(template)
  }, [])

  const handleQuickSave = useCallback((template) => {
    // Save a plain version (no edits) to vault
    const placeholder = {
      id: Date.now(),
      templateId: template.id,
      templateName: template.name,
      dataUrl: null, // no rendered canvas for quick save
      placeholderColor: template.gradientFrom,
      accentColor: template.accentColor,
      isPlaceholder: true,
      createdAt: new Date().toISOString(),
    }
    const updated = [placeholder, ...vaultMemes]
    setVaultMemes(updated)
    saveVault(updated)
    showNotification('🔒 SAVED TO VAULT')
  }, [vaultMemes, showNotification])

  const handleSaveToVault = useCallback((meme) => {
    const updated = [meme, ...vaultMemes]
    setVaultMemes(updated)
    saveVault(updated)
    showNotification('🔒 SAVED TO VAULT · LFG')
  }, [vaultMemes, showNotification])

  const handleDeleteVault = useCallback((id) => {
    const updated = vaultMemes.filter((m) => m.id !== id)
    setVaultMemes(updated)
    saveVault(updated)
  }, [vaultMemes])

  const handleDownloadVault = useCallback((meme) => {
    if (!meme.dataUrl) return
    const link = document.createElement('a')
    link.download = `meme-${meme.templateName.replace(/\s+/g, '-')}-${Date.now()}.png`
    link.href = meme.dataUrl
    link.click()
  }, [])

  const handleReEdit = useCallback((vaultMeme) => {
    const template = memeTemplates.find((t) => t.id === vaultMeme.templateId)
    if (template) setEditorTemplate(template)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <Ticker />
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={vaultMemes.length}
      />

      {/* Hero area with particles */}
      <div
        className="relative overflow-hidden py-10 px-4 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(0,255,136,0.03) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <MatrixParticles />
        <div className="relative z-10">
          <h1
            className="font-pixel mb-3"
            style={{
              color: '#00ff88',
              fontSize: 'clamp(14px, 3vw, 22px)',
              textShadow: '0 0 20px #00ff88, 0 0 40px rgba(0,255,136,0.4)',
              lineHeight: 1.6,
            }}
          >
            MEME FORGE 🔥
          </h1>
          <p
            className="font-mono max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}
          >
            {activeTab === 'templates'
              ? '30 DEGEN TEMPLATES · EDIT · DOWNLOAD · WAGMI'
              : 'YOUR PERSONAL MEME COLLECTION · SECURED IN VAULT'}
          </p>
          <div
            className="flex items-center justify-center gap-4 mt-3 flex-wrap"
            style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}
          >
            <span className="font-mono">📈 BULL MODE: ON</span>
            <span className="font-mono">💎 DIAMOND HANDS ONLY</span>
            <span className="font-mono">⛽ GAS: 0.00 MEME</span>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'templates' ? (
        <MemeGrid onEdit={handleEdit} onSave={handleQuickSave} />
      ) : (
        <Vault
          memes={vaultMemes}
          onDelete={handleDeleteVault}
          onDownload={handleDownloadVault}
          onReEdit={handleReEdit}
        />
      )}

      {/* Editor overlay */}
      {editorTemplate && (
        <MemeEditor
          template={editorTemplate}
          onClose={() => setEditorTemplate(null)}
          onSave={handleSaveToVault}
        />
      )}

      {/* Toast notification */}
      {notification && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-mono font-bold"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            color: '#0a0a0f',
            fontSize: '11px',
            boxShadow: '0 0 30px rgba(0,255,136,0.5)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {notification}
        </div>
      )}

      {/* Footer */}
      <footer
        className="py-6 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="font-pixel" style={{ color: 'rgba(255,255,255,0.15)', fontSize: '8px' }}>
          MEME FORGE · NOT FINANCIAL ADVICE · DYOR · NFA
        </p>
        <p className="font-mono mt-2" style={{ color: 'rgba(255,255,255,0.1)', fontSize: '9px' }}>
          ⛽ Gas: 0.00 MEME · 💎 FEW UNDERSTAND · gm fren
        </p>
      </footer>
    </div>
  )
}
