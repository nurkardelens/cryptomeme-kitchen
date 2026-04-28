const FILTER_DEFS = [
  { key: 'brightness', label: 'BRIGHTNESS', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'contrast', label: 'CONTRAST', min: 0, max: 200, default: 100, unit: '%' },
  { key: 'saturate', label: 'SATURATION', min: 0, max: 300, default: 100, unit: '%' },
  { key: 'blur', label: 'BLUR', min: 0, max: 10, default: 0, unit: 'px' },
  { key: 'hueRotate', label: 'HUE ROTATE', min: 0, max: 360, default: 0, unit: 'deg' },
]

export const defaultFilters = Object.fromEntries(
  FILTER_DEFS.map((f) => [f.key, f.default])
)

export function filtersToCSS(filters) {
  return [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturate}%)`,
    `blur(${filters.blur}px)`,
    `hue-rotate(${filters.hueRotate}deg)`,
  ].join(' ')
}

export default function FilterControls({ filters, onChange }) {
  const reset = () => {
    onChange(defaultFilters)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-pixel text-neon-green" style={{ fontSize: '8px' }}>
          FILTERS
        </span>
        <button
          onClick={reset}
          className="font-mono text-xs px-2 py-1 rounded transition-colors hover:text-white"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '9px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          RESET
        </button>
      </div>

      <div className="space-y-3">
        {FILTER_DEFS.map((def) => (
          <div key={def.key}>
            <div className="flex justify-between mb-1">
              <span className="font-mono uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
                {def.label}
              </span>
              <span className="font-mono" style={{ color: '#00ff88', fontSize: '9px' }}>
                {filters[def.key]}{def.unit}
              </span>
            </div>
            <input
              type="range"
              min={def.min}
              max={def.max}
              value={filters[def.key]}
              onChange={(e) =>
                onChange({ ...filters, [def.key]: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
