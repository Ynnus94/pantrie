import { Button } from './ui/button'
import { Calendar, Download } from 'lucide-react'
import { toast } from 'sonner'

interface CalendarExportProps {
  mealPlan: any
}

export function CalendarExport({ mealPlan }: CalendarExportProps) {
  const generateICSFile = () => {
    try {
      const events: any[] = []
      const weekStart = new Date(mealPlan.weekStarting)
      
      // Add meal events
      mealPlan.meals.forEach((meal: any, index: number) => {
        const mealDate = new Date(weekStart)
        mealDate.setDate(weekStart.getDate() + index)
        
        // Dinner event (6:00 PM)
        const dinnerStart = new Date(mealDate)
        dinnerStart.setHours(18, 0, 0, 0)
        const dinnerEnd = new Date(mealDate)
        dinnerEnd.setHours(19, 0, 0, 0)
        
        events.push({
          title: `Dinner: ${meal.name}`,
          start: dinnerStart,
          end: dinnerEnd,
          description: `${meal.description}\n\nToddler: ${meal.toddlerModification}`
        })
        
        // Prep reminder for office days (30 minutes before)
        if (meal.isOfficeDayMeal) {
          const prepTime = new Date(dinnerStart)
          prepTime.setMinutes(prepTime.getMinutes() - meal.cookTime - 10)
          
          events.push({
            title: `Prep: ${meal.name} (${meal.cookTime} min meal)`,
            start: prepTime,
            end: prepTime,
            description: 'Start cooking to have dinner ready on time'
          })
        }
      })
      
      // Generate ICS content
      const icsContent = generateICS(events)
      
      // Download file
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pantrie-meals-${weekStart.toISOString().split('T')[0]}.ics`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Calendar exported! Check your downloads folder.', {
        description: `${events.length} events added to your calendar`
      })
    } catch (error) {
      toast.error('Failed to export calendar', {
        description: 'Please try again'
      })
    }
  }

  return (
    <Button 
      onClick={generateICSFile}
      variant="outline" 
      size="lg"
      className="border-2 border-[#16250F]/30 hover:border-[#FF9500] hover:bg-[#F5F1E8] hover:scale-105 active:scale-100 transition-all font-medium"
    >
      <Calendar className="h-4 w-4 mr-2" />
      Export Calendar
    </Button>
  )
}

function generateICS(events: any[]) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Pantrie//Family Meal Planner//EN\n'
  
  events.forEach(event => {
    const uid = Math.random().toString(36).substr(2, 9)
    const startDate = formatICSDate(event.start)
    const endDate = event.end ? formatICSDate(event.end) : startDate
    
    ics += 'BEGIN:VEVENT\n'
    ics += `UID:${uid}@pantrie.app\n`
    ics += `DTSTART:${startDate}\n`
    ics += `DTEND:${endDate}\n`
    ics += `SUMMARY:${event.title}\n`
    if (event.description) {
      ics += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`
    }
    ics += `CREATED:${formatICSDate(new Date())}\n`
    ics += 'END:VEVENT\n'
  })
  
  ics += 'END:VCALENDAR'
  return ics
}

function formatICSDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
