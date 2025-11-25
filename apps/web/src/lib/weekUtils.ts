/**
 * Week utilities for customizable week start day
 * 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const WEEK_START_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

/**
 * Get the start of the week based on user's preference
 * @param date - Any date in the week
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 * @returns Date object for start of that week
 */
export function getWeekStart(date: Date, weekStartDay: number = 1): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sunday, 1=Monday, etc.
  
  // Calculate how many days to go back
  let diff = day - weekStartDay
  if (diff < 0) {
    diff += 7 // Wrap around to previous week
  }
  
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of the week based on user's preference
 * @param date - Any date in the week
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 * @returns Date object for end of that week
 */
export function getWeekEnd(date: Date, weekStartDay: number = 1): Date {
  const start = getWeekStart(date, weekStartDay)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Get array of all days in the week
 * @param date - Any date in the week
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 * @returns Array of 7 Date objects
 */
export function getWeekDays(date: Date, weekStartDay: number = 1): Date[] {
  const start = getWeekStart(date, weekStartDay)
  const days: Date[] = []
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  
  return days
}

/**
 * Check if two dates are in the same week
 * @param date1 - First date
 * @param date2 - Second date
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function isSameWeek(
  date1: Date, 
  date2: Date, 
  weekStartDay: number = 1
): boolean {
  const start1 = getWeekStart(date1, weekStartDay)
  const start2 = getWeekStart(date2, weekStartDay)
  return start1.getTime() === start2.getTime()
}

/**
 * Get "This Week", "Next Week", etc. relative to today
 * @param weeksFromNow - 0=this week, 1=next week, -1=last week
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getWeekByOffset(
  weeksFromNow: number, 
  weekStartDay: number = 1
): { start: Date; end: Date } {
  const today = new Date()
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + (weeksFromNow * 7))
  
  return {
    start: getWeekStart(targetDate, weekStartDay),
    end: getWeekEnd(targetDate, weekStartDay)
  }
}

/**
 * Format week range for display
 * @param date - Any date in the week
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function formatWeekRange(date: Date, weekStartDay: number = 1): string {
  const start = getWeekStart(date, weekStartDay)
  const end = getWeekEnd(date, weekStartDay)
  
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}

/**
 * Format a single date
 * @param date - Date to format
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Get day name based on week start
 * @param dayIndex - 0-6, relative to week start
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getDayName(dayIndex: number, weekStartDay: number = 1): string {
  const actualDay = (dayIndex + weekStartDay) % 7
  return DAY_NAMES[actualDay]
}

/**
 * Get short day name based on week start
 * @param dayIndex - 0-6, relative to week start
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getDayNameShort(dayIndex: number, weekStartDay: number = 1): string {
  const actualDay = (dayIndex + weekStartDay) % 7
  return DAY_NAMES_SHORT[actualDay]
}

// Alias for backwards compatibility
export const getShortDayName = getDayNameShort

/**
 * Get the start of "this week" based on user preference
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getThisWeekStart(weekStartDay: number = 1): Date {
  return getWeekStart(new Date(), weekStartDay)
}

/**
 * Get the start of "next week" based on user preference
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getNextWeekStart(weekStartDay: number = 1): Date {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return getWeekStart(nextWeek, weekStartDay)
}

/**
 * Convert date to ISO string (YYYY-MM-DD)
 * @param date - Date to convert
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get ordered day names starting from weekStartDay
 * @param weekStartDay - 0=Sunday, 1=Monday, etc.
 */
export function getOrderedDayNames(weekStartDay: number = 1): string[] {
  const ordered: string[] = []
  for (let i = 0; i < 7; i++) {
    ordered.push(DAY_NAMES[(weekStartDay + i) % 7])
  }
  return ordered
}
