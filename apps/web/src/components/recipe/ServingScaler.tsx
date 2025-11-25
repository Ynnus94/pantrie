import { Scale } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ServingScalerProps {
  baseServings: number
  currentServings: number
  onServingsChange: (servings: number) => void
}

const SERVING_OPTIONS = [1, 2, 4, 6, 8]

export function ServingScaler({ baseServings, currentServings, onServingsChange }: ServingScalerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Scale className="h-4 w-4" />
        <span>Servings:</span>
      </div>
      <div className="flex gap-1">
        {SERVING_OPTIONS.map(size => (
          <button
            key={size}
            onClick={() => onServingsChange(size)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              currentServings === size 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'glass-button hover:bg-[var(--accent-primary)]/10'
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper function to scale ingredient quantities
export function scaleIngredient(ingredient: string, scaleFactor: number): string {
  // Common fraction patterns
  const fractionMap: Record<string, number> = {
    '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
    '1/2': 0.5, '1/4': 0.25, '3/4': 0.75, '1/3': 0.333, '2/3': 0.667,
    '1/8': 0.125, '3/8': 0.375, '5/8': 0.625, '7/8': 0.875,
  }

  // Reverse fraction map for display
  const numberToFraction: Record<string, string> = {
    '0.5': '½', '0.25': '¼', '0.75': '¾', '0.33': '⅓', '0.67': '⅔',
    '0.125': '⅛', '0.375': '⅜', '0.625': '⅝', '0.875': '⅞',
  }

  // Pattern to match quantities at the start of ingredient
  // Matches: "2", "2.5", "1/2", "½", "1 1/2", "1½"
  const quantityRegex = /^([\d.\/½¼¾⅓⅔⅛⅜⅝⅞]+(?:\s*[\d.\/½¼¾⅓⅔⅛⅜⅝⅞]+)?)\s*/

  const match = ingredient.match(quantityRegex)
  
  if (!match) {
    // No quantity found, return as-is
    return ingredient
  }

  const quantityStr = match[1].trim()
  const rest = ingredient.slice(match[0].length)

  // Parse the quantity
  let quantity = 0

  // Check for mixed numbers like "1 1/2" or "1½"
  const mixedMatch = quantityStr.match(/^(\d+)\s*([\d\/½¼¾⅓⅔⅛⅜⅝⅞]+)$/)
  if (mixedMatch) {
    quantity = parseFloat(mixedMatch[1])
    const fractionPart = mixedMatch[2]
    quantity += fractionMap[fractionPart] || parseFraction(fractionPart)
  } else if (fractionMap[quantityStr]) {
    quantity = fractionMap[quantityStr]
  } else if (quantityStr.includes('/')) {
    quantity = parseFraction(quantityStr)
  } else {
    quantity = parseFloat(quantityStr)
  }

  if (isNaN(quantity)) {
    return ingredient
  }

  // Scale the quantity
  const scaledQuantity = quantity * scaleFactor

  // Format the result
  const formattedQuantity = formatQuantity(scaledQuantity, numberToFraction)

  return `${formattedQuantity} ${rest}`
}

function parseFraction(str: string): number {
  const parts = str.split('/')
  if (parts.length === 2) {
    return parseFloat(parts[0]) / parseFloat(parts[1])
  }
  return parseFloat(str)
}

function formatQuantity(num: number, fractionMap: Record<string, string>): string {
  // Check if it's a whole number
  if (num === Math.floor(num)) {
    return num.toString()
  }

  // Check for common fractions
  const decimal = num % 1
  const whole = Math.floor(num)
  const decimalStr = decimal.toFixed(2).replace(/0+$/, '')

  if (fractionMap[decimalStr]) {
    if (whole === 0) {
      return fractionMap[decimalStr]
    }
    return `${whole}${fractionMap[decimalStr]}`
  }

  // Return decimal if no fraction match
  const formatted = num.toFixed(1)
  // Remove trailing .0
  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted
}

