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
  Sparkles, Loader2, Calendar, Users, DollarSign, Clock, 
  ChevronDown, Settings, Baby, Globe, Zap, Heart,
  Lightbulb, Package, Utensils
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
      const customPrompt = buildPrompt()
      console.log('Generated prompt:', customPrompt)
      
      setProgress('🤖 AI is crafting your meals...')
      const plan = await generateMealPlan(weekStart, customPrompt)
      
      setProgress('🖼️ Adding beautiful food photos...')
      const mealsWithImages = await fetchImagesForMeals(
        plan.meals.map((m: any) => ({ mealName: m.name, ...m }))
      )
      
      setProgress('💾 Saving your meal plan...')
      const contextMealPlan = {
        id: Date.now().toString(),
        weekStarting: weekStart,
        meals: plan.meals.slice(0, mealCount).map((meal: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          day: index.toString(),
          dayOfWeek: FULL_DAYS[index],
          name: meal.name,
          description: meal.description,
          cookTime: meal.cookTime,
          isOfficeDayMeal: quickMealDays.includes(FULL_DAYS[index]),
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
      
      setCurrentMealPlan(contextMealPlan)
      
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
      <DialogContent className="max-w-[850px] max-h-[600px] p-0 overflow-hidden">
        <div className="p-4 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <div className="p-1.5 bg-[var(--accent-primary)] rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Generate Meal Plan
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-[360px_1fr] gap-5 p-5 pt-3 h-[calc(600px-70px)]">
          {/* LEFT COLUMN - Controls */}
          <div className="space-y-3">
            {/* Week & Meal Count + Presets in one row */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-muted mb-0.5 block">Week</label>
                <Input 
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="glass-input h-8 text-xs"
                  disabled={generating}
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-muted mb-0.5 block">Meals</label>
                <select 
                  value={mealCount}
                  onChange={(e) => setMealCount(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-lg glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-xs"
                  disabled={generating}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
              </div>
            </div>

            {/* Quick Presets - Single row */}
            <div className="flex gap-1.5">
              {[
                { id: 'quick', icon: Zap, label: '⚡ Quick' },
                { id: 'budget', icon: DollarSign, label: '💰 Budget' },
                { id: 'healthy', icon: Heart, label: '🥗 Healthy' },
                { id: 'adventurous', icon: Sparkles, label: '✨ Adventure' },
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="flex-1 glass-button px-2 py-1.5 rounded-lg text-[10px] hover:bg-[var(--accent-primary)]/10 transition-colors"
                  disabled={generating}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Core Preferences - More compact */}
            <GlassCard hover={false} className="p-2.5 space-y-1.5">
              {/* Family & Budget on same line */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <Users className="h-3 w-3 text-[var(--accent-primary)]" />
                  {editingField === 'familySize' ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          onClick={() => { setFamilySize(n); setEditingField(null) }}
                          className={cn(
                            'w-5 h-5 rounded text-[10px] font-medium',
                            familySize === n ? 'bg-[var(--accent-primary)] text-white' : 'glass-button'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => setEditingField('familySize')} className="text-secondary hover:text-[var(--accent-primary)]" disabled={generating}>
                      {familySize} people
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <DollarSign className="h-3 w-3 text-[var(--accent-primary)]" />
                  {editingField === 'budget' ? (
                    <div className="flex items-center gap-1">
                      <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="glass-input w-14 h-5 text-[10px] px-1" />
                      <button onClick={() => setEditingField(null)} className="text-[10px] text-[var(--accent-primary)]">✓</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingField('budget')} className="text-secondary hover:text-[var(--accent-primary)]" disabled={generating}>
                      ${budget}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Meal Days - Compact */}
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-[var(--accent-primary)] flex-shrink-0" />
                <span className="text-[10px] text-muted">Quick:</span>
                <div className="flex gap-0.5">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleQuickMealDay(FULL_DAYS[i])}
                      className={cn(
                        'w-7 h-6 rounded text-[10px] font-medium transition-all',
                        quickMealDays.includes(FULL_DAYS[i])
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'glass-button hover:bg-[var(--accent-primary)]/10'
                      )}
                      disabled={generating}
                    >
                      {day.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Toggles - Ultra compact */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <div className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--bg-glass-light)]">
                <span className="flex items-center gap-1.5 text-secondary">
                  <Baby className="h-3 w-3 text-[var(--accent-primary)]" />
                  Toddler
                </span>
                <Switch checked={toddlerFriendly} onCheckedChange={setToddlerFriendly} disabled={generating} />
              </div>
              
              <div className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--bg-glass-light)]">
                <span className="flex items-center gap-1.5 text-secondary">
                  <Globe className="h-3 w-3 text-[var(--accent-primary)]" />
                  Diverse
                </span>
                <Switch checked={diverseCuisines} onCheckedChange={setDiverseCuisines} disabled={generating} />
              </div>
              
              <div className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--bg-glass-light)]">
                <span className="flex items-center gap-1.5 text-secondary">
                  <Sparkles className="h-3 w-3 text-[var(--accent-primary)]" />
                  Adventure
                </span>
                <div className="flex items-center gap-1">
                  {adventureMeals && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(n => (
                        <button
                          key={n}
                          onClick={() => setAdventureCount(n)}
                          className={cn(
                            'w-4 h-4 rounded text-[9px] font-medium',
                            adventureCount === n ? 'bg-[var(--accent-primary)] text-white' : 'glass-button'
                          )}
                          disabled={generating}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  <Switch checked={adventureMeals} onCheckedChange={setAdventureMeals} disabled={generating} />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[var(--bg-glass-light)]">
                <span className="flex items-center gap-1.5 text-secondary">
                  <Package className="h-3 w-3 text-[var(--accent-primary)]" />
                  Leftovers
                </span>
                <Switch checked={planLeftovers} onCheckedChange={setPlanLeftovers} disabled={generating} />
              </div>
            </div>

            {/* Advanced Options */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 w-full text-[10px] font-medium py-1 hover:text-[var(--accent-primary)] transition-colors text-muted">
                <Settings className="h-3 w-3" />
                Advanced
                <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", advancedOpen && "rotate-180")} />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-1.5 space-y-2 pt-1.5 border-t border-[var(--border-subtle)]">
                {/* Dietary & Cuisines side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-primary mb-1 block">Dietary</label>
                    <div className="flex flex-wrap gap-1">
                      {['Veg', 'Vegan', 'GF', 'DF', 'Keto'].map((diet, i) => {
                        const fullNames = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto']
                        return (
                          <button
                            key={diet}
                            onClick={() => toggleDietaryRestriction(fullNames[i])}
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[9px] transition-all',
                              dietaryRestrictions.includes(fullNames[i])
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'glass-button'
                            )}
                            disabled={generating}
                          >
                            {diet}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-primary mb-1 block">Cuisines</label>
                    <div className="flex flex-wrap gap-1">
                      {['🇮🇹', '🇯🇵', '🇲🇽', '🇬🇷', '🇮🇳', '🇹🇭'].map((flag, i) => {
                        const cuisines = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'Thai']
                        return (
                          <button
                            key={flag}
                            onClick={() => toggleCuisine(cuisines[i])}
                            title={cuisines[i]}
                            className={cn(
                              'w-6 h-6 rounded text-sm transition-all',
                              cuisinePreferences.includes(cuisines[i])
                                ? 'bg-[var(--accent-primary)]/20 ring-1 ring-[var(--accent-primary)]'
                                : 'glass-button'
                            )}
                            disabled={generating}
                          >
                            {flag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Exclude + Time + Level in one row */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-primary mb-0.5 block">Exclude</label>
                    <Input
                      placeholder="mushrooms, cilantro..."
                      value={excludeIngredients}
                      onChange={(e) => setExcludeIngredients(e.target.value)}
                      className="glass-input h-6 text-[10px] px-2"
                      disabled={generating}
                    />
                  </div>
                  <div className="w-16">
                    <label className="text-[10px] font-medium text-primary mb-0.5 block">Time</label>
                    <select 
                      value={maxCookTime}
                      onChange={(e) => setMaxCookTime(e.target.value)}
                      className="w-full h-6 px-1 rounded glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-[10px]"
                      disabled={generating}
                    >
                      <option value="30">30m</option>
                      <option value="45">45m</option>
                      <option value="60">1h</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] font-medium text-primary mb-0.5 block">Level</label>
                    <select 
                      value={complexityLevel}
                      onChange={(e) => setComplexityLevel(e.target.value)}
                      className="w-full h-6 px-1 rounded glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-[10px]"
                      disabled={generating}
                    >
                      <option value="Beginner">Easy</option>
                      <option value="Intermediate">Med</option>
                      <option value="Advanced">Hard</option>
                    </select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* RIGHT COLUMN - Preview & Actions */}
          <div className="flex flex-col h-full">
            {/* Live Preview - Compact */}
            <GlassCard hover={false} className="bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 p-3 mb-3">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-secondary leading-relaxed">
                  <strong>{mealCount} meals</strong> for <strong>{familySize}</strong>
                  {quickMealDays.length > 0 && <>, quick on <strong>{quickMealDays.map(d => d.charAt(0)).join('')}</strong></>}
                  {adventureMeals && adventureCount > 0 && <>, <strong>{adventureCount}× adventure</strong></>}
                  {`, ~`}<strong>${budget}</strong>
                  {toddlerFriendly && <>, 👶</>}
                </p>
              </div>
              
              {/* Visual breakdown - Smaller */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { icon: Utensils, value: mealCount, label: 'Meals' },
                  { icon: Clock, value: quickMealDays.length, label: 'Quick' },
                  { icon: DollarSign, value: `$${budget}`, label: 'Budget' },
                  { icon: Sparkles, value: adventureMeals ? adventureCount : 0, label: 'Adv' },
                ].map((stat, i) => (
                  <div key={i} className="glass-button p-1.5 rounded-lg text-center">
                    <stat.icon className="h-3 w-3 mx-auto mb-0.5 text-[var(--accent-primary)]" />
                    <div className="text-xs font-semibold text-primary">{stat.value}</div>
                    <div className="text-[9px] text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Special Requests */}
            <div className="flex-1 min-h-0">
              <label className="text-xs font-medium text-primary mb-1.5 block">
                Special Requests
              </label>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g., 'Tuesday vegetarian' • 'No seafood' • 'Use up chicken'"
                className="glass-input h-full min-h-[100px] resize-none text-xs"
                disabled={generating}
              />
            </div>

            {/* Progress indicator */}
            {generating && (
              <div className="mt-2 p-2 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 text-[var(--accent-primary)] animate-spin" />
                  <div>
                    <p className="text-xs font-medium text-primary">{progress}</p>
                    <p className="text-[10px] text-secondary">~20-30 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 mt-auto border-t border-[var(--border-subtle)]">
              <Button
                variant="glass"
                onClick={onClose}
                disabled={generating}
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                size="sm"
                className="flex-1"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
