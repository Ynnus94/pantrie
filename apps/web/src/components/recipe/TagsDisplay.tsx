import { useState } from 'react'

interface TagsDisplayProps {
  tags: string[]
  maxVisible?: number
}

export function TagsDisplay({ tags, maxVisible = 5 }: TagsDisplayProps) {
  const [showAll, setShowAll] = useState(false)
  
  if (!tags || tags.length === 0) return null
  
  const displayTags = showAll ? tags : tags.slice(0, maxVisible)
  const hiddenCount = tags.length - maxVisible

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map(tag => (
        <span 
          key={tag} 
          className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-glass-light)] text-secondary border border-[var(--border-subtle)]"
        >
          {tag}
        </span>
      ))}
      {hiddenCount > 0 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-colors"
        >
          {showAll ? 'Show less' : `+${hiddenCount} more`}
        </button>
      )}
    </div>
  )
}

