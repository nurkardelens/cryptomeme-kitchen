import { categories } from '../data/memeTemplates'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-8">
      {categories.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'text-bg'
                : 'text-gray-400 hover:text-white hover:border-gray-500'
            }`}
            style={{
              fontSize: '10px',
              background: isActive
                ? 'linear-gradient(135deg, #00ff88, #00cc6a)'
                : 'rgba(255,255,255,0.04)',
              border: isActive
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isActive ? '0 0 12px rgba(0,255,136,0.4)' : 'none',
            }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
