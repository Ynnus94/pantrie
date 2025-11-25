import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GlassCard } from '../ui/GlassCard'
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
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-primary">Welcome back, Sunny! 👋</h1>
        <p className="text-secondary">
          Here's what's happening with your family's meals
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Card */}
        <GlassCard 
          className="cursor-pointer animate-fade-in stagger-1" 
          onClick={() => onNavigate('grocery')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">This Week</p>
              <p className="text-2xl font-bold text-primary">$178 spent</p>
              <p className="text-xs text-[var(--success-text)] font-medium">Under budget by $22</p>
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)'
              }}
            >
              <DollarSign className="h-6 w-6 text-[var(--success-text)]" />
            </div>
          </div>
        </GlassCard>

        {/* Meals Card */}
        <GlassCard 
          className="cursor-pointer animate-fade-in stagger-2" 
          onClick={() => onNavigate('thisweek')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Meals Planned</p>
              <p className="text-2xl font-bold text-primary">6 of 7</p>
              <div className="mt-2 h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: '85%',
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))'
                  }} 
                />
              </div>
            </div>
            <div className="p-3 rounded-xl glass-badge-accent">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassCard>

        {/* Grocery Card */}
        <GlassCard 
          className="cursor-pointer animate-fade-in stagger-3" 
          onClick={() => onNavigate('grocery')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Grocery Items</p>
              <p className="text-2xl font-bold text-primary">14 to buy</p>
              <p className="text-xs text-muted">Ready for shopping</p>
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{
                background: 'var(--info-bg)',
                border: '1px solid var(--info-border)'
              }}
            >
              <ShoppingCart className="h-6 w-6 text-[var(--info-text)]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Meals Preview */}
        <GlassCard hover={false} className="animate-fade-in stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">📅 This Week's Meals</h3>
            <Badge 
              variant="outline" 
              className="border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-accent"
            >
              Week of Nov 25
            </Badge>
          </div>
          <div className="space-y-3">
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
              className="w-full mt-4" 
              variant="glass"
              onClick={() => onNavigate('thisweek')}
            >
              View Full Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </GlassCard>

        {/* Grocery List Preview */}
        <GlassCard hover={false} className="animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">🛒 Grocery List</h3>
            <Button 
              size="sm"
              onClick={() => onNavigate('grocery')}
            >
              Start Shopping
            </Button>
          </div>
          <div className="space-y-3">
            <GroceryPreviewItem name="Salmon fillets" price="$24" />
            <GroceryPreviewItem name="Ground beef" price="$9" />
            <GroceryPreviewItem name="Chicken breast" price="$26" />
            <GroceryPreviewItem name="Broccoli" price="$4" />
            <GroceryPreviewItem name="Bell peppers" price="$5" />
            
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary">Estimated Total</span>
                <span className="font-bold text-primary">$178</span>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              variant="glass"
              onClick={() => onNavigate('grocery')}
            >
              View Full List
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </GlassCard>

        {/* AI Suggestions */}
        <GlassCard 
          hover={false} 
          intensity="strong"
          className="lg:col-span-2 animate-fade-in stagger-6"
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>AI Suggestions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card-light">
              <p className="text-sm font-medium mb-2 text-primary">
                "Everyone loved Korean chicken bowl last week!"
              </p>
              <p className="text-sm text-secondary mb-3">
                Try a Korean-themed week? I can suggest 3 Korean meals with mild versions for Audrey.
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onNavigate('thisweek')}
              >
                Generate Korean Week
              </Button>
            </div>

            <div className="glass-card-light">
              <p className="text-sm font-medium mb-2 text-primary">
                "You're under budget by $22 this week"
              </p>
              <p className="text-sm text-secondary mb-3">
                Consider upgrading to premium salmon or trying a special steak night?
              </p>
              <Button 
                size="sm" 
                variant="glass" 
                className="w-full"
                onClick={() => onNavigate('thisweek')}
              >
                Explore Options
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Insights */}
      <GlassCard hover={false} className="animate-fade-in stagger-7">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          Quick Insights
        </h3>
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
          className="w-full mt-6" 
          variant="glass"
          onClick={() => onNavigate('insights')}
        >
          View Full Analytics
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </GlassCard>
    </div>
  )
}

// Helper Components
function MealPreviewItem({ day, meal, completed, isAdventure }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer glass-card-light border border-transparent hover:border-[var(--border-subtle)]">
      <div className="text-xs font-bold text-muted w-10">{day}</div>
      <div className="flex-1">
        <p className="font-medium text-sm text-primary">{meal}</p>
      </div>
      {completed && (
        <Badge className="text-xs badge-success">
          ✓
        </Badge>
      )}
      {isAdventure && (
        <Badge className="text-xs glass-badge-accent">
          🌟
        </Badge>
      )}
    </div>
  )
}

function GroceryPreviewItem({ name, price }: any) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" />
      <div className="flex-1">
        <p className="font-medium text-sm text-primary">{name}</p>
      </div>
      <span className="text-sm font-medium text-secondary">{price}</span>
    </div>
  )
}

function InsightCard({ label, value, stat }: any) {
  return (
    <div className="glass-card-light">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-medium text-sm text-primary">{value}</p>
      <p className="text-sm text-accent font-medium mt-1">{stat}</p>
    </div>
  )
}
