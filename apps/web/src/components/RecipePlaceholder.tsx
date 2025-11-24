import { ChefHat } from 'lucide-react'

interface RecipePlaceholderProps {
  mealName: string
  className?: string
}

export function RecipePlaceholder({ mealName, className = '' }: RecipePlaceholderProps) {
  // Generate consistent color based on meal name
  const getColorFromString = (str: string) => {
    const colors = [
      'from-orange-400 to-orange-600',
      'from-red-400 to-red-600',
      'from-amber-400 to-amber-600',
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600'
    ]
    
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const gradient = getColorFromString(mealName)
  const firstWords = mealName.split(' ').slice(0, 2).join(' ')

  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="text-center text-white p-4">
        <ChefHat className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-2 opacity-90" />
        <p className="text-xs md:text-sm font-medium opacity-90 px-2">
          {firstWords}
        </p>
      </div>
    </div>
  )
}

