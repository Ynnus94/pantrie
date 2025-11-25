import { useState } from 'react'
import { Button } from '../ui/button'
import { GlassCard } from '../ui/GlassCard'
import { ServingScaler, scaleIngredient } from './ServingScaler'
import { Plus, ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'
import { addGroceryItem } from '../../lib/groceryListApi'

interface InteractiveIngredientsProps {
  ingredients: string[]
  baseServings: number
  recipeTitle: string
}

export function InteractiveIngredients({ 
  ingredients, 
  baseServings,
  recipeTitle 
}: InteractiveIngredientsProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [servings, setServings] = useState(baseServings || 4)
  const [adding, setAdding] = useState(false)

  const scaleFactor = servings / (baseServings || 4)

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const checkAll = () => {
    setCheckedIngredients(new Set(ingredients.map((_, i) => i)))
  }

  const uncheckAll = () => {
    setCheckedIngredients(new Set())
  }

  const handleAddToGroceryList = async () => {
    // Only add unchecked ingredients
    const ingredientsToAdd = ingredients.filter((_, index) => 
      !checkedIngredients.has(index)
    )

    if (ingredientsToAdd.length === 0) {
      toast.info('All ingredients are already checked!')
      return
    }

    setAdding(true)
    try {
      // Add each ingredient to the grocery list
      for (const ingredient of ingredientsToAdd) {
        const scaledIngredient = scaleIngredient(ingredient, scaleFactor)
        await addGroceryItem({
          family_id: 1,
          item_name: scaledIngredient,
          category: categorizeIngredient(ingredient),
          is_checked: false,
          source_type: 'recipe',
          notes: `From: ${recipeTitle}`
        })
      }

      toast.success(`Added ${ingredientsToAdd.length} ingredients to grocery list!`, {
        description: `From "${recipeTitle}"`
      })

      // Mark added items as checked
      setCheckedIngredients(new Set(ingredients.map((_, i) => i)))
    } catch (error) {
      console.error('Failed to add ingredients:', error)
      toast.error('Failed to add ingredients to grocery list')
    } finally {
      setAdding(false)
    }
  }

  const uncheckedCount = ingredients.length - checkedIngredients.size

  return (
    <GlassCard hover={false}>
      {/* Header with serving scaler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-primary">
          Ingredients
          <span className="text-sm font-normal text-muted ml-2">
            ({ingredients.length} items)
          </span>
        </h3>
        <ServingScaler
          baseServings={baseServings || 4}
          currentServings={servings}
          onServingsChange={setServings}
        />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={uncheckAll}
          className="text-xs text-muted hover:text-primary transition-colors"
        >
          Uncheck all
        </button>
        <span className="text-muted">•</span>
        <button
          onClick={checkAll}
          className="text-xs text-muted hover:text-primary transition-colors"
        >
          Check all
        </button>
      </div>

      {/* Ingredients list */}
      <div className="space-y-1 mb-6">
        {ingredients.map((ingredient, index) => {
          const scaledIngredient = scaleIngredient(ingredient, scaleFactor)
          const isChecked = checkedIngredients.has(index)
          
          return (
            <label 
              key={index}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-glass-light)] cursor-pointer transition-colors group"
            >
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleIngredient(index)}
                  className="peer sr-only"
                />
                <div className={`
                  w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                  ${isChecked 
                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' 
                    : 'border-[var(--border-medium)] group-hover:border-[var(--accent-primary)]'
                  }
                `}>
                  {isChecked && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              <span className={`flex-1 text-sm transition-all ${
                isChecked 
                  ? 'line-through text-muted' 
                  : 'text-primary'
              }`}>
                {scaledIngredient}
              </span>
            </label>
          )
        })}
      </div>

      {/* Add to grocery list button */}
      <Button 
        onClick={handleAddToGroceryList}
        disabled={adding || uncheckedCount === 0}
        className="w-full gap-2"
      >
        {adding ? (
          <>Adding...</>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add {uncheckedCount > 0 ? `${uncheckedCount} Items` : 'All Items'} to Grocery List
          </>
        )}
      </Button>
    </GlassCard>
  )
}

// Simple ingredient categorization
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase()
  
  const categories: Record<string, string[]> = {
    'Produce': ['onion', 'garlic', 'tomato', 'lettuce', 'carrot', 'celery', 'pepper', 'potato', 'mushroom', 'broccoli', 'spinach', 'herb', 'cilantro', 'parsley', 'basil', 'lemon', 'lime', 'ginger', 'scallion', 'green onion'],
    'Meat': ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'ground'],
    'Dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'sour cream'],
    'Pantry': ['oil', 'vinegar', 'soy sauce', 'flour', 'sugar', 'salt', 'pepper', 'spice', 'rice', 'pasta', 'noodle', 'sauce', 'stock', 'broth', 'honey', 'maple'],
    'Frozen': ['frozen'],
    'Bakery': ['bread', 'tortilla', 'bun', 'roll'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category
    }
  }

  return 'Other'
}

