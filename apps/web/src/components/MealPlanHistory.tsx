import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
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
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (mealPlans.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-[#F5F1E8]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
          <p className="text-gray-600 mb-4">Generate and save your first meal plan to see it here!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#16250F]/10 shadow-2xl bg-gradient-to-br from-white via-[#F5F1E8]/50 to-white animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9500] via-[#16250F] to-[#FF9500]" />
        <CardHeader className="p-6 sm:p-8 relative z-10">
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-[#16250F]">
            <div className="p-2 bg-[#16250F] rounded-lg">
              <Calendar className="h-6 w-6 text-[#F5F1E8]" />
            </div>
            Meal Plan History
          </CardTitle>
          <CardDescription className="text-base mt-2">
            View and manage your saved meal plans
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {mealPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className="card-hover border-l-4 border-l-[#FF9500] bg-gradient-to-br from-white to-[#F5F1E8]/20 animate-fade-in relative overflow-hidden"
            style={{ animationDelay: `${plan.id * 50}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF9500]/5 to-transparent rounded-full blur-xl pointer-events-none" />
            <CardContent className="pt-6 p-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Week of {formatDate(plan.week_starting)}
                    </h3>
                    <Badge variant="outline" className="border-green-300 text-green-700 w-fit">
                      {plan.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-indigo-600" />
                      <span>{plan.meals?.length || 0} meals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-indigo-600" />
                      <span>${plan.week_summary?.totalEstimatedCost?.toFixed(2) || '0.00'} CAD</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Saved {formatDate(plan.created_at)}
                    </div>
                  </div>
                  {plan.week_summary?.cuisines && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {plan.week_summary.cuisines.slice(0, 3).map((cuisine: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlan(plan)
                      setShowDetails(true)
                    }}
                    className="flex items-center gap-2 hover:bg-[#F5F1E8] hover:border-[#FF9500] hover:scale-105 active:scale-100 transition-all"
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
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-[#F5F1E8] hover:border-[#FF9500] hover:scale-105 active:scale-100 transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Edit2 className="h-5 w-5 text-[#16250F]" />
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
                            className="min-h-[120px] resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            Be specific about which day and what changes you want
                          </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
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
                            className="bg-[#FF9500] hover:bg-[#FF8500] active:bg-[#FF7500] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all font-semibold"
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
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Meal Plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the meal plan for the week of {formatDate(plan.week_starting)}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(plan.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meal Plan Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Week of {selectedPlan && formatDate(selectedPlan.week_starting)}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan?.meals?.length || 0} meals • ${selectedPlan?.week_summary?.totalEstimatedCost?.toFixed(2) || '0.00'} CAD
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4 mt-4">
              {selectedPlan.meals?.map((meal: any, index: number) => (
                <Card key={index} className={meal.isOfficeDayMeal ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">
                        {getDayName(index)}: {meal.name}
                      </h4>
                      {meal.isOfficeDayMeal && (
                        <Badge className="bg-blue-100 text-blue-700">Quick Meal</Badge>
                      )}
                      {meal.cuisine && (
                        <Badge variant="outline">{meal.cuisine}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{meal.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Ingredients:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {meal.ingredients?.map((ing: string, i: number) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">👶 Toddler Modification:</h5>
                        <p className="text-gray-700">{meal.toddlerModification}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

