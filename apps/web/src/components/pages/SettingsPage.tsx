import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { GlassCard } from '../ui/GlassCard'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import { WEEK_START_OPTIONS } from '../../lib/weekUtils'
import { Settings, User, DollarSign, MapPin, Bell, Moon, Sun, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { weekStartDay, setWeekStartDay } = useSettings()

  const handleWeekStartChange = (day: number) => {
    setWeekStartDay(day)
    const dayName = WEEK_START_OPTIONS.find(d => d.value === day)?.label
    toast.success(`Week now starts on ${dayName}`)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-secondary">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Family Profile */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-primary">Family Profile</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Update your family information and preferences
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adult1" className="text-secondary">Adult 1 Name</Label>
              <Input id="adult1" defaultValue="Sunny" className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adult2" className="text-secondary">Adult 2 Name</Label>
              <Input id="adult2" defaultValue="Audrey" className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-secondary">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <Input id="location" defaultValue="Montreal, QC" className="pl-10 glass-input" />
            </div>
          </div>
          <Button>
            Save Changes
          </Button>
        </div>
      </GlassCard>

      {/* Meal Planning */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-primary">Meal Planning</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Customize your meal planning preferences
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div>
              <p className="font-medium text-primary">Week Starts On</p>
              <p className="text-sm text-muted">Choose the day you typically do grocery shopping</p>
            </div>
            <select
              value={weekStartDay}
              onChange={(e) => handleWeekStartChange(Number(e.target.value))}
              className="px-4 py-2 rounded-xl glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-sm min-w-[140px]"
            >
              {WEEK_START_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Budget Settings */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-primary">Budget Preferences</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Set your weekly grocery budget range
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-budget" className="text-secondary">Minimum Budget (CAD)</Label>
              <Input id="min-budget" type="number" defaultValue="150" className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-budget" className="text-secondary">Maximum Budget (CAD)</Label>
              <Input id="max-budget" type="number" defaultValue="200" className="glass-input" />
            </div>
          </div>
          <Button>
            Update Budget
          </Button>
        </div>
      </GlassCard>

      {/* Office Days */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-primary">Office Days</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Select days when you need quick meal options
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isSelected = ['Monday', 'Wednesday', 'Friday'].includes(day)
            return (
              <Button
                key={day}
                variant={isSelected ? 'default' : 'glass'}
                className={isSelected ? '' : 'hover:border-[var(--accent-primary)]'}
              >
                {day.slice(0, 3)}
              </Button>
            )
          })}
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-primary">Notifications</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Manage your notification preferences
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div>
              <p className="font-medium text-primary">Meal Plan Reminders</p>
              <p className="text-sm text-muted">Get notified when it's time to plan meals</p>
            </div>
            <input type="checkbox" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div>
              <p className="font-medium text-primary">Grocery List Updates</p>
              <p className="text-sm text-muted">Notifications when grocery lists are ready</p>
            </div>
            <input type="checkbox" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div>
              <p className="font-medium text-primary">AI Suggestions</p>
              <p className="text-sm text-muted">Weekly meal suggestions based on your preferences</p>
            </div>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </GlassCard>

      {/* Appearance */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-2">
          {theme === 'light' ? (
            <Sun className="h-5 w-5 text-[var(--accent-primary)]" />
          ) : (
            <Moon className="h-5 w-5 text-[var(--accent-primary)]" />
          )}
          <h3 className="text-lg font-semibold text-primary">Appearance</h3>
        </div>
        <p className="text-sm text-muted mb-6">
          Customize the look and feel of the app
        </p>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-glass-light)]">
          <div>
            <p className="font-medium text-primary">Theme</p>
            <p className="text-sm text-muted">
              {theme === 'light' ? 'Light mode' : 'Dark mode'}
            </p>
          </div>
          <Button variant="glass" onClick={toggleTheme} className="gap-2">
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                Switch to Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Switch to Light
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
