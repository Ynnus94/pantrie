import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Settings, User, DollarSign, MapPin, Bell, Moon, Sun } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-primary/70">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Family Profile */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Family Profile
          </CardTitle>
          <CardDescription>
            Update your family information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adult1">Adult 1 Name</Label>
              <Input id="adult1" defaultValue="Sunny" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adult2">Adult 2 Name</Label>
              <Input id="adult2" defaultValue="Audrey" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/40" />
              <Input id="location" defaultValue="Montreal, QC" className="pl-10" />
            </div>
          </div>
          <Button className="bg-[#FF9500] hover:bg-[#FF8500] text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Preferences
          </CardTitle>
          <CardDescription>
            Set your weekly grocery budget range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-budget">Minimum Budget (CAD)</Label>
              <Input id="min-budget" type="number" defaultValue="150" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-budget">Maximum Budget (CAD)</Label>
              <Input id="max-budget" type="number" defaultValue="200" />
            </div>
          </div>
          <Button className="bg-[#FF9500] hover:bg-[#FF8500] text-white">
            Update Budget
          </Button>
        </CardContent>
      </Card>

      {/* Office Days */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Office Days
          </CardTitle>
          <CardDescription>
            Select days when you need quick meal options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <Button
                key={day}
                variant={['Monday', 'Wednesday', 'Friday'].includes(day) ? 'default' : 'outline'}
                className={['Monday', 'Wednesday', 'Friday'].includes(day) 
                  ? 'bg-[#FF9500] hover:bg-[#FF8500] text-white' 
                  : 'border-[#16250F]/20 hover:border-[#FF9500]'}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Meal Plan Reminders</p>
              <p className="text-sm text-primary/70">Get notified when it's time to plan meals</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Grocery List Updates</p>
              <p className="text-sm text-primary/70">Notifications when grocery lists are ready</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">AI Suggestions</p>
              <p className="text-sm text-primary/70">Weekly meal suggestions based on your preferences</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border border-[#16250F]/10">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">Theme</p>
              <p className="text-sm text-primary/70">Light mode (default)</p>
            </div>
            <Button variant="outline" className="border-[#16250F]/20">
              <Moon className="h-4 w-4 mr-2" />
              Switch to Dark
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

