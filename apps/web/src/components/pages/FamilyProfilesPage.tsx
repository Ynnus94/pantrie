import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ToddlerTracker } from '../ToddlerTracker'
import { Users, Baby, Heart } from 'lucide-react'

export function FamilyProfilesPage() {
  const [activeTab, setActiveTab] = useState('food-tracking')

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Family Profiles</h1>
        <p className="text-primary/70">
          Track food exploration and build great eating habits for your family
        </p>
      </div>

      {/* Family Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Family Members</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <Users className="h-8 w-8 text-[#FF9500]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Foods Tracked</p>
                <p className="text-2xl font-bold text-primary">-</p>
              </div>
              <Baby className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70 mb-1">Favorite Foods</p>
                <p className="text-2xl font-bold text-primary">-</p>
              </div>
              <Heart className="h-8 w-8 text-red-600 fill-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different profile sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#F5F1E8] border border-[#16250F]/10">
          <TabsTrigger 
            value="food-tracking" 
            className="data-[state=active]:bg-[#16250F] data-[state=active]:text-[#F5F1E8]"
          >
            Food Tracking
          </TabsTrigger>
          <TabsTrigger 
            value="profiles" 
            className="data-[state=active]:bg-[#16250F] data-[state=active]:text-[#F5F1E8]"
          >
            Family Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="food-tracking" className="mt-6">
          <ToddlerTracker />
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <Card className="border border-[#16250F]/10">
            <CardHeader>
              <CardTitle className="text-primary">Family Members</CardTitle>
              <CardDescription>
                Manage profiles for each family member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-[#16250F]/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-primary">Sunny</h3>
                      <p className="text-sm text-primary/70">Adult • Primary user</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#16250F]/20">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="p-4 border border-[#16250F]/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-primary">Audrey</h3>
                      <p className="text-sm text-primary/70">Adult</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#16250F]/20">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="p-4 border border-[#16250F]/10 rounded-lg bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-primary">Daughter</h3>
                      <p className="text-sm text-primary/70">Age 2 • Food explorer</p>
                      <p className="text-xs text-primary/60 mt-1">Favorites: salmon, chicken, pasta</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#16250F]/20">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

