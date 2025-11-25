import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GlassCard } from '../ui/GlassCard'
import { RecipePlaceholder } from '../RecipePlaceholder'
import { getRecipeById, deleteRecipe } from '../../lib/recipesApi'
import { 
  ArrowLeft, Clock, Users, Flame, Star, 
  BookmarkPlus, Share2, Pencil, Trash2, 
  ChefHat, Calendar, Loader2, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface RecipeDetailProps {
  recipeId: string
  onNavigate: (page: string, recipeId?: string) => void
}

export function RecipeDetail({ recipeId, onNavigate }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ingredientsChecked, setIngredientsChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    loadRecipe()
  }, [recipeId])

  const loadRecipe = async () => {
    setLoading(true)
    try {
      console.log('📖 Loading recipe:', recipeId)
      const data = await getRecipeById(parseInt(recipeId))
      if (data) {
        console.log('✅ Recipe loaded:', data)
        setRecipe(data)
      } else {
        console.error('❌ Recipe not found')
      }
    } catch (error) {
      console.error('❌ Failed to load recipe:', error)
      toast.error('Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This will remove it from your library and unlink it from any meal history.')) return
    
    try {
      console.log('🗑️ Deleting recipe:', recipeId)
      await deleteRecipe(parseInt(recipeId))
      toast.success('Recipe deleted successfully!')
      onNavigate('recipes')
    } catch (error: any) {
      console.error('❌ Failed to delete:', error)
      const errorMessage = error?.message || 'Failed to delete recipe'
      toast.error(errorMessage)
    }
  }

  const handleAddToThisWeek = () => {
    toast.info('Add to meal plan - coming soon!')
    console.log('Add to this week:', recipeId)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.title,
          text: recipe.description || '',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  const handleAddToGroceryList = () => {
    toast.info('Add to grocery list - coming soon!')
    console.log('Adding ingredients to grocery list')
  }

  const toggleIngredient = (index: number) => {
    setIngredientsChecked(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
          <p className="text-muted">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="p-8">
        <GlassCard hover={false}>
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 mx-auto text-muted mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Recipe not found</h3>
            <p className="text-secondary mb-6">This recipe may have been deleted or doesn't exist.</p>
            <Button 
              variant="glass" 
              onClick={() => onNavigate('recipes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  const displayImage = recipe.image_url || recipe.imageUrl || `https://source.unsplash.com/800x400/?food,${encodeURIComponent(recipe.title)}`
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : []
  const tags = Array.isArray(recipe.tags) ? recipe.tags : []

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button 
          variant="glass" 
          size="icon"
          onClick={() => onNavigate('recipes')}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-lg text-secondary">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="glass" 
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="glass" 
            size="icon"
            onClick={() => toast.info('Edit recipe - coming soon!')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="glass" 
            size="icon"
            onClick={handleDelete}
            className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-2xl overflow-hidden bg-[var(--bg-glass)] shadow-[var(--shadow-lg)]">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <RecipePlaceholder 
                mealName={recipe.title}
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Stats Card */}
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-primary mb-4">Recipe Info</h3>
          <div className="space-y-4">
            {recipe.total_time && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                  <Clock className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Total Time</p>
                  <p className="text-sm text-muted">{recipe.total_time} minutes</p>
                </div>
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                  <Users className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Servings</p>
                  <p className="text-sm text-muted">{recipe.servings} people</p>
                </div>
              </div>
            )}

            {recipe.difficulty && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                  <Flame className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Difficulty</p>
                  <p className="text-sm text-muted capitalize">{recipe.difficulty}</p>
                </div>
              </div>
            )}

            {recipe.average_rating && recipe.average_rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Rating</p>
                  <p className="text-sm text-muted">{recipe.average_rating}★</p>
                </div>
              </div>
            )}

            {recipe.times_made && recipe.times_made > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                  <Calendar className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Times Made</p>
                  <p className="text-sm text-muted">{recipe.times_made} times</p>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2 border-t border-[var(--border-subtle)]">
              <Button 
                className="w-full" 
                onClick={handleAddToThisWeek}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Add to This Week
              </Button>
              <Button 
                variant="glass" 
                className="w-full"
                onClick={() => toast.info('Cooking mode - coming soon!')}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Start Cooking Mode
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tags & Info */}
      <div className="flex flex-wrap gap-2">
        {recipe.source_type === 'url-import' && (
          <Badge variant="secondary" className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20">
            📥 Imported
          </Badge>
        )}
        {recipe.source_type === 'meal-history' && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            ⭐ From Meal Plan
          </Badge>
        )}
        {tags.map((tag: string) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Ingredients & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Ingredients</h3>
            <span className="text-sm text-muted">
              {ingredients.length} items
            </span>
          </div>
          <div className="space-y-3 mb-4">
            {ingredients.map((ingredient: string, index: number) => (
              <label 
                key={index} 
                className="flex items-start gap-3 group cursor-pointer"
                htmlFor={`ingredient-${index}`}
              >
                <input 
                  type="checkbox" 
                  checked={ingredientsChecked[index] || false}
                  onChange={() => toggleIngredient(index)}
                  className="mt-0.5 rounded border-[var(--border-medium)] w-4 h-4"
                  id={`ingredient-${index}`}
                />
                <span 
                  className={`text-sm transition-all ${
                    ingredientsChecked[index] 
                      ? 'line-through text-muted' 
                      : 'text-primary'
                  }`}
                >
                  {ingredient}
                </span>
              </label>
            ))}
          </div>
          <Button 
            variant="glass" 
            className="w-full"
            onClick={handleAddToGroceryList}
          >
            📝 Add All to Grocery List
          </Button>
        </GlassCard>

        {/* Instructions */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Instructions</h3>
            <span className="text-sm text-muted">
              {instructions.length} steps
            </span>
          </div>
          <ol className="space-y-4">
            {instructions.map((instruction: string, index: number) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {index + 1}
                </span>
                <p className="text-sm pt-1 text-secondary">{instruction}</p>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* Source Info */}
      {recipe.source_url && (
        <GlassCard hover={false} className="bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <ExternalLink className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>Originally from:</span>
            <a 
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:underline font-medium"
            >
              {recipe.source || new URL(recipe.source_url).hostname}
            </a>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
