import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, RefreshCw, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'

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

  const mealName = meal?.name || meal?.mealName || ''

  // Clean meal name for search
  const getSearchTerm = (name: string): string => {
    if (!name) return 'dinner'
    // Remove "with..." and everything after
    let clean = name.toLowerCase()
      .split(' with ')[0]
      .split(' and ')[0]
      .split(',')[0]
      .trim()
    return clean || 'dinner'
  }

  // Fetch images on open
  useEffect(() => {
    if (isOpen && mealName) {
      fetchImages(1)
    }
    // Reset when closed
    if (!isOpen) {
      setImages([])
      setPage(1)
    }
  }, [isOpen, mealName])

  const fetchImages = async (pageNum: number) => {
    setLoading(true)
    
    try {
      const searchTerm = getSearchTerm(mealName)
      const newImages = await getUniqueImages(searchTerm, pageNum)
      
      if (pageNum === 1) {
        setImages(newImages)
      } else {
        setImages(prev => [...prev, ...newImages])
      }
      setPage(pageNum)
    } catch (error) {
      console.error('Failed to fetch images:', error)
      toast.error('Failed to load images')
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
          {loading && images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
              <p className="text-sm text-muted">Finding images...</p>
            </div>
          )}

          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
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

// Fetch unique images using varied search terms
async function getUniqueImages(baseTerm: string, page: number): Promise<string[]> {
  // Use different variations for each image to ensure uniqueness
  const variations = [
    baseTerm,
    `${baseTerm} dish`,
    `${baseTerm} plate`,
    `${baseTerm} homemade`,
    `${baseTerm} restaurant`,
    `${baseTerm} delicious`,
  ]
  
  // For page 2+, use different terms
  const pageVariations = [
    `${baseTerm} meal`,
    `${baseTerm} dinner`,
    `${baseTerm} lunch`,
    `${baseTerm} cuisine`,
    `${baseTerm} recipe`,
    `${baseTerm} cooked`,
  ]
  
  const termsToUse = page === 1 ? variations : pageVariations
  
  // Generate URLs with unique timestamps to bust cache
  const timestamp = Date.now()
  const images = termsToUse.map((term, index) => {
    // Use Unsplash Source API with unique sig for each image
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(term + ' food')}&sig=${timestamp + index * 1000 + page * 10000}`
  })
  
  return images
}
