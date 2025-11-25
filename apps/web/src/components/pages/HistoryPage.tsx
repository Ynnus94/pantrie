import { MealPlanHistory } from '../MealPlanHistory'

export function HistoryPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Meal Plan History</h1>
        <p className="text-secondary">
          View and manage your saved meal plans
        </p>
      </div>
      <MealPlanHistory />
    </div>
  )
}

