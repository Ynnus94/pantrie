import { useState } from 'react'
import { Button } from '../ui/button'
import { GlassCard } from '../ui/GlassCard'
import { ToddlerTracker } from '../ToddlerTracker'
import { Users, Baby, Heart } from 'lucide-react'

export function FamilyProfilesPage() {
  const [activeTab, setActiveTab] = useState<'food-tracking' | 'profiles'>('food-tracking')

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Family Profiles</h1>
        <p className="text-secondary">
          Track food exploration and build great eating habits for your family
        </p>
      </div>

      {/* Family Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Family Members</p>
              <p className="text-2xl font-bold text-primary">3</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--accent-primary)]/20">
              <Users className="h-8 w-8 text-[var(--accent-primary)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Foods Tracked</p>
              <p className="text-2xl font-bold text-primary">-</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--info-bg)]">
              <Baby className="h-8 w-8 text-[var(--info-text)]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Favorite Foods</p>
              <p className="text-2xl font-bold text-primary">-</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--error-bg)]">
              <Heart className="h-8 w-8 text-[var(--error-text)] fill-[var(--error-text)]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs for different profile sections */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-[var(--bg-glass-light)] rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('food-tracking')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'food-tracking'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Food Tracking
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profiles'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Family Members
          </button>
        </div>

        {activeTab === 'food-tracking' && <ToddlerTracker />}

        {activeTab === 'profiles' && (
          <GlassCard hover={false}>
            <h3 className="text-lg font-semibold text-primary mb-2">Family Members</h3>
            <p className="text-sm text-muted mb-6">
              Manage profiles for each family member
            </p>
            
            <div className="space-y-4">
              <div className="p-4 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-glass-light)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">Sunny</h3>
                    <p className="text-sm text-muted">Adult • Primary user</p>
                  </div>
                  <Button variant="glass" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-glass-light)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">Audrey</h3>
                    <p className="text-sm text-muted">Adult</p>
                  </div>
                  <Button variant="glass" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border border-[var(--info-border)] rounded-xl bg-[var(--info-bg)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">Daughter</h3>
                    <p className="text-sm text-muted">Age 2 • Food explorer</p>
                    <p className="text-xs text-muted mt-1">Favorites: salmon, chicken, pasta</p>
                  </div>
                  <Button variant="glass" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
