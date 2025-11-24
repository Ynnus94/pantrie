import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { getRecipes, deleteRecipe } from '../../lib/recipesApi'
import { Book, Search, Plus, Clock, Utensils, Star, Loader2, MoreVertical, Eye, Pencil, Calendar, Share2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RecipeImportCard } from '../RecipeImportCard'
import { toast } from 'sonner'

interface Recipe {
  id: string | number
  title?: string
  name?: string
  description: string
  cuisine?: string
  cook_time?: number
  cookTime?: number
  ingredients: string[]
  instructions: string[]
  average_rating?: number
  rating?: number
  tags?: string[]
}

interface RecipeLibraryPageProps {
  onNavigate?: (page: string, recipeId?: string) => void
}

export function RecipeLibraryPage({ onNavigate }: RecipeLibraryPageProps = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      console.log('📚 Loading recipes from database...')
      const data = await getRecipes()
      console.log('✅ Loaded recipes:', data)
      setRecipes(data)
    } catch (error) {
      console.error('❌ Failed to load recipes:', error)
      toast.error('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const recipeName = recipe.title || recipe.name || ''
    const recipeCuisine = recipe.cuisine || (recipe.tags && recipe.tags[0]) || ''
    return recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipeCuisine.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleRecipeImported = (recipe: any) => {
    // Recipe is already saved to database by RecipeImportCard
    // Just refresh the list
    console.log('Recipe imported, refreshing list:', recipe)
    loadRecipes()
  }

  const handleDelete = async (recipeId: string | number) => {
    if (!confirm('Are you sure you want to delete this recipe? This will remove it from your library and unlink it from any meal history.')) return
    
    try {
      console.log('🗑️ Deleting recipe:', recipeId)
      await deleteRecipe(typeof recipeId === 'string' ? parseInt(recipeId) : recipeId)
      toast.success('Recipe deleted successfully!')
      await loadRecipes()
    } catch (error: any) {
      console.error('❌ Failed to delete:', error)
      const errorMessage = error?.message || 'Failed to delete recipe'
      toast.error(errorMessage)
    }
  }

  const handleViewRecipe = (recipeId: string | number) => {
    if (onNavigate) {
      onNavigate('recipe-detail', String(recipeId))
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#16250F] mb-2">Recipes</h1>
        <p className="text-lg text-[#16250F]/70 font-serif">
          Your curated collection of favorite recipes. Import from URLs or save from meal history.
        </p>
      </div>

      {/* Import Card - Primary Action */}
      <RecipeImportCard 
        onManualEntry={() => setShowAddDialog(true)}
        onRecipeImported={handleRecipeImported}
      />

      {/* Recipe Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#16250F]">
            Your Recipes ({recipes.length})
          </h2>
          {recipes.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-[#16250F]/20 hover:border-[#FF9500]">Filter</Button>
              <Button variant="outline" size="sm" className="border-[#16250F]/20 hover:border-[#FF9500]">Sort</Button>
            </div>
          )}
        </div>

        {/* Manual Entry Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="hidden" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
              <DialogDescription>
                Save a recipe to your library for easy access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-name">Recipe Name</Label>
                <Input id="recipe-name" placeholder="e.g., Honey Garlic Salmon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-cuisine">Cuisine</Label>
                <Input id="recipe-cuisine" placeholder="e.g., Asian, Italian" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                  <Input id="cook-time" type="number" placeholder="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-description">Description</Label>
                <Textarea id="recipe-description" placeholder="Brief description of the recipe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea id="ingredients" placeholder="1 lb salmon&#10;2 tbsp honey&#10;3 cloves garlic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (one per line)</Label>
                <Textarea id="instructions" placeholder="Step 1: Heat pan&#10;Step 2: Cook salmon" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#FF9500] hover:bg-[#FF8500]">
                  Save Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {/* Search */}
        {recipes.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#16250F]/40" />
            <Input
              placeholder="Search recipes by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#16250F]/10 focus-visible:ring-[#FF9500]"
            />
          </div>
        )}

        {/* Empty State */}
        {filteredRecipes.length === 0 ? (
          <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/30">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Book className="h-10 w-10 text-[#F5F1E8]" />
              </div>
              <h3 className="text-2xl font-bold text-[#16250F] mb-3">
                {searchQuery ? 'No recipes match your search' : 'No recipes yet!'}
              </h3>
              <p className="text-[#16250F]/70 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Import your first recipe by pasting a URL above'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-[#16250F]/60">
                  Try recipes from AllRecipes, NYTimes Cooking, or any food blog
                </p>
              )}
            </CardContent>
          </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const title = recipe.title || recipe.name || 'Untitled Recipe'
            const cookTime = recipe.cook_time || recipe.cookTime || 0
            const rating = recipe.average_rating || recipe.rating
            const cuisine = recipe.cuisine || (recipe.tags && recipe.tags[0]) || 'Other'
            const imageUrl = recipe.image_url || recipe.imageUrl
            
            // Use Unsplash food photo as placeholder if no image
            const displayImage = imageUrl || `https://source.unsplash.com/600x400/?${encodeURIComponent(cuisine)},food,dish,recipe`
            
            return (
              <Card key={recipe.id} className="border border-[#16250F]/10 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-[#F5F1E8]/20">
                <div 
                  className="h-48 overflow-hidden rounded-t-lg bg-[#F5F1E8] relative cursor-pointer group"
                  onClick={() => handleViewRecipe(recipe.id)}
                >
                  <img 
                    src={displayImage} 
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // If image fails to load, show a gradient placeholder
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF9500]/20 to-[#16250F]/10">
                            <svg class="w-16 h-16 text-[#16250F]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                            </svg>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-[#16250F] font-serif">{title}</CardTitle>
                    {rating && rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-[#16250F]/30 text-xs bg-[#F5F1E8]/50">
                      {cuisine}
                    </Badge>
                    {cookTime > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[#16250F]/60">
                        <Clock className="h-3 w-3" />
                        {cookTime} min
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#16250F]/70 mb-4 line-clamp-2">{recipe.description || 'No description available'}</p>
                  <div className="flex items-center gap-2 text-xs text-[#16250F]/60 mb-4">
                    <Utensils className="h-3 w-3" />
                    {recipe.ingredients?.length || 0} ingredients
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-[#16250F]/20 hover:border-[#FF9500] hover:text-[#FF9500]"
                      onClick={() => handleViewRecipe(recipe.id)}
                    >
                      View Recipe
                    </Button>
                    
                    {/* Management menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="border-[#16250F]/20">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewRecipe(recipe.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Edit - coming soon!')}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Recipe
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Add to week - coming soon!')}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Add to This Week
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.share?.({ title: title, url: window.location.href }).catch(() => toast.success('Link copied!'))}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

