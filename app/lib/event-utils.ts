import { Event } from "./events-store"

/**
 * Vérifie si un événement est passé (complété)
 */
export function isEventPast(event: Event): boolean {
  try {
    // Essayer d'abord avec startDateTime s'il existe
    if (event.startDateTime) {
      const eventDate = new Date(event.startDateTime)
      return eventDate < new Date()
    }

    // Sinon, parser la date depuis le champ date
    // Format attendu: "Dec 15, 2024" ou "15 Dec 2024"
    const dateStr = event.date
    const eventDate = new Date(dateStr)
    
    // Si la date est invalide, considérer l'événement comme à venir
    if (isNaN(eventDate.getTime())) {
      return false
    }

    // Comparer seulement la date (sans l'heure)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)
    
    return eventDate < today
  } catch (error) {
    console.error("Error checking if event is past:", error)
    return false
  }
}

/**
 * Sépare les événements en deux groupes : à venir et passés
 */
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

/**
 * Trie les événements par date (les plus proches en premier)
 */
export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const dateA = a.startDateTime ? new Date(a.startDateTime) : new Date(a.date)
    const dateB = b.startDateTime ? new Date(b.startDateTime) : new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  })
}

