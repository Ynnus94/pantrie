import { MealPlanGenerator } from '../MealPlanGenerator'

export function MealPlanningPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Meal Planning</h1>
        <p className="text-secondary">
          Generate personalized meal plans tailored to your family's preferences
        </p>
      </div>
      <MealPlanGenerator />
    </div>
  )
}

