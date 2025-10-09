import { Event } from "./events-store"

export function isEventPast(event: Event): boolean {
  try {
    if (event.endDateTime) {
      const eventEndDate = new Date(event.endDateTime)
      const now = new Date()
      
      console.log(`📅 Event "${event.title}" - End: ${eventEndDate.toUTCString()} | Now: ${now.toUTCString()} | isPast: ${eventEndDate < now}`)
      
      return eventEndDate < now
    }

    if (event.startDateTime) {
      const eventDate = new Date(event.startDateTime)
      return eventDate < new Date()
    }

    const dateStr = event.date
    const eventDate = new Date(dateStr)
    
    if (isNaN(eventDate.getTime())) {
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)
    
    return eventDate < today
  } catch (error) {
    console.error("Error checking if event is past:", error)
    return false
  }
}

export function separateEvents(events: Event[]): {
  upcomingEvents: Event[]
  pastEvents: Event[]
} {
  const upcomingEvents: Event[] = []
  const pastEvents: Event[] = []

  events.forEach((event) => {
    if (isEventPast(event)) {
      pastEvents.push(event)
    } else {
      upcomingEvents.push(event)
    }
  })

  return { upcomingEvents, pastEvents }
}

export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const dateA = a.startDateTime ? new Date(a.startDateTime) : new Date(a.date)
    const dateB = b.startDateTime ? new Date(b.startDateTime) : new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  })
}

