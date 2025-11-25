import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { GlassCard } from '../ui/GlassCard'
import { RecipePlaceholder } from '../RecipePlaceholder'
import { getRecipeById, deleteRecipe } from '../../lib/recipesApi'
import { 
  CookingMode, 
  InteractiveIngredients, 
  AddToWeekDropdown,
  VideoPlayer,
  RecipeSourceCard,
  TagsDisplay
} from '../recipe'
import { 
  ArrowLeft, Clock, Users, Flame, Star, 
  Share2, Pencil, Trash2, 
  ChefHat, Calendar, Loader2, Play
} from 'lucide-react'
import { toast } from 'sonner'

interface RecipeDetailProps {
  recipeId: string
  onNavigate: (page: string, recipeId?: string) => void
}

export function RecipeDetail({ recipeId, onNavigate }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCookingMode, setShowCookingMode] = useState(false)

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

  const handleCookingComplete = () => {
    // TODO: Mark as cooked in database
    toast.success('Great job cooking! 🎉')
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

  const displayImage = recipe.image_url || recipe.imageUrl
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : []
  const tags = Array.isArray(recipe.tags) ? recipe.tags : []
  const videoUrl = recipe.video_url || recipe.videoUrl

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-base md:text-lg text-secondary">{recipe.description}</p>
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

      {/* Video (if available) */}
      {videoUrl && (
        <VideoPlayer videoUrl={videoUrl} title={recipe.title} />
      )}

      {/* Source Link (prominent) */}
      {recipe.source_url && (
        <RecipeSourceCard 
          sourceUrl={recipe.source_url} 
          source={recipe.source}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
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

          {/* Tags */}
          {tags.length > 0 && (
            <TagsDisplay tags={tags} maxVisible={5} />
          )}

          {/* Instructions */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Instructions</h3>
              <span className="text-sm text-muted">
                {instructions.length} steps
              </span>
            </div>
            <ol className="space-y-4 mb-6">
              {instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </span>
                  <p className="text-secondary pt-1 flex-1">{instruction}</p>
                </li>
              ))}
            </ol>
            
            {/* Start Cooking Mode Button */}
            {instructions.length > 0 && (
              <Button 
                onClick={() => setShowCookingMode(true)}
                className="w-full gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                Start Cooking Mode
              </Button>
            )}
          </GlassCard>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Recipe Info Card */}
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

              {recipe.average_rating > 0 && (
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

              {recipe.times_made > 0 && (
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

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                {/* Add to Week Dropdown */}
                <AddToWeekDropdown 
                  recipe={{
                    id: recipe.id,
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: ingredients,
                    instructions: instructions,
                    cookTime: recipe.total_time || recipe.cook_time,
                    imageUrl: displayImage
                  }}
                  quickDays={[1, 3]} // Mon, Wed - customize based on user settings
                />
              </div>
            </div>
          </GlassCard>

          {/* Interactive Ingredients Card */}
          {ingredients.length > 0 && (
            <InteractiveIngredients 
              ingredients={ingredients}
              baseServings={recipe.servings || 4}
              recipeTitle={recipe.title}
            />
          )}
        </div>
      </div>

      {/* Cooking Mode Modal */}
      <CookingMode
        recipe={{
          title: recipe.title,
          instructions: instructions,
          ingredients: ingredients
        }}
        isOpen={showCookingMode}
        onClose={() => setShowCookingMode(false)}
        onComplete={handleCookingComplete}
      />
    </div>
  )
}
