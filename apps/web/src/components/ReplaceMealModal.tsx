import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/badge'
import { Sparkles, Search, Clock, Star, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface ReplaceMealModalProps {
  meal: any
  isOpen: boolean
  onClose: () => void
  onReplace: (newMeal: any) => void
  onNavigateToRecipes?: () => void
}

export function ReplaceMealModal({ 
  meal, 
  isOpen, 
  onClose, 
  onReplace,
  onNavigateToRecipes 
}: ReplaceMealModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedAlternative, setGeneratedAlternative] = useState<any>(null)

  // Sample favorites - in real app, load from database
  const recentFavorites = [
    { 
      id: 'fav1', 
      name: 'Honey Garlic Salmon', 
      cuisine: 'Asian', 
      cookTime: 25, 
      rating: 5,
      imageUrl: 'https://source.unsplash.com/200x200/?salmon,honey'
    },
    { 
      id: 'fav2', 
      name: 'Korean Beef Tacos', 
      cuisine: 'Fusion', 
      cookTime: 30, 
      rating: 4.5,
      imageUrl: 'https://source.unsplash.com/200x200/?korean,tacos'
    },
  ]

  const handleGenerateAlternative = async () => {
    setGenerating(true)
    try {
      // Simulate API call - in real app, call your meal generation endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const alternative = {
        id: `alt-${Date.now()}`,
        name: meal.cuisine === 'Indian' ? 'Butter Chicken' : 'Grilled Teriyaki Chicken',
        description: 'A delicious alternative that matches your preferences',
        cuisine: meal.cuisine || 'Asian',
        cookTime: meal.cookTime || 30,
        difficulty: meal.difficulty || 'Easy',
        ingredients: ['Chicken', 'Sauce', 'Spices', 'Rice'],
        instructions: ['Prep ingredients', 'Cook chicken', 'Add sauce', 'Serve'],
        imageUrl: `https://source.unsplash.com/600x400/?${meal.cuisine || 'chicken'},food`
      }
      
      setGeneratedAlternative(alternative)
      toast.success('Generated a new suggestion!')
    } catch (error) {
      console.error('Failed to generate:', error)
      toast.error('Failed to generate alternative')
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectAlternative = (selectedMeal: any) => {
    onReplace(selectedMeal)
    setGeneratedAlternative(null)
    onClose()
  }

  const handleSelectFavorite = (favorite: any) => {
    const newMeal = {
      ...meal,
      id: `replaced-${Date.now()}`,
      name: favorite.name,
      cuisine: favorite.cuisine,
      cookTime: favorite.cookTime,
      imageUrl: favorite.imageUrl,
      description: `Replaced from favorites: ${favorite.name}`,
    }
    onReplace(newMeal)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Replace "{meal?.name}"</DialogTitle>
          <DialogDescription>
            Choose a new meal for {meal?.dayOfWeek || 'this day'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* AI Generate Option */}
          <GlassCard hover={false} className="border-2 border-dashed border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-lg text-primary">
              <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
              Let AI suggest something similar
            </h3>
            <p className="text-sm text-muted mb-4">
              We'll suggest a meal with similar cooking time ({meal?.cookTime || 30} min) and cuisine style
            </p>
            
            {generatedAlternative ? (
              <GlassCard hover={false} className="border-2 border-[var(--success-border)] bg-[var(--success-bg)]">
                <div className="flex items-start gap-4">
                  {generatedAlternative.imageUrl && (
                    <img 
                      src={generatedAlternative.imageUrl} 
                      alt={generatedAlternative.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-primary">{generatedAlternative.name}</h4>
                    <p className="text-sm text-secondary mb-2">{generatedAlternative.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted">
                        <Clock className="h-4 w-4" />
                        {generatedAlternative.cookTime} min
                      </span>
                      <Badge className="glass-badge">{generatedAlternative.cuisine}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleSelectAlternative(generatedAlternative)}
                  >
                    Use This Meal
                  </Button>
                  <Button 
                    variant="glass"
                    onClick={handleGenerateAlternative}
                    disabled={generating}
                  >
                    Try Another
                  </Button>
                </div>
              </GlassCard>
            ) : (
              <Button 
                onClick={handleGenerateAlternative} 
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Alternative
                  </>
                )}
              </Button>
            )}
          </GlassCard>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-sm text-muted">or</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>
          
          {/* Recipe Library Option */}
          <GlassCard hover={false}>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg text-primary">
              <BookOpen className="h-5 w-5 text-[var(--accent-primary)]" />
              Choose from your Recipe Library
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                placeholder="Search your recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted">Recent Favorites:</p>
              <div className="grid grid-cols-2 gap-3">
                {recentFavorites.map((favorite) => (
                  <button 
                    key={favorite.id} 
                    className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-glass-light)] hover:border-[var(--accent-primary)] transition-all group text-left"
                    onClick={() => handleSelectFavorite(favorite)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-glass)] flex-shrink-0">
                        <img 
                          src={favorite.imageUrl} 
                          alt={favorite.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-primary">{favorite.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {favorite.cookTime}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                            {favorite.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {onNavigateToRecipes && (
                <Button 
                  variant="glass" 
                  className="w-full mt-2"
                  onClick={() => {
                    onClose()
                    onNavigateToRecipes()
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Full Recipe Library
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      </DialogContent>
    </Dialog>
  )
}
