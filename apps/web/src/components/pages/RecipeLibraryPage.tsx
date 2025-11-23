import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Book, Search, Plus, Clock, Utensils, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RecipeImportCard } from '../RecipeImportCard'

interface Recipe {
  id: string
  name: string
  description: string
  cuisine: string
  cookTime: number
  ingredients: string[]
  instructions: string[]
  rating?: number
}

export function RecipeLibraryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRecipeImported = (recipe: any) => {
    // Add the imported recipe to the list
    const newRecipe = {
      id: Date.now().toString(),
      name: recipe.title || 'Untitled Recipe',
      description: recipe.description || '',
      cuisine: recipe.tags?.[0] || 'Other',
      cookTime: recipe.totalTime || recipe.cookTime || 0,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      rating: undefined
    }
    setRecipes([...recipes, newRecipe])
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#16250F] mb-2">Recipes</h1>
        <p className="text-lg text-[#16250F]/70 font-serif">
          Import recipes from any website or add your own
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
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="border border-[#16250F]/10 card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-[#16250F]">{recipe.name}</CardTitle>
                  {recipe.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{recipe.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-[#16250F]/30 text-xs">
                    {recipe.cuisine}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-[#16250F]/60">
                    <Clock className="h-3 w-3" />
                    {recipe.cookTime} min
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#16250F]/70 mb-4 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-2 text-xs text-[#16250F]/60 mb-4">
                  <Utensils className="h-3 w-3" />
                  {recipe.ingredients.length} ingredients
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#16250F]/20 hover:border-[#FF9500]"
                  onClick={() => {
                    // TODO: Show recipe details
                  }}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

