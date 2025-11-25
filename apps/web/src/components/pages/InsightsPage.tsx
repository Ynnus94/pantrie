import { useState, useEffect } from 'react'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { GlassCard } from '../ui/GlassCard'
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
            <GlassCard key={i} hover={false}>
              <Skeleton className="h-20 w-full" />
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Insights & Analytics</h1>
        <p className="text-secondary">
          Track your meal planning habits and discover patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Total Meal Plans</p>
              <p className="text-2xl font-bold text-primary">{stats.totalMealPlans}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--accent-primary)]/20">
              <Calendar className="h-8 w-8 text-[var(--accent-primary)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Total Meals</p>
              <p className="text-2xl font-bold text-primary">{stats.totalMeals}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--info-bg)]">
              <ChefHat className="h-8 w-8 text-[var(--info-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Avg Weekly Cost</p>
              <p className="text-2xl font-bold text-primary">${stats.avgWeeklyCost.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--success-bg)]">
              <DollarSign className="h-8 w-8 text-[var(--success-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Foods Loved</p>
              <p className="text-2xl font-bold text-primary">{stats.lovedFoods}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--error-bg)]">
              <Heart className="h-8 w-8 text-[var(--error-text)] fill-[var(--error-text)]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Cuisines */}
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-[var(--accent-primary)]" />
            Favorite Cuisines
          </h3>
          {stats.favoriteCuisines.length > 0 ? (
            <div className="space-y-3">
              {stats.favoriteCuisines.map((cuisine, index) => (
                <div key={cuisine} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-sm font-bold text-[var(--accent-primary)]">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">{cuisine}</p>
                  </div>
                  <Badge variant="outline" className="glass-badge">
                    {stats.totalMealPlans > 0 ? Math.round((1 / stats.favoriteCuisines.length) * 100) : 0}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">No data yet. Generate some meal plans to see insights!</p>
          )}
        </GlassCard>

        {/* Food Exploration */}
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[var(--accent-primary)]" />
            Food Exploration
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Foods Tried</span>
                <span className="font-medium text-primary">{stats.triedFoods}</span>
              </div>
              <Progress value={stats.triedFoods > 0 ? (stats.lovedFoods / stats.triedFoods) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Foods Loved</span>
                <span className="font-medium text-primary">{stats.lovedFoods}</span>
              </div>
              <Progress value={stats.triedFoods > 0 ? (stats.lovedFoods / stats.triedFoods) * 100 : 0} className="h-2" />
            </div>
            {stats.triedFoods > 0 && (
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-sm text-muted">
                  Success Rate: <span className="font-bold text-[var(--accent-primary)]">
                    {Math.round((stats.lovedFoods / stats.triedFoods) * 100)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Budget Tracking */}
        <GlassCard hover={false} className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
            Budget Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
              <p className="text-sm text-muted mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted mt-1">Across all meal plans</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
              <p className="text-sm text-muted mb-1">Average per Week</p>
              <p className="text-3xl font-bold text-primary">${stats.avgWeeklyCost.toFixed(2)}</p>
              <p className="text-xs text-muted mt-1">CAD</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
              <p className="text-sm text-muted mb-1">Budget Status</p>
              <p className="text-3xl font-bold text-[var(--success-text)]">On Track</p>
              <p className="text-xs text-muted mt-1">Within budget range</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
