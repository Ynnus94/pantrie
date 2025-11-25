import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, RefreshCw, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'
import { searchMultipleFoodImages } from '../../services/imageService'

interface RefreshImageModalProps {
  meal: any
  isOpen: boolean
  onClose: () => void
  onImageSelected: (imageUrl: string) => void
}

export function RefreshImageModal({ 
  meal, 
  isOpen, 
  onClose, 
  onImageSelected 
}: RefreshImageModalProps) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const mealName = meal?.name || meal?.mealName || ''

  // Auto-fetch on modal open
  useEffect(() => {
    if (isOpen && mealName) {
      fetchImages(1)
    }
    // Reset when closed
    if (!isOpen) {
      setImages([])
      setPage(1)
      setError(null)
    }
  }, [isOpen, mealName])

  const fetchImages = async (pageNum: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const newImages = await searchMultipleFoodImages(mealName, pageNum)
      
      if (newImages.length > 0) {
        setImages(newImages) // REPLACE, not append
        setPage(pageNum)
      } else {
        setError('No images found. Try uploading your own.')
      }
    } catch (err) {
      console.error('Failed to fetch images:', err)
      setError('Failed to load images. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectImage = (imageUrl: string) => {
    onImageSelected(imageUrl)
    toast.success('Image updated!')
    onClose()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Maximum file size is 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      onImageSelected(reader.result as string)
      toast.success('Image uploaded!')
      onClose()
    }
    reader.readAsDataURL(file)
  }

  const handleShowMore = () => {
    fetchImages(page + 1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[550px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <RefreshCw className="h-5 w-5 text-[var(--accent-primary)]" />
            Find Better Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Meal name */}
          <p className="text-sm text-secondary font-medium">{mealName}</p>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
              <p className="text-sm text-muted">Finding images...</p>
            </div>
          )}

          {/* Error state - only show if no images */}
          {error && !loading && images.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted">{error}</p>
            </div>
          )}

          {/* Image grid - always show exactly 6 */}
          {!loading && images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(0, 6).map((imageUrl, index) => (
                <button
                  key={`${page}-${index}`}
                  onClick={() => handleSelectImage(imageUrl)}
                  className="aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--accent-primary)] transition-all group relative"
                >
                  <img 
                    src={imageUrl} 
                    alt={`Option ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Check className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="glass"
              onClick={handleShowMore}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Show More
                </>
              )}
            </Button>
            
            <label className="flex-1">
              <Button variant="glass" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
