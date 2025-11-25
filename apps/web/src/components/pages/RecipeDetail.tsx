import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RecipePlaceholder } from '../RecipePlaceholder'
import { getRecipeById, deleteRecipe } from '../../lib/recipesApi'
import { 
  ArrowLeft, Clock, Users, Flame, Star, 
  BookmarkPlus, Share2, Pencil, Trash2, 
  ChefHat, Calendar, Loader2
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
    // TODO: Implement add to meal plan
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
    // TODO: Implement add to grocery list
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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="p-8">
        <Card className="border border-[#16250F]/10">
          <CardContent className="text-center py-12">
            <ChefHat className="h-16 w-16 mx-auto text-primary/30 mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Recipe not found</h3>
            <p className="text-primary/70 mb-6">This recipe may have been deleted or doesn't exist.</p>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('recipes')}
              className="border-[#16250F]/20 hover:border-[#FF9500]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </CardContent>
        </Card>
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
          variant="ghost" 
          size="icon"
          onClick={() => onNavigate('recipes')}
          className="flex-shrink-0 hover:bg-[#F5F1E8]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold text-primary mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-lg text-primary/70">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleShare}
            className="border-[#16250F]/20 hover:border-[#FF9500]"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="border-[#16250F]/20 hover:border-[#FF9500]"
            onClick={() => toast.info('Edit recipe - coming soon!')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDelete}
            className="border-red-200 hover:border-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-[#F5F1E8] shadow-xl">
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
        <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/30">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Recipe Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipe.total_time && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#FF9500]" />
                <div>
                  <p className="text-sm font-medium text-primary">Total Time</p>
                  <p className="text-sm text-primary/70">{recipe.total_time} minutes</p>
                </div>
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#FF9500]" />
                <div>
                  <p className="text-sm font-medium text-primary">Servings</p>
                  <p className="text-sm text-primary/70">{recipe.servings} people</p>
                </div>
              </div>
            )}

            {recipe.difficulty && (
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-[#FF9500]" />
                <div>
                  <p className="text-sm font-medium text-primary">Difficulty</p>
                  <p className="text-sm text-primary/70 capitalize">{recipe.difficulty}</p>
                </div>
              </div>
            )}

            {recipe.average_rating && recipe.average_rating > 0 && (
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-primary">Rating</p>
                  <p className="text-sm text-primary/70">{recipe.average_rating}★</p>
                </div>
              </div>
            )}

            {recipe.times_made && recipe.times_made > 0 && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#FF9500]" />
                <div>
                  <p className="text-sm font-medium text-primary">Times Made</p>
                  <p className="text-sm text-primary/70">{recipe.times_made} times</p>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button 
                className="w-full bg-[#FF9500] hover:bg-[#FF8500] text-white shadow-lg" 
                onClick={handleAddToThisWeek}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Add to This Week
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#16250F]/20 hover:border-[#FF9500]"
                onClick={() => toast.info('Cooking mode - coming soon!')}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Start Cooking Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags & Info */}
      <div className="flex flex-wrap gap-2">
        {recipe.source_type === 'url-import' && (
          <Badge variant="outline" className="border-[#16250F]/30 bg-[#F5F1E8]/50">
            📥 Imported
          </Badge>
        )}
        {recipe.source_type === 'meal-history' && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            ⭐ From Meal Plan
          </Badge>
        )}
        {tags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="bg-[#F5F1E8] text-primary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Ingredients & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary">Ingredients</CardTitle>
              <span className="text-sm text-primary/60">
                {ingredients.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {ingredients.map((ingredient: string, index: number) => (
                <div key={index} className="flex items-start gap-3 group">
                  <input 
                    type="checkbox" 
                    checked={ingredientsChecked[index] || false}
                    onChange={() => toggleIngredient(index)}
                    className="mt-0.5"
                    id={`ingredient-${index}`}
                  />
                  <label 
                    htmlFor={`ingredient-${index}`}
                    className={`text-sm cursor-pointer transition-all ${
                      ingredientsChecked[index] 
                        ? 'line-through text-primary/40' 
                        : 'text-primary'
                    }`}
                  >
                    {ingredient}
                  </label>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full border-[#16250F]/20 hover:border-[#FF9500]"
              onClick={handleAddToGroceryList}
            >
              📝 Add All to Grocery List
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary">Instructions</CardTitle>
              <span className="text-sm text-primary/60">
                {instructions.length} steps
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF9500] text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </span>
                  <p className="text-sm pt-1 text-primary">{instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Source Info */}
      {recipe.source_url && (
        <Card className="border border-[#16250F]/10 bg-[#F5F1E8]/30">
          <CardContent className="pt-6">
            <p className="text-sm text-primary/70">
              📌 Originally from:{' '}
              <a 
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF9500] hover:underline font-medium"
              >
                {recipe.source || new URL(recipe.source_url).hostname}
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

