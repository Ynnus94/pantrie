import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { GlassCard } from './ui/GlassCard'
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
      case 'loved': return <Heart className="h-5 w-5 text-[var(--success-text)] fill-[var(--success-text)]" />
      case 'tried': return <Meh className="h-5 w-5 text-[var(--warning-text)]" />
      case 'refused': return <X className="h-5 w-5 text-[var(--error-text)]" />
      default: return null
    }
  }

  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'loved': return 'glass-badge-success'
      case 'tried': return 'glass-badge-warning'
      case 'refused': return 'bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]'
      default: return 'glass-badge'
    }
  }

  const lovedCount = foodTries.filter(t => t.reaction === 'loved').length
  const triedCount = foodTries.filter(t => t.reaction === 'tried').length
  const refusedCount = foodTries.filter(t => t.reaction === 'refused').length

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <GlassCard hover={false} className="week-summary-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3">
              <div className="p-2.5 bg-[var(--accent-primary)] rounded-xl">
                <Baby className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Little Foodie Journey
            </h2>
            <p className="text-sm sm:text-base text-secondary max-w-2xl">
              Track your daughter's food exploration and build great eating habits
            </p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Plus className="h-5 w-5" />
                Add Food Adventure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card-strong">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary">
                  <Plus className="h-5 w-5 text-[var(--accent-primary)]" />
                  Add New Food Adventure
                </DialogTitle>
                <DialogDescription className="text-muted">
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
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Foods Loved</p>
              <p className="text-3xl font-bold text-primary">{lovedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--success-bg)]">
              <Heart className="h-6 w-6 text-[var(--success-text)] fill-[var(--success-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Foods Tried</p>
              <p className="text-3xl font-bold text-primary">{triedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--warning-bg)]">
              <Meh className="h-6 w-6 text-[var(--warning-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Foods Refused</p>
              <p className="text-3xl font-bold text-primary">{refusedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--error-bg)]">
              <X className="h-6 w-6 text-[var(--error-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Total Adventures</p>
              <p className="text-3xl font-bold text-primary">{foodTries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--info-bg)]">
              <TrendingUp className="h-6 w-6 text-[var(--info-text)]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Food History */}
      <GlassCard hover={false}>
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">Recent Food Adventures</h3>
        <p className="text-sm text-muted mb-6">
          Track your little one's culinary journey
        </p>
        
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : foodTries.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-[var(--bg-glass-strong)] border-2 border-[var(--accent-primary)] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Baby className="h-10 w-10 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">No food adventures yet</h3>
            <p className="text-muted mb-6 max-w-md mx-auto">Start tracking your little one's food journey!</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Food Adventure
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {foodTries.slice(0, 10).map((foodTry) => (
              <div 
                key={foodTry.id} 
                className="p-4 rounded-xl bg-[var(--bg-glass-light)] border-l-4 border-l-[var(--accent-primary)] hover:bg-[var(--bg-glass)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[var(--bg-glass)] rounded-lg">
                    {getReactionIcon(foodTry.reaction)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-primary text-lg">{foodTry.food_item}</h4>
                      <Badge className={getReactionColor(foodTry.reaction)}>
                        {foodTry.reaction}
                      </Badge>
                    </div>
                    {foodTry.meal_context && (
                      <p className="text-sm text-secondary mb-2">{foodTry.meal_context}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="whitespace-nowrap">{new Date(foodTry.tried_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
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
      case 'loved': return <Heart className="h-4 w-4 text-[var(--success-text)] fill-[var(--success-text)]" />
      case 'tried': return <Meh className="h-4 w-4 text-[var(--warning-text)]" />
      case 'refused': return <X className="h-4 w-4 text-[var(--error-text)]" />
      default: return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="food-item" className="text-secondary">Food Item</Label>
        <Input
          id="food-item"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
          placeholder="e.g., Broccoli, Korean BBQ sauce, Quinoa"
          required
          className="glass-input h-11"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-secondary">Reaction</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['loved', 'tried', 'refused'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReaction(r)}
              className={`px-4 py-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                reaction === r 
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' 
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)] bg-[var(--bg-glass-light)]'
              }`}
            >
              {getReactionIcon(r)}
              <span className="text-sm font-medium capitalize text-primary">{r}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meal-context" className="text-secondary">Meal Context (Optional)</Label>
        <Input
          id="meal-context"
          value={mealContext}
          onChange={(e) => setMealContext(e.target.value)}
          placeholder="e.g., Tuesday Korean Tacos, Breakfast smoothie"
          className="glass-input h-11"
        />
      </div>

      <Separator className="bg-[var(--border-subtle)]" />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="glass" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Food Adventure
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
