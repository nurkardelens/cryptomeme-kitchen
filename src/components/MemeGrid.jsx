import Masonry from 'react-masonry-css'
import MemeCard from './MemeCard'
import CategoryFilter from './CategoryFilter'
import { useState, useMemo } from 'react'
import { memeTemplates } from '../data/memeTemplates'

const BREAKPOINTS = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 3,
  640: 2,
  0: 2,
}

export default function MemeGrid({ onEdit, onSave }) {
  const [category, setCategory] = useState('All 🔥')

  const filtered = useMemo(() => {
    if (category === 'All 🔥') return memeTemplates
    return memeTemplates.filter((t) => t.category === category)
  }, [category])

  return (
    <div className="pb-16">
      {/* Category filter */}
      <div className="py-4">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {/* Results count */}
      <div className="px-4 md:px-8 mb-4">
        <span
          className="font-mono text-xs"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}
        >
          {filtered.length} TEMPLATES LOADED • WAGMI
        </span>
      </div>

      {/* Masonry grid */}
      <div className="px-4 md:px-6">
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {filtered.map((template, idx) => (
            <div
              key={template.id}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <MemeCard
                template={template}
                onEdit={onEdit}
                onSave={onSave}
              />
            </div>
          ))}
        </Masonry>
      </div>
    </div>
  )
}
