import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { getFoodTries, addFoodTry } from '../lib/api'
import { Plus, Heart, Meh, X, Baby, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FoodTry {
  id: number
  food_item: string
  reaction: 'loved' | 'tried' | 'refused'
  meal_context: string
  tried_at: string
  notes?: string
}

export function ToddlerTracker() {
  const [foodTries, setFoodTries] = useState<FoodTry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchFoodTries()
  }, [])

  const fetchFoodTries = async () => {
    setFetching(true)
    try {
      const data = await getFoodTries()
      setFoodTries(data)
    } catch (error) {
      console.error('Failed to fetch food tries:', error)
      toast.error('Failed to load food history')
    } finally {
      setFetching(false)
    }
  }

  const handleAddFoodTry = async (foodTry: Omit<FoodTry, 'id' | 'tried_at'>) => {
    setLoading(true)
    toast.loading('Adding food adventure...', { id: 'add-food' })
    try {
      await addFoodTry(foodTry)
      await fetchFoodTries()
      setShowAddForm(false)
      toast.success('Food adventure added!', { id: 'add-food' })
    } catch (error: any) {
      console.error('Failed to add food try:', error)
      toast.error(error.message || 'Failed to add food try', { id: 'add-food' })
    } finally {
      setLoading(false)
    }
  }

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'loved': return <Heart className="h-5 w-5 text-green-600 fill-green-600" />
      case 'tried': return <Meh className="h-5 w-5 text-yellow-600" />
      case 'refused': return <X className="h-5 w-5 text-red-600" />
      default: return null
    }
  }

  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'loved': return 'bg-green-100 text-green-800 border-green-300'
      case 'tried': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'refused': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const lovedCount = foodTries.filter(t => t.reaction === 'loved').length
  const triedCount = foodTries.filter(t => t.reaction === 'tried').length
  const refusedCount = foodTries.filter(t => t.reaction === 'refused').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Card */}
      <Card className="border border-[#16250F]/10 shadow-2xl bg-gradient-to-br from-white via-[#F5F1E8] to-white overflow-hidden hover-lift animate-fade-in relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9500]/5 via-transparent to-[#16250F]/5 pointer-events-none" />
        <CardHeader className="relative p-6 sm:p-8 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16250F] flex items-center gap-3">
                <div className="p-2.5 bg-[#16250F] rounded-xl shadow-lg">
                  <Baby className="h-5 w-5 sm:h-6 sm:w-6 text-[#F5F1E8]" />
                </div>
                Little Foodie Journey
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-[#16250F]/70 max-w-2xl">
                Track your daughter's food exploration and build great eating habits
              </CardDescription>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-[#FF9500] hover:bg-[#FF8500] active:bg-[#FF7500] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Food Adventure
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-pink-600" />
                    Add New Food Adventure
                  </DialogTitle>
                  <DialogDescription>
                    Record what your little one tried and how they reacted
                  </DialogDescription>
                </DialogHeader>
                <AddFoodTryForm 
                  onAdd={handleAddFoodTry} 
                  onCancel={() => setShowAddForm(false)}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-[#16250F]/10 shadow-lg bg-white hover:shadow-xl card-hover animate-fade-in">
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#16250F]/70 mb-1">Foods Loved</p>
                <p className="text-3xl font-bold text-[#16250F]">{lovedCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Heart className="h-6 w-6 text-green-600 fill-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10 shadow-lg bg-white hover:shadow-xl card-hover animate-fade-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#16250F]/70 mb-1">Foods Tried</p>
                <p className="text-3xl font-bold text-[#16250F]">{triedCount}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Meh className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10 shadow-lg bg-white hover:shadow-xl card-hover animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#16250F]/70 mb-1">Foods Refused</p>
                <p className="text-3xl font-bold text-[#16250F]">{refusedCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10 shadow-lg bg-white hover:shadow-xl card-hover">
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Adventures</p>
                <p className="text-3xl font-bold text-blue-900">{foodTries.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food History */}
      <Card className="border border-[#16250F]/10 shadow-xl bg-white">
        <CardHeader className="p-6 sm:p-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-[#16250F]">Recent Food Adventures</CardTitle>
          <CardDescription className="text-base mt-2">
            Track your little one's culinary journey
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0">
          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : foodTries.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <Baby className="h-10 w-10 text-[#F5F1E8]" />
              </div>
              <h3 className="text-2xl font-bold text-[#16250F] mb-3">No food adventures yet</h3>
              <p className="text-[#16250F]/70 mb-6 max-w-md mx-auto">Start tracking your little one's food journey!</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#FF9500] hover:bg-[#FF8500] text-white font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Food Adventure
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {foodTries.slice(0, 10).map((foodTry) => (
                <Card 
                  key={foodTry.id} 
                  className="hover:shadow-md transition-all border-l-4 border-l-[#FF9500] bg-white card-hover"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getReactionIcon(foodTry.reaction)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{foodTry.food_item}</h4>
                          <Badge className={getReactionColor(foodTry.reaction)}>
                            {foodTry.reaction}
                          </Badge>
                        </div>
                        {foodTry.meal_context && (
                          <p className="text-sm text-gray-600 mb-2">{foodTry.meal_context}</p>
                        )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="whitespace-nowrap">{new Date(foodTry.tried_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AddFoodTryForm({ 
  onAdd, 
  onCancel,
  loading 
}: {
  onAdd: (foodTry: any) => void
  onCancel: () => void
  loading: boolean
}) {
  const [foodItem, setFoodItem] = useState('')
  const [reaction, setReaction] = useState<'loved' | 'tried' | 'refused'>('tried')
  const [mealContext, setMealContext] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ food_item: foodItem, reaction, meal_context: mealContext })
    setFoodItem('')
    setMealContext('')
    setReaction('tried')
  }

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'loved': return <Heart className="h-4 w-4 text-green-600 fill-green-600" />
      case 'tried': return <Meh className="h-4 w-4 text-yellow-600" />
      case 'refused': return <X className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="food-item">Food Item</Label>
        <Input
          id="food-item"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
          placeholder="e.g., Broccoli, Korean BBQ sauce, Quinoa"
          required
          className="h-11"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Reaction</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['loved', 'tried', 'refused'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReaction(r)}
              className={`px-4 py-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                reaction === r 
                  ? 'border-pink-500 bg-pink-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {getReactionIcon(r)}
              <span className="text-sm font-medium capitalize">{r}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meal-context">Meal Context (Optional)</Label>
        <Input
          id="meal-context"
          value={mealContext}
          onChange={(e) => setMealContext(e.target.value)}
          placeholder="e.g., Tuesday Korean Tacos, Breakfast smoothie"
          className="h-11"
        />
      </div>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-pink-600 to-rose-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Food Adventure
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
