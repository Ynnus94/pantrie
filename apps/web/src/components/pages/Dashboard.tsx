import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { 
  Calendar, ShoppingCart, DollarSign, 
  TrendingUp, Sparkles, ChevronRight 
} from 'lucide-react'

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="p-8 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#16250F]">Welcome back, Sunny! 👋</h1>
        <p className="text-[#16250F]/70">
          Here's what's happening with your family's meals
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer card-hover" onClick={() => onNavigate('grocery')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#16250F]/70">This Week</p>
                <p className="text-2xl font-bold text-[#16250F]">$178 spent</p>
                <p className="text-xs text-green-600">Under budget by $22</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Meals Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer card-hover" onClick={() => onNavigate('thisweek')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#16250F]/70">Meals Planned</p>
                <p className="text-2xl font-bold text-[#16250F]">6 of 7</p>
                <Progress value={85} className="mt-2 h-2" />
              </div>
              <Calendar className="h-8 w-8 text-[#FF9500]" />
            </div>
          </CardContent>
        </Card>

        {/* Grocery Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer card-hover" onClick={() => onNavigate('grocery')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#16250F]/70">Grocery Items</p>
                <p className="text-2xl font-bold text-[#16250F]">14 to buy</p>
                <p className="text-xs text-[#16250F]/60">Ready for shopping</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Meals Preview */}
        <Card className="border border-[#16250F]/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#16250F]">📅 This Week's Meals</CardTitle>
              <Badge variant="outline" className="border-[#16250F]/30">Week of Nov 25</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <MealPreviewItem 
              day="MON" 
              meal="Honey Garlic Salmon" 
              completed={true}
            />
            <MealPreviewItem 
              day="TUE" 
              meal="Korean Beef Tacos" 
              isAdventure={true}
            />
            <MealPreviewItem 
              day="WED" 
              meal="Quick Chicken Pasta" 
              completed={true}
            />
            <MealPreviewItem 
              day="THU" 
              meal="Italian Sausage" 
            />
            <MealPreviewItem 
              day="FRI" 
              meal="Teriyaki Chicken" 
            />
            
            <Button 
              className="w-full mt-4 border-[#16250F]/20 hover:border-[#FF9500]" 
              variant="outline"
              onClick={() => onNavigate('thisweek')}
            >
              View Full Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Grocery List Preview */}
        <Card className="border border-[#16250F]/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#16250F]">🛒 Grocery List</CardTitle>
              <Button 
                size="sm"
                onClick={() => onNavigate('grocery')}
                className="bg-[#FF9500] hover:bg-[#FF8500]"
              >
                Start Shopping
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <GroceryPreviewItem name="Salmon fillets" price="$24" />
            <GroceryPreviewItem name="Ground beef" price="$9" />
            <GroceryPreviewItem name="Chicken breast" price="$26" />
            <GroceryPreviewItem name="Broccoli" price="$4" />
            <GroceryPreviewItem name="Bell peppers" price="$5" />
            
            <div className="pt-3 border-t border-[#16250F]/10">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#16250F]">Estimated Total</span>
                <span className="font-bold text-[#16250F]">$178</span>
              </div>
            </div>

            <Button 
              className="w-full mt-4 border-[#16250F]/20 hover:border-[#FF9500]" 
              variant="outline"
              onClick={() => onNavigate('grocery')}
            >
              View Full List
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="lg:col-span-2 border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/5 to-[#16250F]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#16250F]">
              <Sparkles className="h-5 w-5 text-[#FF9500]" />
              <span>AI Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#16250F]/10">
              <p className="text-sm font-medium mb-2 text-[#16250F]">
                "Everyone loved Korean chicken bowl last week!"
              </p>
              <p className="text-sm text-[#16250F]/70 mb-3">
                Try a Korean-themed week? I can suggest 3 Korean meals with mild versions for Audrey.
              </p>
              <Button 
                size="sm" 
                className="w-full bg-[#FF9500] hover:bg-[#FF8500]"
                onClick={() => onNavigate('planning')}
              >
                Generate Korean Week
              </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#16250F]/10">
              <p className="text-sm font-medium mb-2 text-[#16250F]">
                "You're under budget by $22 this week"
              </p>
              <p className="text-sm text-[#16250F]/70 mb-3">
                Consider upgrading to premium salmon or trying a special steak night?
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-[#16250F]/20 hover:border-[#FF9500]"
                onClick={() => onNavigate('planning')}
              >
                Explore Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#16250F]">
            <TrendingUp className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard 
              label="Most loved meal this month"
              value="Korean Chicken Bowl"
              stat="4.8★"
            />
            <InsightCard 
              label="Budget trend"
              value="Under by $12"
              stat="✓ Great"
            />
            <InsightCard 
              label="Sunny's new cuisines"
              value="2 this month"
              stat="🎉"
            />
            <InsightCard 
              label="Daughter's safe foods"
              value="Growing!"
              stat="8 items"
            />
          </div>
          
          <Button 
            className="w-full mt-6 border-[#16250F]/20 hover:border-[#FF9500]" 
            variant="outline"
            onClick={() => onNavigate('insights')}
          >
            View Full Analytics
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function MealPreviewItem({ day, meal, completed, isAdventure }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#F5F1E8]/50 rounded-lg hover:bg-[#F5F1E8] transition-colors">
      <div className="text-xs font-bold text-[#16250F]/60 w-10">{day}</div>
      <div className="flex-1">
        <p className="font-medium text-sm text-[#16250F]">{meal}</p>
      </div>
      {completed && <Badge variant="outline" className="text-xs border-green-300 text-green-700">✓</Badge>}
      {isAdventure && <Badge className="text-xs bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/30">🌟</Badge>}
    </div>
  )
}

function GroceryPreviewItem({ name, price }: any) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" className="rounded border-[#16250F]/20" />
      <div className="flex-1">
        <p className="font-medium text-sm text-[#16250F]">{name}</p>
      </div>
      <span className="text-sm font-medium text-[#16250F]">{price}</span>
    </div>
  )
}

function InsightCard({ label, value, stat }: any) {
  return (
    <div className="p-4 bg-[#F5F1E8]/50 rounded-lg border border-[#16250F]/10">
      <p className="text-xs text-[#16250F]/60 mb-1">{label}</p>
      <p className="font-medium text-sm text-[#16250F]">{value}</p>
      <p className="text-sm text-[#FF9500] mt-1">{stat}</p>
    </div>
  )
}

