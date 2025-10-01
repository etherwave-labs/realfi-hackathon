"use client"

import { useEffect } from "react"
import { useEventsStore } from "@/lib/events-store"
import { supabase } from "@/lib/supabase"

export function StorageSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return

    localStorage.removeItem('eventchain-events')
    console.log('🗑️  localStorage cleared - using only Supabase')

    const loadInitialData = async () => {
      try {
        const [eventsResult, registrationsResult] = await Promise.all([
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('registrations').select('*')
        ])

        if (eventsResult.error) {
          console.error('❌ Supabase table error:', eventsResult.error.message)
          console.error('Run this SQL script in Supabase SQL Editor:')
          console.error('File: app/supabase-setup.sql')
          useEventsStore.setState({ events: [] })
        } else {
          console.log(`✅ Loaded ${eventsResult.data.length} events from Supabase`)
          useEventsStore.setState({ 
            events: eventsResult.data.map((event: any) => ({
              ...event,
              organizer: typeof event.organizer === 'string' 
                ? JSON.parse(event.organizer) 
                : (event.organizer || { name: "Unknown" }),
              refundPolicy: event.refundpolicy,
              startDateTime: event.startdatetime,
              endDateTime: event.enddatetime,
              isPublic: event.ispublic,
              allowWaitlist: event.allowwaitlist,
              noShowPayoutPercentage: event.noshowpayoutpercentage
            })) 
          })
        }

        if (registrationsResult.error) {
          console.error('❌ Supabase registrations table error:', registrationsResult.error.message)
          useEventsStore.setState({ registrations: [] })
        } else {
          console.log(`✅ Loaded ${registrationsResult.data.length} registrations from Supabase`)
          useEventsStore.setState({ 
            registrations: registrationsResult.data.map((reg: any) => ({
              id: reg.id,
              eventId: reg.event_id,
              userAddress: reg.user_address,
              transactionHash: reg.transaction_hash,
              amount: reg.amount,
              currency: reg.currency,
              registeredAt: reg.registered_at,
              checkedIn: reg.checked_in
            }))
          })
        }
      } catch (error) {
        console.error('❌ Error connecting to Supabase:', error)
        console.error('Check your .env.local file has correct Supabase credentials')
        useEventsStore.setState({ events: [], registrations: [] })
      }
    }

    loadInitialData()

    let eventsChannel: any
    let registrationsChannel: any

    try {
      eventsChannel = supabase
        .channel('events-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          async (payload) => {
            console.log('🔄 Event change detected from another browser:', payload.eventType)

            const { data: events, error } = await supabase
              .from('events')
              .select('*')
              .order('created_at', { ascending: false })

            if (!error && events) {
              useEventsStore.setState({ events: events.map((event: any) => ({
                ...event,
                organizer: typeof event.organizer === 'string' 
                  ? JSON.parse(event.organizer) 
                  : (event.organizer || { name: "Unknown" }),
                refundPolicy: event.refundpolicy,
                startDateTime: event.startdatetime,
                endDateTime: event.enddatetime,
                isPublic: event.ispublic,
                allowWaitlist: event.allowwaitlist,
                noShowPayoutPercentage: event.noshowpayoutpercentage
              })) })
            }
          }
        )
        .subscribe()

      registrationsChannel = supabase
        .channel('registrations-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          async (payload) => {
            console.log('🔄 Registration change detected from another browser:', payload.eventType)

            const { data: registrations, error } = await supabase
              .from('registrations')
              .select('*')

            if (!error && registrations) {
              useEventsStore.setState({ 
                registrations: registrations.map((reg: any) => ({
                  id: reg.id,
                  eventId: reg.event_id,
                  userAddress: reg.user_address,
                  transactionHash: reg.transaction_hash,
                  amount: reg.amount,
                  currency: reg.currency,
                  registeredAt: reg.registered_at,
                  checkedIn: reg.checked_in
                }))
              })
            }
          }
        )
        .subscribe()
    } catch (error) {
      console.warn('Could not subscribe to Supabase realtime:', error)
    }

    return () => {
      if (eventsChannel) supabase.removeChannel(eventsChannel)
      if (registrationsChannel) supabase.removeChannel(registrationsChannel)
    }
  }, [])

  return <>{children}</>
}


