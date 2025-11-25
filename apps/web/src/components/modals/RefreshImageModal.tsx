import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, Upload, Loader2, RefreshCw, Check, X, ImageIcon } from 'lucide-react'
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
  const [customSearch, setCustomSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Generate smart alternative searches based on meal name
  const alternatives = generateAlternatives(meal?.name || meal?.mealName || '')
  
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    setSearching(true)
    setPreviewImages([])
    
    try {
      const images = await fetchMultipleImages(searchTerm, 6)
      if (images.length === 0) {
        toast.error('No images found', { description: 'Try a different search term' })
      }
      setPreviewImages(images)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed', { description: 'Please try again' })
    } finally {
      setSearching(false)
    }
  }
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please upload an image file' })
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB' })
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setSelectedImage(result)
      onImageSelected(result)
      toast.success('Image uploaded!')
      onClose()
    }
    reader.readAsDataURL(file)
  }

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    onImageSelected(imageUrl)
    toast.success('Image updated!')
    onClose()
  }

  const handleClose = () => {
    setPreviewImages([])
    setCustomSearch('')
    setSelectedImage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card-strong max-w-4xl max-h-[90vh] overflow-y-auto border-[var(--border-glass)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <RefreshCw className="h-5 w-5 text-accent" />
            Find Better Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current meal info */}
          {meal && (
            <div className="glass-card-light p-4 rounded-xl">
              <p className="text-sm text-muted mb-1">Current meal:</p>
              <p className="font-semibold text-primary">{meal.name || meal.mealName}</p>
            </div>
          )}

          {/* Quick alternatives */}
          {alternatives.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3 text-secondary">
                Try these search terms:
              </p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="glass-button px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform"
                    disabled={searching}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom search */}
          <div>
            <p className="text-sm font-medium mb-3 text-secondary">
              Or enter your own search:
            </p>
            <div className="flex gap-2">
              <Input
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(customSearch)}
                placeholder="e.g., 'grilled salmon dinner'"
                className="glass-input flex-1"
              />
              <Button
                onClick={() => handleSearch(customSearch)}
                disabled={searching || !customSearch.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {searching && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm text-muted">Searching for images...</p>
            </div>
          )}

          {/* Image results */}
          {previewImages.length > 0 && !searching && (
            <div>
              <p className="text-sm font-medium mb-3 text-secondary">
                Click an image to use it:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectImage(imageUrl)}
                    className="aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--accent-primary)] transition-all group relative"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Check className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results state */}
          {previewImages.length === 0 && !searching && customSearch && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted mb-3" />
              <p className="text-secondary">No images found</p>
              <p className="text-sm text-muted">Try a different search term</p>
            </div>
          )}

          {/* Upload option */}
          <div className="border-t border-[var(--border-subtle)] pt-6">
            <p className="text-sm font-medium mb-3 text-secondary">
              Or upload your own photo:
            </p>
            <label className="glass-button flex items-center justify-center gap-2 px-4 py-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform">
              <Upload className="h-5 w-5" />
              <span>Upload Photo</span>
              <span className="text-xs text-muted">(Max 5MB)</span>
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

// Helper: Generate smart alternatives based on meal name
function generateAlternatives(mealName: string): string[] {
  if (!mealName) return []
  
  const lower = mealName.toLowerCase()
  const alternatives: string[] = []
  
  // Extract main dish (before "with" or comma)
  const mainDish = lower.split(' with ')[0].split(',')[0].trim()
  if (mainDish && mainDish.length > 2) {
    alternatives.push(mainDish)
  }
  
  // Add variations based on common keywords
  if (lower.includes('chicken')) {
    alternatives.push('grilled chicken', 'chicken dinner plate')
  } else if (lower.includes('salmon')) {
    alternatives.push('grilled salmon', 'baked salmon dinner')
  } else if (lower.includes('beef') || lower.includes('steak')) {
    alternatives.push('grilled steak', 'beef dinner')
  } else if (lower.includes('pasta')) {
    alternatives.push('pasta dish', 'italian pasta')
  } else if (lower.includes('stir fry') || lower.includes('stirfry')) {
    alternatives.push('stir fry', 'asian stir fry')
  } else if (lower.includes('tacos')) {
    alternatives.push('tacos plate', 'mexican tacos')
  } else if (lower.includes('soup')) {
    alternatives.push('homemade soup', 'soup bowl')
  } else if (lower.includes('salad')) {
    alternatives.push('fresh salad', 'healthy salad')
  } else if (lower.includes('rice')) {
    alternatives.push('rice bowl', 'rice dinner')
  } else if (lower.includes('curry')) {
    alternatives.push('curry dish', 'indian curry')
  }
  
  // Add plated/dinner versions
  if (mainDish) {
    alternatives.push(mainDish + ' plate')
    alternatives.push(mainDish + ' food photography')
  }
  
  // Remove duplicates and limit to 5
  return [...new Set(alternatives)].slice(0, 5)
}

// Helper: Fetch multiple images from Unsplash
async function fetchMultipleImages(searchTerm: string, count: number = 6): Promise<string[]> {
  // Use Unsplash Source API (free, no API key needed)
  // Generate multiple random images with cache-busting
  const images: string[] = []
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i
    const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(searchTerm + ' food')}&sig=${timestamp}`
    images.push(imageUrl)
  }
  
  return images
}

