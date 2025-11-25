import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Parse video URL to determine type and get embed URL
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      
      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = ''
        
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1)
        } else {
          videoId = urlObj.searchParams.get('v') || ''
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
        }
      }
      
      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const videoId = urlObj.pathname.split('/').pop()
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=1`
        }
      }
      
      // Direct video file (mp4, webm)
      if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return url
      }
      
      return null
    } catch {
      return null
    }
  }

  const embedUrl = getEmbedUrl(videoUrl)
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i)

  if (!embedUrl && !isDirectVideo) {
    // If we can't embed, show a link to the video
    return (
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-glass-light)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors"
      >
        <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10">
          <Play className="h-6 w-6 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-primary">Watch Video</p>
          <p className="text-sm text-muted">Opens in new tab</p>
        </div>
        <ExternalLink className="h-5 w-5 text-muted" />
      </a>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-black shadow-lg">
      {!isPlaying ? (
        // Thumbnail with play button
        <button
          onClick={() => setIsPlaying(true)}
          className="relative w-full aspect-video group"
        >
          {/* Thumbnail - try to get from YouTube */}
          {embedUrl?.includes('youtube') && (
            <img
              src={`https://img.youtube.com/vi/${embedUrl.split('/embed/')[1]?.split('?')[0]}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default thumbnail
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${embedUrl.split('/embed/')[1]?.split('?')[0]}/hqdefault.jpg`
              }}
            />
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="p-4 rounded-full bg-[var(--accent-primary)] text-white shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 fill-current" />
            </div>
          </div>
          
          {/* Label */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm backdrop-blur-sm">
            Watch Recipe Video
          </div>
        </button>
      ) : (
        // Video player
        <div className="relative w-full aspect-video">
          {isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              title={title}
            />
          ) : (
            <iframe
              src={embedUrl || ''}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}
    </div>
  )
}

