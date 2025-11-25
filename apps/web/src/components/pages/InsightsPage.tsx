import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { getMealPlans, getFoodTries } from '../../lib/api'
import { TrendingUp, DollarSign, ChefHat, Heart, Calendar, Award, Target } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

export function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMealPlans: 0,
    totalSpent: 0,
    avgWeeklyCost: 0,
    totalMeals: 0,
    favoriteCuisines: [] as string[],
    lovedFoods: 0,
    triedFoods: 0
  })

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const [mealPlans, foodTries] = await Promise.all([
        getMealPlans(),
        getFoodTries()
      ])

      const totalSpent = mealPlans.reduce((sum: number, plan: any) => 
        sum + (plan.week_summary?.totalEstimatedCost || 0), 0
      )
      
      const allCuisines = mealPlans.flatMap((plan: any) => 
        plan.week_summary?.cuisines || []
      )
      const cuisineCounts: Record<string, number> = {}
      allCuisines.forEach((cuisine: string) => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
      })
      const favoriteCuisines = Object.entries(cuisineCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([cuisine]) => cuisine)

      const totalMeals = mealPlans.reduce((sum: number, plan: any) => 
        sum + (plan.meals?.length || 0), 0
      )

      const lovedFoods = foodTries.filter((f: any) => f.reaction === 'loved').length
      const triedFoods = foodTries.length

      setStats({
        totalMealPlans: mealPlans.length,
        totalSpent,
        avgWeeklyCost: mealPlans.length > 0 ? totalSpent / mealPlans.length : 0,
        totalMeals,
        favoriteCuisines,
        lovedFoods,
        triedFoods
      })
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Insights & Analytics</h1>
        <p className="text-primary/70">
          Track your meal planning habits and discover patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Total Meal Plans</p>
                <p className="text-2xl font-bold text-primary">{stats.totalMealPlans}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#FF9500]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Total Meals</p>
                <p className="text-2xl font-bold text-primary">{stats.totalMeals}</p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Avg Weekly Cost</p>
                <p className="text-2xl font-bold text-primary">${stats.avgWeeklyCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Foods Loved</p>
                <p className="text-2xl font-bold text-primary">{stats.lovedFoods}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600 fill-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Cuisines */}
        <Card className="border border-[#16250F]/10">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Award className="h-5 w-5" />
              Favorite Cuisines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.favoriteCuisines.length > 0 ? (
              <div className="space-y-3">
                {stats.favoriteCuisines.map((cuisine, index) => (
                  <div key={cuisine} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF9500]/20 flex items-center justify-center text-sm font-bold text-[#FF9500]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary">{cuisine}</p>
                    </div>
                    <Badge variant="outline" className="border-[#16250F]/30">
                      {stats.totalMealPlans > 0 ? Math.round((1 / stats.favoriteCuisines.length) * 100) : 0}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-primary/70 text-center py-8">No data yet. Generate some meal plans to see insights!</p>
            )}
          </CardContent>
        </Card>

        {/* Food Exploration */}
        <Card className="border border-[#16250F]/10">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Target className="h-5 w-5" />
              Food Exploration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary/70">Foods Tried</span>
                <span className="font-medium text-primary">{stats.triedFoods}</span>
              </div>
              <Progress value={stats.triedFoods > 0 ? (stats.lovedFoods / stats.triedFoods) * 100 : 0} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary/70">Foods Loved</span>
                <span className="font-medium text-primary">{stats.lovedFoods}</span>
              </div>
              <Progress value={stats.triedFoods > 0 ? (stats.lovedFoods / stats.triedFoods) * 100 : 0} />
            </div>
            {stats.triedFoods > 0 && (
              <div className="pt-4 border-t border-[#16250F]/10">
                <p className="text-sm text-primary/70">
                  Success Rate: <span className="font-bold text-[#FF9500]">
                    {Math.round((stats.lovedFoods / stats.triedFoods) * 100)}%
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Tracking */}
        <Card className="lg:col-span-2 border border-[#16250F]/10">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-primary/70 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-primary/60 mt-1">Across all meal plans</p>
              </div>
              <div>
                <p className="text-sm text-primary/70 mb-1">Average per Week</p>
                <p className="text-3xl font-bold text-primary">${stats.avgWeeklyCost.toFixed(2)}</p>
                <p className="text-xs text-primary/60 mt-1">CAD</p>
              </div>
              <div>
                <p className="text-sm text-primary/70 mb-1">Budget Status</p>
                <p className="text-3xl font-bold text-green-600">On Track</p>
                <p className="text-xs text-primary/60 mt-1">Within budget range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

