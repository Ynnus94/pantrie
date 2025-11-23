import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { getMealPlans } from '../../lib/api'
import { ShoppingCart, DollarSign, CheckCircle2, Circle, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

function getCurrentWeekStart(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}

export function GroceryListsPage() {
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCurrentWeekPlan()
  }, [])

  const fetchCurrentWeekPlan = async () => {
    setLoading(true)
    try {
      const plans = await getMealPlans()
      const weekStart = getCurrentWeekStart()
      
      const plan = plans.find((p: any) => {
        const planDate = new Date(p.week_starting)
        const currentDate = new Date(weekStart)
        return planDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      })
      
      setCurrentPlan(plan || null)
    } catch (error: any) {
      console.error('Failed to fetch meal plan:', error)
      toast.error('Failed to load grocery list')
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (item: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(item)) {
      newChecked.delete(item)
    } else {
      newChecked.add(item)
    }
    setCheckedItems(newChecked)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Group grocery items by category
  const categorizeItems = (items: any[]) => {
    const categories: Record<string, any[]> = {
      'Protein': [],
      'Produce': [],
      'Dairy': [],
      'Pantry': [],
      'Other': []
    }

    items?.forEach((item: any) => {
      const itemName = (item.item || item).toLowerCase()
      if (itemName.includes('chicken') || itemName.includes('beef') || itemName.includes('pork') || 
          itemName.includes('salmon') || itemName.includes('fish') || itemName.includes('meat')) {
        categories['Protein'].push(item)
      } else if (itemName.includes('broccoli') || itemName.includes('pepper') || itemName.includes('onion') ||
                 itemName.includes('garlic') || itemName.includes('tomato') || itemName.includes('lettuce') ||
                 itemName.includes('carrot') || itemName.includes('vegetable') || itemName.includes('fruit')) {
        categories['Produce'].push(item)
      } else if (itemName.includes('cheese') || itemName.includes('milk') || itemName.includes('yogurt') ||
                 itemName.includes('butter') || itemName.includes('cream')) {
        categories['Dairy'].push(item)
      } else if (itemName.includes('rice') || itemName.includes('pasta') || itemName.includes('flour') ||
                 itemName.includes('oil') || itemName.includes('sauce') || itemName.includes('spice')) {
        categories['Pantry'].push(item)
      } else {
        categories['Other'].push(item)
      }
    })

    return Object.entries(categories).filter(([_, items]) => items.length > 0)
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentPlan || !currentPlan.grocery_list || currentPlan.grocery_list.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#16250F] mb-2">Grocery Lists</h1>
          <p className="text-[#16250F]/70">
            Week of {formatDate(getCurrentWeekStart())}
          </p>
        </div>
        
        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-[#F5F1E8]" />
            </div>
            <h3 className="text-2xl font-bold text-[#16250F] mb-3">No grocery list for this week</h3>
            <p className="text-[#16250F]/70 mb-6 max-w-md mx-auto">
              Generate a meal plan to create your grocery list!
            </p>
            <Button 
              onClick={() => window.location.hash = 'planning'}
              className="bg-[#FF9500] hover:bg-[#FF8500] text-white font-semibold"
            >
              Generate Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categorized = categorizeItems(currentPlan.grocery_list)
  const totalItems = currentPlan.grocery_list.length
  const checkedCount = checkedItems.size
  const totalCost = currentPlan.week_summary?.totalEstimatedCost || 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16250F] mb-2">Grocery List</h1>
          <p className="text-[#16250F]/70">
            Week of {formatDate(currentPlan.week_starting)}
          </p>
        </div>
        <Badge variant="outline" className="border-[#16250F]/30 text-lg px-4 py-2">
          {checkedCount} / {totalItems} items
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grocery Items */}
        <div className="lg:col-span-2 space-y-4">
          {categorized.map(([category, items]) => (
            <Card key={category} className="border border-[#16250F]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#16250F] flex items-center gap-2">
                  {category === 'Protein' && '🥩'}
                  {category === 'Produce' && '🥬'}
                  {category === 'Dairy' && '🥛'}
                  {category === 'Pantry' && '🥫'}
                  {category === 'Other' && '📦'}
                  {category} • {items.length} items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item: any, index: number) => {
                  const itemName = item.item || item
                  const isChecked = checkedItems.has(itemName)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 hover:bg-[#F5F1E8]/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => toggleItem(itemName)}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-[#16250F]/30" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${isChecked ? 'line-through text-[#16250F]/50' : 'text-[#16250F]'}`}>
                          {itemName}
                        </p>
                        {item.quantity && (
                          <p className="text-xs text-[#16250F]/60">{item.quantity}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Sidebar */}
        <Card className="border border-[#16250F]/10 h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="text-[#16250F] flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#16250F]/70 mb-1">Items</p>
              <p className="text-2xl font-bold text-[#16250F]">{totalItems} total</p>
              <p className="text-sm text-green-600 mt-1">{checkedCount} checked</p>
            </div>
            <div>
              <p className="text-sm text-[#16250F]/70 mb-1">Estimated Total</p>
              <p className="text-2xl font-bold text-[#16250F]">${totalCost.toFixed(2)}</p>
              <p className="text-xs text-[#16250F]/60">CAD</p>
            </div>
            <div className="pt-4 border-t border-[#16250F]/10">
              <p className="text-sm text-[#16250F]/70 mb-2">Progress</p>
              <div className="w-full bg-[#16250F]/10 rounded-full h-2">
                <div 
                  className="bg-[#FF9500] h-2 rounded-full transition-all"
                  style={{ width: `${(checkedCount / totalItems) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#16250F]/60 mt-1">
                {Math.round((checkedCount / totalItems) * 100)}% complete
              </p>
            </div>
            <Button 
              className="w-full bg-[#FF9500] hover:bg-[#FF8500] text-white font-semibold"
              onClick={() => {
                // Mark all as checked
                const allItems = currentPlan.grocery_list.map((item: any) => item.item || item)
                setCheckedItems(new Set(allItems))
              }}
            >
              Check All Items
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

