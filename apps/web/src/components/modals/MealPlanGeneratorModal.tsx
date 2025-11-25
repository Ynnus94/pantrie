import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { GlassCard } from '../ui/GlassCard'
import { Switch } from '../ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { generateMealPlan } from '../../lib/api'
import { saveMealPlanToDatabase } from '../../lib/mealPlansApi'
import { generateGroceryListFromMealPlan } from '../../lib/groceryListApi'
import { fetchImagesForMeals } from '../../services/imageService'
import { useMealPlan } from '../../context/MealPlanContext'
import { 
  Sparkles, Loader2, Calendar, Users, DollarSign, Utensils, Clock, 
  ChevronDown, Settings, Edit2, Baby, Globe, Zap, Heart, X,
  Lightbulb, Package, Check
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface MealPlanGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Helper function to get next Monday
function getNextMonday(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export function MealPlanGeneratorModal({ isOpen, onClose, onSuccess }: MealPlanGeneratorModalProps) {
  // UI State
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  
  // Basic settings
  const [weekStart, setWeekStart] = useState(getNextMonday())
  const [mealCount, setMealCount] = useState(7)
  
  // Family preferences
  const [familySize, setFamilySize] = useState(3)
  const [budget, setBudget] = useState(200)
  const [quickMealDays, setQuickMealDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday'])
  
  // Toggle preferences
  const [toddlerFriendly, setToddlerFriendly] = useState(true)
  const [adventureMeals, setAdventureMeals] = useState(true)
  const [adventureCount, setAdventureCount] = useState(1)
  const [diverseCuisines, setDiverseCuisines] = useState(true)
  const [planLeftovers, setPlanLeftovers] = useState(false)
  
  // Advanced options
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([])
  const [excludeIngredients, setExcludeIngredients] = useState('')
  const [maxCookTime, setMaxCookTime] = useState('any')
  const [complexityLevel, setComplexityLevel] = useState('Intermediate')
  
  // Special requests
  const [specialRequests, setSpecialRequests] = useState('')
  
  const { setCurrentMealPlan } = useMealPlan()

  // Toggle functions
  const toggleQuickMealDay = (day: string) => {
    setQuickMealDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction) ? prev.filter(r => r !== restriction) : [...prev, restriction]
    )
  }

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    )
  }

  // Quick presets
  const applyPreset = (type: string) => {
    switch(type) {
      case 'quick':
        setMaxCookTime('30')
        setComplexityLevel('Beginner')
        setAdventureCount(0)
        setAdventureMeals(false)
        setQuickMealDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
        toast.success('Quick & Easy preset applied')
        break
      case 'budget':
        setBudget(150)
        setComplexityLevel('Beginner')
        setPlanLeftovers(true)
        setAdventureCount(0)
        toast.success('Budget-Friendly preset applied')
        break
      case 'healthy':
        setDiverseCuisines(true)
        setCuisinePreferences(['Mediterranean', 'Asian'])
        setMaxCookTime('45')
        toast.success('Healthy preset applied')
        break
      case 'adventurous':
        setAdventureMeals(true)
        setAdventureCount(3)
        setComplexityLevel('Advanced')
        setDiverseCuisines(true)
        toast.success('Adventurous preset applied')
        break
    }
  }

  // Build AI prompt
  const buildPrompt = () => {
    let prompt = `Generate ${mealCount} dinner recipes for a family of ${familySize} people.

REQUIREMENTS:
- Budget: approximately $${budget} for the week
- Meal types: ${mealCount} dinners for week starting ${weekStart}
`

    if (quickMealDays.length > 0) {
      prompt += `- Quick meals (≤30 min) needed on: ${quickMealDays.join(', ')}
`
    }

    if (toddlerFriendly) {
      prompt += `- Must be toddler-friendly with adaptations for a 2-year-old
`
    }

    if (adventureMeals && adventureCount > 0) {
      prompt += `- Include ${adventureCount} "adventure" ${adventureCount === 1 ? 'meal' : 'meals'} (new cuisines or unusual ingredients)
`
    }

    if (dietaryRestrictions.length > 0) {
      prompt += `- Dietary restrictions: ${dietaryRestrictions.join(', ')}
`
    }

    if (cuisinePreferences.length > 0) {
      prompt += `- Preferred cuisines: ${cuisinePreferences.join(', ')}
`
    } else if (diverseCuisines) {
      prompt += `- Use diverse cuisines from around the world
`
    }

    if (excludeIngredients) {
      prompt += `- EXCLUDE these ingredients: ${excludeIngredients}
`
    }

    if (maxCookTime !== 'any') {
      prompt += `- Maximum cooking time: ${maxCookTime} minutes
`
    }

    if (complexityLevel !== 'Intermediate') {
      prompt += `- Complexity level: ${complexityLevel}
`
    }

    if (planLeftovers) {
      prompt += `- Plan for leftovers - generate portions for lunch the next day
`
    }

    if (specialRequests) {
      prompt += `
SPECIAL REQUESTS:
${specialRequests}
`
    }

    return prompt
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress('Creating your personalized meal plan...')
    
    try {
      // Build custom prompt
      const customPrompt = buildPrompt()
      console.log('Generated prompt:', customPrompt)
      
      // Step 1: Generate meal plan with AI
      setProgress('🤖 AI is crafting your meals...')
      const plan = await generateMealPlan(weekStart, customPrompt)
      
      // Step 2: Fetch images
      setProgress('🖼️ Adding beautiful food photos...')
      const mealsWithImages = await fetchImagesForMeals(
        plan.meals.map((m: any) => ({ mealName: m.name, ...m }))
      )
      
      // Step 3: Prepare the final plan
      setProgress('💾 Saving your meal plan...')
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const contextMealPlan = {
        id: Date.now().toString(),
        weekStarting: weekStart,
        meals: plan.meals.slice(0, mealCount).map((meal: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          day: index.toString(),
          dayOfWeek: dayNames[index],
          name: meal.name,
          description: meal.description,
          cookTime: meal.cookTime,
          isOfficeDayMeal: quickMealDays.includes(dayNames[index]),
          isAdventureMeal: meal.cuisine === 'Adventure' || false,
          ingredients: meal.ingredients,
          instructions: meal.instructions || [],
          toddlerModification: toddlerFriendly ? meal.toddlerModification : null,
          cuisine: meal.cuisine,
          difficulty: complexityLevel.toLowerCase(),
          estimatedCost: meal.estimatedCost,
          imageUrl: mealsWithImages[index]?.imageUrl || undefined
        })),
        grocery_list: plan.grocery_list,
        weekSummary: plan.weekSummary,
        status: 'approved',
        generatedAt: new Date().toISOString()
      }
      
      // Save to context for immediate display
      setCurrentMealPlan(contextMealPlan)
      
      // Save to database
      try {
        await saveMealPlanToDatabase({
          weekStarting: contextMealPlan.weekStarting,
          meals: contextMealPlan.meals,
          grocery_list: contextMealPlan.grocery_list,
          weekSummary: contextMealPlan.weekSummary
        })
      } catch (dbError) {
        console.error('Failed to save to database:', dbError)
      }
      
      // Generate grocery list from meal plan
      setProgress('🛒 Creating your grocery list...')
      try {
        await generateGroceryListFromMealPlan(contextMealPlan, 1)
      } catch (groceryError) {
        console.error('Failed to generate grocery list:', groceryError)
      }
      
      toast.success('Meal plan generated!', {
        description: `${mealCount} meals + grocery list ready for your week`
      })
      
      onClose()
      onSuccess?.()
      
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error)
      toast.error('Failed to generate meal plan', {
        description: error.message || 'Please try again'
      })
    } finally {
      setGenerating(false)
      setProgress('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-[var(--accent-primary)] rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Generate Weekly Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Week & Meal Count Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Week Starting</label>
              <Input 
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="glass-input"
                disabled={generating}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Planning for</label>
              <select 
                value={mealCount}
                onChange={(e) => setMealCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)]"
                disabled={generating}
              >
                <option value={3}>3 dinners (try it)</option>
                <option value={5}>5 dinners (weekdays)</option>
                <option value={7}>7 dinners (full week)</option>
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Quick Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => applyPreset('quick')}
                className="glass-button px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)]/10 transition-colors"
                disabled={generating}
              >
                <Zap className="h-4 w-4 text-[var(--accent-primary)]" />
                Quick & Easy
              </button>
              <button
                onClick={() => applyPreset('budget')}
                className="glass-button px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)]/10 transition-colors"
                disabled={generating}
              >
                <DollarSign className="h-4 w-4 text-[var(--accent-primary)]" />
                Budget
              </button>
              <button
                onClick={() => applyPreset('healthy')}
                className="glass-button px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)]/10 transition-colors"
                disabled={generating}
              >
                <Heart className="h-4 w-4 text-[var(--accent-primary)]" />
                Healthy
              </button>
              <button
                onClick={() => applyPreset('adventurous')}
                className="glass-button px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)]/10 transition-colors"
                disabled={generating}
              >
                <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                Adventurous
              </button>
            </div>
          </div>

          {/* Quick Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-[var(--accent-primary)]" />
              Preferences
            </h3>
            
            <GlassCard hover={false} className="space-y-1">
              {/* Family Size */}
              <button 
                onClick={() => setEditingField(editingField === 'familySize' ? null : 'familySize')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-glass-light)] transition-colors text-left"
                disabled={generating}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">{familySize} family members</span>
                </div>
                <Edit2 className="h-4 w-4 text-muted" />
              </button>
              
              {editingField === 'familySize' && (
                <div className="mx-3 mb-2 p-3 rounded-lg bg-[var(--bg-glass-light)] border border-[var(--border-subtle)]">
                  <label className="text-sm font-medium text-primary mb-2 block">Number of family members</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => { setFamilySize(n); setEditingField(null) }}
                        className={cn(
                          'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                          familySize === n
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'glass-button hover:bg-[var(--accent-primary)]/10'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget */}
              <button 
                onClick={() => setEditingField(editingField === 'budget' ? null : 'budget')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-glass-light)] transition-colors text-left"
                disabled={generating}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">~${budget} weekly budget</span>
                </div>
                <Edit2 className="h-4 w-4 text-muted" />
              </button>
              
              {editingField === 'budget' && (
                <div className="mx-3 mb-2 p-3 rounded-lg bg-[var(--bg-glass-light)] border border-[var(--border-subtle)]">
                  <label className="text-sm font-medium text-primary mb-2 block">Weekly Budget ($)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="glass-input flex-1"
                      placeholder="200"
                    />
                    <Button size="sm" onClick={() => setEditingField(null)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Meal Days */}
              <button 
                onClick={() => setEditingField(editingField === 'quickMealDays' ? null : 'quickMealDays')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-glass-light)] transition-colors text-left"
                disabled={generating}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">
                    Quick meals: {quickMealDays.length > 0 ? quickMealDays.map(d => d.slice(0, 3)).join(', ') : 'None'}
                  </span>
                </div>
                <Edit2 className="h-4 w-4 text-muted" />
              </button>
              
              {editingField === 'quickMealDays' && (
                <div className="mx-3 mb-2 p-3 rounded-lg bg-[var(--bg-glass-light)] border border-[var(--border-subtle)]">
                  <label className="text-sm font-medium text-primary mb-2 block">Days needing quick meals (≤30 min)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        key={day}
                        onClick={() => toggleQuickMealDay(day)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-all',
                          quickMealDays.includes(day)
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'glass-button hover:bg-[var(--accent-primary)]/10'
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => setEditingField(null)}>
                    Done
                  </Button>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-[var(--border-subtle)] mx-3" />

              {/* Toggle: Toddler Friendly */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Baby className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">Toddler-friendly options</span>
                </div>
                <Switch checked={toddlerFriendly} onCheckedChange={setToddlerFriendly} disabled={generating} />
              </div>

              {/* Toggle: Adventure Meals */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">Include adventure meals</span>
                </div>
                <Switch checked={adventureMeals} onCheckedChange={setAdventureMeals} disabled={generating} />
              </div>
              
              {adventureMeals && (
                <div className="ml-10 mr-3 mb-2 flex items-center gap-2">
                  <span className="text-sm text-muted">How many:</span>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setAdventureCount(n)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                        adventureCount === n
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'glass-button hover:bg-[var(--accent-primary)]/10'
                      )}
                      disabled={generating}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Toggle: Diverse Cuisines */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span className="text-secondary">Diverse cuisines</span>
                </div>
                <Switch checked={diverseCuisines} onCheckedChange={setDiverseCuisines} disabled={generating} />
              </div>

              {/* Toggle: Plan Leftovers */}
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-[var(--accent-primary)]" />
                  <div>
                    <span className="text-secondary">Plan for leftovers</span>
                    <p className="text-xs text-muted">Larger portions for next-day lunch</p>
                  </div>
                </div>
                <Switch checked={planLeftovers} onCheckedChange={setPlanLeftovers} disabled={generating} />
              </div>
            </GlassCard>
          </div>

          {/* Advanced Options */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm font-semibold py-2 hover:text-[var(--accent-primary)] transition-colors text-primary">
              <Settings className="h-4 w-4" />
              <span>Advanced Options</span>
              <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", advancedOpen && "rotate-180")} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-4 pt-3 border-t border-[var(--border-subtle)]">
              {/* Dietary Restrictions */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Keto', 'Low-carb'].map(diet => (
                    <button
                      key={diet}
                      onClick={() => toggleDietaryRestriction(diet)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-all',
                        dietaryRestrictions.includes(diet)
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'glass-button hover:bg-[var(--accent-primary)]/10'
                      )}
                      disabled={generating}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Preferred Cuisines</label>
                <div className="flex flex-wrap gap-2">
                  {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian', 'Thai', 'Japanese', 'Korean', 'Middle Eastern'].map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm transition-all',
                        cuisinePreferences.includes(cuisine)
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'glass-button hover:bg-[var(--accent-primary)]/10'
                      )}
                      disabled={generating}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mt-1">Leave empty for diverse selection</p>
              </div>

              {/* Exclude Ingredients */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Exclude Ingredients</label>
                <Input
                  placeholder="e.g., mushrooms, cilantro, shellfish"
                  value={excludeIngredients}
                  onChange={(e) => setExcludeIngredients(e.target.value)}
                  className="glass-input"
                  disabled={generating}
                />
                <p className="text-xs text-muted mt-1">Separate with commas</p>
              </div>

              {/* Max Cooking Time */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Maximum Cooking Time</label>
                <select 
                  value={maxCookTime}
                  onChange={(e) => setMaxCookTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)]"
                  disabled={generating}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="any">Any time</option>
                </select>
              </div>

              {/* Complexity Level */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Complexity Level</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setComplexityLevel(level)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm transition-all',
                        complexityLevel === level
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'glass-button hover:bg-[var(--accent-primary)]/10'
                      )}
                      disabled={generating}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Summary Preview */}
          <GlassCard hover={false} className="bg-[var(--accent-primary)]/5 border-2 border-[var(--accent-primary)]/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-primary mb-1">AI will generate:</p>
                <p className="text-secondary leading-relaxed">
                  <strong>{mealCount} meals</strong> for <strong>{familySize} people</strong>
                  {quickMealDays.length > 0 && (
                    <>, with quick options on <strong>{quickMealDays.map(d => d.slice(0, 3)).join(', ')}</strong></>
                  )}
                  {adventureMeals && adventureCount > 0 && (
                    <>, including <strong>{adventureCount} adventure {adventureCount === 1 ? 'meal' : 'meals'}</strong></>
                  )}
                  {`, staying around `}<strong>${budget}</strong>
                  {dietaryRestrictions.length > 0 && (
                    <>, <strong>{dietaryRestrictions.join(' & ')}</strong></>
                  )}
                  {excludeIngredients && (
                    <>, avoiding <strong>{excludeIngredients}</strong></>
                  )}
                  {toddlerFriendly && <>, <strong>toddler-friendly</strong></>}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Special Requests */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              Special Requests (Optional)
            </label>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g., 'Make Tuesday vegetarian' or 'Include a slow cooker meal' or 'Use up the chicken in my fridge'"
              className="glass-input min-h-[80px] resize-none"
              disabled={generating}
            />
          </div>

          {/* Progress indicator */}
          {generating && (
            <GlassCard hover={false} className="bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-[var(--accent-primary)] animate-spin" />
                <div>
                  <p className="font-medium text-primary">{progress}</p>
                  <p className="text-sm text-secondary">This usually takes 20-30 seconds</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="glass"
              onClick={onClose}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="min-w-[160px]"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
