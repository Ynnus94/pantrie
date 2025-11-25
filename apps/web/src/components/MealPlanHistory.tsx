import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { GlassCard } from './ui/GlassCard'
import { CalendarExport } from './CalendarExport'
import { getMealPlans, deleteMealPlan, updateMealPlan, quickFixMealPlan } from '../lib/api'
import { Calendar, DollarSign, ChefHat, Eye, Trash2, Loader2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

interface SavedMealPlan {
  id: number
  week_starting: string
  meals: any[]
  grocery_list: any[]
  week_summary: any
  status: string
  created_at: string
}

export function MealPlanHistory() {
  const [mealPlans, setMealPlans] = useState<SavedMealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SavedMealPlan | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SavedMealPlan | null>(null)
  const [editRequest, setEditRequest] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    setLoading(true)
    try {
      const plans = await getMealPlans()
      setMealPlans(plans)
    } catch (error: any) {
      console.error('Failed to fetch meal plans:', error)
      toast.error('Failed to load meal plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      toast.loading('Deleting meal plan...', { id: 'delete' })
      await deleteMealPlan(id)
      await fetchMealPlans()
      toast.success('Meal plan deleted', { id: 'delete' })
    } catch (error: any) {
      console.error('Failed to delete meal plan:', error)
      toast.error(error.message || 'Failed to delete meal plan', { id: 'delete' })
    }
  }

  const handleEdit = async () => {
    if (!editingPlan || !editRequest.trim()) return
    
    setUpdating(true)
    toast.loading('Updating meal plan...', { id: 'edit' })
    try {
      // Convert saved plan format to meal plan format
      const mealPlanFormat = {
        weekStarting: editingPlan.week_starting,
        meals: editingPlan.meals,
        grocery_list: editingPlan.grocery_list,
        weekSummary: editingPlan.week_summary
      }
      
      // Use quick fix to update the meal plan
      const updatedPlan = await quickFixMealPlan(mealPlanFormat, editRequest)
      
      // Update in database
      await updateMealPlan(editingPlan.id, updatedPlan)
      
      await fetchMealPlans()
      setEditingPlan(null)
      setEditRequest('')
      toast.success('Meal plan updated successfully!', { id: 'edit' })
    } catch (error: any) {
      console.error('Failed to update meal plan:', error)
      toast.error(error.message || 'Failed to update meal plan', { id: 'edit' })
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDayName = (index: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[index]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} hover={false}>
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </GlassCard>
        ))}
      </div>
    )
  }

  if (mealPlans.length === 0) {
    return (
      <GlassCard hover={false}>
        <div className="py-8 text-center">
          <div className="p-4 bg-[var(--bg-glass-strong)] border-2 border-[var(--accent-primary)] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-[var(--accent-primary)]" />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No meal plans yet</h3>
          <p className="text-muted mb-4">Generate and save your first meal plan to see it here!</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {mealPlans.map((plan, index) => (
          <GlassCard 
            key={plan.id} 
            className="border-l-4 border-l-[var(--accent-primary)] animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-primary">
                    Week of {formatDate(plan.week_starting)}
                  </h3>
                  <Badge className="w-fit badge-success">
                    {plan.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted mb-3">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span>{plan.meals?.length || 0} meals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span>${plan.week_summary?.totalEstimatedCost?.toFixed(2) || '0.00'} CAD</span>
                  </div>
                  <div className="text-xs text-muted">
                    Saved {formatDate(plan.created_at)}
                  </div>
                </div>
                {plan.week_summary?.cuisines && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.week_summary.cuisines.slice(0, 3).map((cuisine: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(plan)
                    setShowDetails(true)
                  }}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Dialog open={editingPlan?.id === plan.id} onOpenChange={(open) => {
                  if (!open) {
                    setEditingPlan(null)
                    setEditRequest('')
                  } else {
                    setEditingPlan(plan)
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="glass"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] glass-card-static">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-primary">
                        <Edit2 className="h-5 w-5" />
                        Edit Meal Plan
                      </DialogTitle>
                      <DialogDescription>
                        Tell us what you'd like to change about this meal plan and we'll update it for you.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-request">What would you like to change?</Label>
                        <Textarea
                          id="edit-request"
                          value={editRequest}
                          onChange={(e) => setEditRequest(e.target.value)}
                          placeholder="e.g., Replace Tuesday's meal with something vegetarian, or Make Wednesday's meal take less than 20 minutes"
                          className="min-h-[120px] resize-none glass-input"
                        />
                        <p className="text-xs text-muted">
                          Be specific about which day and what changes you want
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="glass" 
                          onClick={() => {
                            setEditingPlan(null)
                            setEditRequest('')
                          }}
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleEdit} 
                          disabled={updating || !editRequest.trim()}
                        >
                          {updating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Meal Plan'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <CalendarExport mealPlan={{
                  weekStarting: plan.week_starting,
                  meals: plan.meals,
                  grocery_list: plan.grocery_list,
                  weekSummary: plan.week_summary
                }} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="glass"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card-static">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">Delete Meal Plan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the meal plan for the week of {formatDate(plan.week_starting)}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(plan.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Meal Plan Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card-static">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">
              Week of {selectedPlan && formatDate(selectedPlan.week_starting)}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.meals?.length || 0} meals • ${selectedPlan?.week_summary?.totalEstimatedCost?.toFixed(2) || '0.00'} CAD
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4 mt-4">
              {selectedPlan.meals?.map((meal: any, index: number) => (
                <GlassCard 
                  key={index} 
                  hover={false}
                  className={meal.isOfficeDayMeal ? 'border-[var(--info-border)] bg-[var(--info-bg)]' : ''}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg text-primary">
                      {getDayName(index)}: {meal.name}
                    </h4>
                    {meal.isOfficeDayMeal && (
                      <Badge className="bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]">Quick Meal</Badge>
                    )}
                    {meal.cuisine && (
                      <Badge variant="secondary">{meal.cuisine}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-secondary mb-3">{meal.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-primary mb-1">Ingredients:</h5>
                      <ul className="list-disc list-inside space-y-1 text-secondary">
                        {meal.ingredients?.map((ing: string, i: number) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-primary mb-1">👶 Toddler Modification:</h5>
                      <p className="text-secondary">{meal.toddlerModification}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
