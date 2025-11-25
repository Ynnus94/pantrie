import { ExternalLink, ChevronRight, Globe } from 'lucide-react'

interface RecipeSourceCardProps {
  sourceUrl: string
  source?: string
}

export function RecipeSourceCard({ sourceUrl, source }: RecipeSourceCardProps) {
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain
    } catch {
      return source || 'External'
    }
  }

  const domain = source || extractDomain(sourceUrl)

  return (
    <a 
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-[var(--bg-glass-light)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)]/20 transition-colors">
            <Globe className="h-5 w-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <p className="font-medium text-primary group-hover:text-[var(--accent-primary)] transition-colors">
              View Original Recipe
            </p>
            <p className="text-sm text-muted">{domain}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all" />
      </div>
    </a>
  )
}

