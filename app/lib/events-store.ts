"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const DEFAULT_EVENT_IMAGE = "/media/template.png"

export type EventOrganizer = {
  name: string
  avatar?: string
  verified?: boolean
  walletAddress?: string
}

export type Registration = {
  id: string
  eventId: string
  userAddress: string
  transactionHash: string
  amount: number
  currency: string
  registeredAt: string
  checkedIn: boolean
}

export type Event = {
  id: string
  title: string
  description: string
  category: string
  date: string
  time: string
  location: string
  price: number
  currency: string
  attendees: number
  capacity: number
  organizer: EventOrganizer
  image?: string
  tags?: string[]
  refundPolicy?: string
  requirements?: string
  startDateTime?: string
  endDateTime?: string
  isPublic?: boolean
  allowWaitlist?: boolean
  noShowPayoutPercentage?: number
}

export type NewEventInput = Omit<Event, "id" | "attendees"> & {
  attendees?: number
}

type EventsState = {
  events: Event[]
  registrations: Registration[]
  addEvent: (event: NewEventInput) => string
  updateEvent: (id: string, changes: Partial<Event>) => void
  getEventById: (id: string) => Event | undefined
  registerForEvent: (eventId: string, userAddress: string, transactionHash: string, amount: number, currency: string) => string
  isUserRegistered: (eventId: string, userAddress: string) => boolean
  getUserRegistrations: (userAddress: string) => Registration[]
}

const sanitizeImage = (image?: string): string => {
  if (!image) return DEFAULT_EVENT_IMAGE
  const trimmed = image.trim()
  if (!trimmed) return DEFAULT_EVENT_IMAGE
  const lower = trimmed.toLowerCase()
  const isAbsolute = lower.startsWith("http://") || lower.startsWith("https://")
  if (isAbsolute) return trimmed
  if (trimmed.startsWith("/media/")) return trimmed
  return DEFAULT_EVENT_IMAGE
}

const normalizeEvent = (event: Event): Event => ({
  ...event,
  image: sanitizeImage(event.image),
  noShowPayoutPercentage: event.noShowPayoutPercentage ?? 0,
})

const seedEvents: Event[] = []

const initialEvents = seedEvents.map(normalizeEvent)

const getNextEventId = (events: Event[]): string => {
  if (events.length === 0) return "1"
  const numericIds = events
    .map((e) => parseInt(e.id, 10))
    .filter((id) => !isNaN(id))
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
  return `${maxId + 1}`
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      registrations: [],
      addEvent: (eventInput) => {
        const currentEvents = get().events
        const id = getNextEventId(currentEvents)
        const newEvent: Event = normalizeEvent({
          ...eventInput,
          id,
          attendees: eventInput.attendees ?? 0,
          organizer: eventInput.organizer ?? {
            name: "Community Organizer",
          },
        } as Event)
        set((state) => ({ events: [newEvent, ...state.events] }))
        return id
      },
      updateEvent: (id, changes) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? normalizeEvent({ ...event, ...changes, id: event.id }) : event,
          ),
        }))
      },
      getEventById: (id) => {
        const found = get().events.find((event) => event.id === id)
        return found ? normalizeEvent(found) : undefined
      },
      registerForEvent: (eventId, userAddress, transactionHash, amount, currency) => {
        const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newRegistration: Registration = {
          id: registrationId,
          eventId,
          userAddress: userAddress.toLowerCase(),
          transactionHash,
          amount,
          currency,
          registeredAt: new Date().toISOString(),
          checkedIn: false,
        }
        
        set((state) => ({
          registrations: [...state.registrations, newRegistration],
          events: state.events.map((event) =>
            event.id === eventId
              ? { ...event, attendees: event.attendees + 1 }
              : event
          ),
        }))
        
        return registrationId
      },
      isUserRegistered: (eventId, userAddress) => {
        if (!userAddress) return false
        const normalizedAddress = userAddress.toLowerCase()
        return get().registrations.some(
          (reg) => reg.eventId === eventId && reg.userAddress === normalizedAddress
        )
      },
      getUserRegistrations: (userAddress) => {
        if (!userAddress) return []
        const normalizedAddress = userAddress.toLowerCase()
        return get().registrations.filter(
          (reg) => reg.userAddress === normalizedAddress
        )
      },
    }),
    {
      name: "eventchain-events",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState: any) => {
        return { 
          events: [],
          registrations: []
        }
      },
      partialize: (state) => ({ 
        events: state.events,
        registrations: state.registrations 
      }),
    },
  ),
)
