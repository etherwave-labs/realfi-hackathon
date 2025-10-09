"use client"

import { create } from "zustand"
import { supabase } from "./supabase"

const DEFAULT_EVENT_IMAGE = "/media/template.png"

export type EventOrganizer = {
  name: string
  avatar?: string
  verified?: boolean
  walletAddress?: string
  eventsCreated?: number
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
  isFinalized?: boolean
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
  getEventsByOrganizer: (walletAddress: string) => Event[]
  registerForEvent: (eventId: string, userAddress: string, transactionHash: string, amount: number, currency: string) => string
  isUserRegistered: (eventId: string, userAddress: string) => boolean
  getUserRegistrations: (userAddress: string) => Registration[]
  checkInUser: (registrationId: string) => void
  getEventRegistrations: (eventId: string) => Registration[]
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
  return Date.now().toString()
}

export const useEventsStore = create<EventsState>()((set, get) => ({
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
        
        const supabaseEvent = {
          id: newEvent.id,
          title: newEvent.title || '',
          description: newEvent.description || null,
          category: newEvent.category || null,
          date: newEvent.date || null,
          time: newEvent.time || null,
          location: newEvent.location || null,
          price: newEvent.price || 0,
          currency: newEvent.currency || 'USDC',
          attendees: newEvent.attendees || 0,
          capacity: newEvent.capacity || 0,
          organizer: JSON.stringify(newEvent.organizer),
          image: newEvent.image || null,
          tags: newEvent.tags && newEvent.tags.length > 0 ? newEvent.tags : null,
          refundpolicy: newEvent.refundPolicy || null,
          requirements: newEvent.requirements || null,
          startdatetime: newEvent.startDateTime || null,
          enddatetime: newEvent.endDateTime || null,
          ispublic: newEvent.isPublic !== false,
          allowwaitlist: newEvent.allowWaitlist === true,
          noshowpayoutpercentage: newEvent.noShowPayoutPercentage || 0
        }
        
        supabase
          .from('events')
          .insert([supabaseEvent])
          .then(({ error }) => {
            if (error) {
              console.error('Error inserting event:', error)
              console.error('Event data:', supabaseEvent)
            } else {
              console.log('Event successfully inserted into Supabase!')
            }
          })
        
        set((state) => ({ events: [newEvent, ...state.events] }))
        return id
      },
      updateEvent: (id, changes) => {
        supabase
          .from('events')
          .update({
            title: changes.title,
            description: changes.description,
            category: changes.category,
            date: changes.date,
            time: changes.time,
            location: changes.location,
            price: changes.price,
            currency: changes.currency,
            attendees: changes.attendees,
            capacity: changes.capacity,
            organizer: changes.organizer ? JSON.stringify(changes.organizer) : undefined,
            image: changes.image,
            tags: changes.tags,
          })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating event:', error)
          })
        
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
      getEventsByOrganizer: (walletAddress) => {
        return get().events.filter(
          (event) => event.organizer?.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
        )
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
        
        const supabaseRegistration = {
          id: newRegistration.id,
          event_id: newRegistration.eventId,
          user_address: newRegistration.userAddress,
          transaction_hash: newRegistration.transactionHash,
          amount: newRegistration.amount,
          currency: newRegistration.currency,
          registered_at: newRegistration.registeredAt,
          checked_in: newRegistration.checkedIn
        }
        
        supabase
          .from('registrations')
          .insert([supabaseRegistration])
          .then(({ error }) => {
            if (error) {
              console.error('Error inserting registration:', error)
              console.error('Registration data:', supabaseRegistration)
            } else {
              console.log('Registration successfully inserted into Supabase!')
            }
          })
        
        const currentEvent = get().events.find((e) => e.id === eventId)
        if (currentEvent) {
          supabase
            .from('events')
            .update({ attendees: currentEvent.attendees + 1 })
            .eq('id', eventId)
            .then(({ error }) => {
              if (error) console.error('Error updating attendees:', error)
            })
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
      checkInUser: (registrationId) => {
        supabase
          .from('registrations')
          .update({ checked_in: true })
          .eq('id', registrationId)
          .then(({ error }) => {
            if (error) console.error('Error checking in user:', error)
          })
        
        set((state) => ({
          registrations: state.registrations.map((reg) =>
            reg.id === registrationId
              ? { ...reg, checkedIn: true }
              : reg
          ),
        }))
      },
      getEventRegistrations: (eventId) => {
        return get().registrations.filter((reg) => reg.eventId === eventId)
      },
}))
