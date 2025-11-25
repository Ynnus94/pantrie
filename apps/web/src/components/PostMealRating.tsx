import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { saveMealRating } from '../lib/mealHistoryApi'
import { Star, BookmarkPlus, ThumbsUp, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface FamilyMember {
  id: number
  name: string
  rating?: number
}

interface PostMealRatingProps {
  meal: any  // Full meal object for saving to database
  mealName: string
  mealDate: string
  familyMembers: FamilyMember[]
  onComplete: (data: {
    ratings: Record<number, number>
    notes: string
    saveToLibrary: boolean
  }) => void
}

export function PostMealRating({ 
  meal,
  mealName, 
  mealDate, 
  familyMembers,
  onComplete 
}: PostMealRatingProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState('')
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  const averageRating = Object.keys(ratings).length > 0
    ? Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length
    : 0

  const allRated = familyMembers.every(member => ratings[member.id] !== undefined)

  const handleRatingComplete = () => {
    if (averageRating >= 4.0) {
      setShowSavePrompt(true)
    } else {
      handleSubmit(false)
    }
  }

  const handleSubmit = async (saveToLibrary: boolean) => {
    try {
      // Save to database
      await saveMealRating({
        meal,
        ratings,
        notes,
        saveToLibrary
      })
      
      console.log('✅ Rating saved to database!')
      
      if (saveToLibrary) {
        toast.success(`"${mealName}" saved to your Recipe Library!`)
      } else {
        toast.success('Meal rating saved!')
      }
      
      onComplete({
        ratings,
        notes,
        saveToLibrary
      })
    } catch (error) {
      console.error('❌ Failed to save rating:', error)
      toast.error('Failed to save rating. Please try again.')
    }
  }

  const setRating = (memberId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [memberId]: rating }))
  }

  // If showing save prompt
  if (showSavePrompt) {
    return (
      <Card className="border-2 border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/10 to-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 text-[#FF9500]" />
            This was a hit!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-[#FF9500] mb-2">
              {averageRating.toFixed(1)}★
            </div>
            <p className="text-primary/70">
              Looks like everyone loved <strong>{mealName}</strong>!
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#16250F]/10">
            <p className="text-sm font-medium text-primary mb-3">
              Save this to your Recipe Library so you can easily make it again?
            </p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 gap-2 bg-[#FF9500] hover:bg-[#FF8500] text-white"
                onClick={() => handleSubmit(true)}
              >
                <BookmarkPlus className="h-4 w-4" />
                Save to Library
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-[#16250F]/20 hover:border-[#FF9500]"
                onClick={() => handleSubmit(false)}
              >
                <ThumbsUp className="h-4 w-4" />
                Just Log It
              </Button>
            </div>
          </div>

          <p className="text-xs text-primary/60 text-center">
            You can always save it from History later if you change your mind
          </p>
        </CardContent>
      </Card>
    )
  }

  // Main rating form
  return (
    <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/30">
      <CardHeader>
        <CardTitle className="text-primary">How was dinner tonight?</CardTitle>
        <p className="text-sm text-primary/70">
          {mealName} • {mealDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Family ratings */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-primary">Rate for each family member:</p>
          
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <span className="font-medium text-primary">{member.name}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(member.id, star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        (ratings[member.id] || 0) >= star
                          ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]'
                          : 'text-muted'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Average rating display */}
        {allRated && (
          <div className="bg-[#F5F1E8] p-4 rounded-lg text-center border border-[#16250F]/10">
            <div className="text-2xl font-bold text-primary mb-1">
              {averageRating.toFixed(1)}★
            </div>
            <p className="text-sm text-primary/70">Average Rating</p>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">
            Notes (optional)
          </label>
          <Textarea
            placeholder="Any thoughts? What worked well? What to adjust next time?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="border-[#16250F]/10 focus-visible:ring-[#FF9500]"
          />
        </div>

        {/* Submit button */}
        <Button 
          className="w-full bg-[#FF9500] hover:bg-[#FF8500] text-white"
          disabled={!allRated}
          onClick={handleRatingComplete}
        >
          Submit Rating
        </Button>

        {!allRated && (
          <p className="text-xs text-center text-primary/60">
            Please rate for all family members
          </p>
        )}
      </CardContent>
    </Card>
  )
}

