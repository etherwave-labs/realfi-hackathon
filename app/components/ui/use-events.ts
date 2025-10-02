"use client"

import { useEventsStore } from "@/lib/events-store"

export function useEvents() {
  const events = useEventsStore((state) => state.events)
  const addEvent = useEventsStore((state) => state.addEvent)
  const updateEvent = useEventsStore((state) => state.updateEvent)
  const getEventById = useEventsStore((state) => state.getEventById)
  const getEventsByOrganizer = useEventsStore((state) => state.getEventsByOrganizer)

  return { events, addEvent, updateEvent, getEventById, getEventsByOrganizer }
}

export function useEvent(id: string | undefined) {
  return useEventsStore((state) => state.events.find((event) => event.id === id))
}
