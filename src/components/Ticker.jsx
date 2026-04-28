const TICKER_TEXT =
  '🚀 MEME SZEASON IS HERE • 🔥 WAGMI • 💎 DIAMOND HANDS ONLY • 🧠 FEW UNDERSTAND • 📈 NUMBER GO UP • ⛽ GAS: 0.00 MEME • 🫡 gm • NFA DYOR • 🐸 PEPE STAYS WINNING • 💀 NGMI IF YOU SELL • 🦍 APE IN • 🌕 WEN MOON SER • 🏦 NOT YOUR KEYS NOT YOUR COINS • 🎰 SIR THIS IS A CASINO •'

export default function Ticker() {
  const doubled = TICKER_TEXT + ' ' + TICKER_TEXT

  return (
    <div
      style={{ background: '#050508', borderBottom: '1px solid rgba(0,255,136,0.15)' }}
      className="overflow-hidden py-1.5 relative z-50"
    >
      <div className="ticker-track text-xs font-pixel text-neon-green" style={{ fontSize: '9px' }}>
        <span className="mr-8">{doubled}</span>
        <span className="mr-8">{doubled}</span>
      </div>
    </div>
  )
}
