"use client"

import { Separator } from "@/components/ui/separator"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Eye, Settings, BarChart3, QrCode } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { useEventsStore, Event } from "@/lib/events-store"
import { isEventPast } from "@/lib/event-utils"
import { useRouter } from "next/navigation"
import { useEscrow } from "@/hooks/use-escrow"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function OrganizerDashboard() {
  const { user } = useAuthStore()
  const { events, registrations, getEventRegistrations, updateEvent } = useEventsStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { finalizeEvent, isProcessing } = useEscrow()
  const [finalizingEventId, setFinalizingEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/events")
    }
  }, [user, router])

  const myEvents = useMemo(() => {
    if (!user?.address) return []
    return events.filter(
      (event) =>
        event.organizer.walletAddress?.toLowerCase() === user.address.toLowerCase()
    )
  }, [events, user])

  const upcomingEvents = useMemo(() => {
    return myEvents.filter((event) => !isEventPast(event))
  }, [myEvents])

  const pastEvents = useMemo(() => {
    return myEvents.filter((event) => isEventPast(event))
  }, [myEvents])

  const organizerStats = useMemo(() => {
    const totalEvents = myEvents.length
    let totalRevenue = 0
    let totalAttendees = 0
    let totalCheckedIn = 0

    myEvents.forEach((event) => {
      const eventRegistrations = getEventRegistrations(event.id)
      totalAttendees += eventRegistrations.length
      
      eventRegistrations.forEach((reg) => {
        totalRevenue += reg.amount
        if (reg.checkedIn) {
          totalCheckedIn++
        }
      })
    })

    const averageAttendance =
      totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0

    return {
      totalEvents,
      totalRevenue,
      totalAttendees,
      averageAttendance,
    }
  }, [myEvents, getEventRegistrations])

  const handleFinalizeEvent = async (eventId: string, eventPrice: number) => {
    if (eventPrice === 0) {
      alert("ℹ️ Cet événement est gratuit, pas de finalisation nécessaire sur la blockchain.")
      return
    }

    if (!confirm("Voulez-vous finaliser cet événement ?\n\nLes fonds seront redistribués automatiquement :\n- Vous recevrez votre part\n- Les participants présents pourront retirer leur bonus")) {
      return
    }

    setFinalizingEventId(eventId)
    const result = await finalizeEvent(eventId)
    setFinalizingEventId(null)

    if (result.success) {
      updateEvent(eventId, { isFinalized: true })
      
      alert(`✅ Événement finalisé avec succès!\n\nTransaction: ${result.txHash}\n\nVous avez reçu vos fonds et la redistribution est disponible pour les participants présents.`)
    } else {
      alert(`❌ Erreur lors de la finalisation: ${result.error}`)
    }
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizer/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Codes
            </Link>
          </Button>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizerStats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingEvents.length} upcoming
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {organizerStats.totalRevenue.toFixed(2)} USDC
                </div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizerStats.totalAttendees}</div>
                <p className="text-xs text-muted-foreground">Total registrations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizerStats.averageAttendance}%</div>
                <p className="text-xs text-muted-foreground">Check-in rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest event activity</CardDescription>
            </CardHeader>
            <CardContent>
              {myEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created any events yet</p>
                  <Button asChild>
                    <Link href="/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Event
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvents.slice(0, 4).map((event) => {
                    const eventRegs = getEventRegistrations(event.id)
                    const revenue = eventRegs.reduce((sum, reg) => sum + reg.amount, 0)
                    const isPast = isEventPast(event)
                    
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {isPast ? (
                              <Badge variant="secondary">Completed</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • {event.location}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {event.attendees}/{event.capacity} registered
                            </span>
                            <span>{revenue.toFixed(2)} USDC revenue</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {event.price > 0 && isPast && !event.isFinalized && (
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleFinalizeEvent(event.id, event.price)}
                              disabled={isProcessing || finalizingEventId === event.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Clore l'événement et recevoir les fonds"
                            >
                              {finalizingEventId === event.id ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Clôture...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Clore Event
                                </>
                              )}
                            </Button>
                          )}
                          {event.price > 0 && event.isFinalized && (
                            <span className="text-sm text-green-600 font-medium px-2 py-1 bg-green-50 rounded">
                              ✅ Finalisé
                            </span>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/organizer/scan">
                              <QrCode className="h-3 w-3 mr-1" />
                              Scan
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const eventRegs = getEventRegistrations(event.id)
                    const revenue = eventRegs.reduce((sum, reg) => sum + reg.amount, 0)
                    
                    return (
                      <Card key={event.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{event.title}</CardTitle>
                              <CardDescription>
                                {event.date} at {event.time} • {event.location}
                              </CardDescription>
                            </div>
                            <Badge variant="default">Active</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span>Registration Progress</span>
                              <span>
                                {event.attendees}/{event.capacity} (
                                {Math.round((event.attendees / event.capacity) * 100)}%)
                              </span>
                            </div>
                            <Progress value={(event.attendees / event.capacity) * 100} className="w-full" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Revenue: </span>
                                <span className="font-medium">
                                  {revenue.toFixed(2)} {event.currency}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Spots Left: </span>
                                <span className="font-medium">{event.capacity - event.attendees}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/events/${event.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Event
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/organizer/scan">
                                  <QrCode className="h-4 w-4 mr-1" />
                                  Check-in
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Past Events</h2>
              {pastEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No past events yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastEvents.map((event) => {
                    const eventRegs = getEventRegistrations(event.id)
                    const revenue = eventRegs.reduce((sum, reg) => sum + reg.amount, 0)
                    const checkedInCount = eventRegs.filter((reg) => reg.checkedIn).length
                    const attendanceRate =
                      eventRegs.length > 0
                        ? Math.round((checkedInCount / eventRegs.length) * 100)
                        : 0
                    
                    return (
                      <Card key={event.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{event.title}</CardTitle>
                              <CardDescription>
                                {event.date} at {event.time} • {event.location}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-muted-foreground">Registered: </span>
                              <span className="font-medium">{eventRegs.length}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Checked In: </span>
                              <span className="font-medium">{checkedInCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Attendance Rate: </span>
                              <span className="font-medium">{attendanceRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue: </span>
                              <span className="font-medium text-green-600">
                                {revenue.toFixed(2)} {event.currency}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t">
                            {event.price > 0 && !event.isFinalized && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleFinalizeEvent(event.id, event.price)}
                                disabled={isProcessing || finalizingEventId === event.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {finalizingEventId === event.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finalisation...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Finaliser & Recevoir Fonds
                                  </>
                                )}
                              </Button>
                            )}
                            {event.price > 0 && event.isFinalized && (
                              <span className="text-sm text-green-600 font-medium px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
                                ✅ Événement Finalisé
                              </span>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/events/${event.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Total revenue from all events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold mb-2">
                      {organizerStats.totalRevenue.toFixed(2)} USDC
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From {organizerStats.totalAttendees} registrations
                    </p>
                  </div>
                  {myEvents.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Average per event:</span>
                        <span className="font-medium">
                          {(organizerStats.totalRevenue / myEvents.length).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Average per attendee:</span>
                        <span className="font-medium">
                          {organizerStats.totalAttendees > 0
                            ? (organizerStats.totalRevenue / organizerStats.totalAttendees).toFixed(2)
                            : "0.00"}{" "}
                          USDC
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Event Statistics
                </CardTitle>
                <CardDescription>Your event performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Events</span>
                    <Badge variant="secondary">{organizerStats.totalEvents}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Upcoming Events</span>
                    <Badge variant="default">{upcomingEvents.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Past Events</span>
                    <Badge variant="secondary">{pastEvents.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check-in Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={organizerStats.averageAttendance} className="w-20" />
                      <span className="text-sm font-medium">{organizerStats.averageAttendance}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Events by Revenue</CardTitle>
                <CardDescription>Your highest earning events</CardDescription>
              </CardHeader>
              <CardContent>
                {myEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myEvents
                      .map((event) => {
                        const eventRegs = getEventRegistrations(event.id)
                        const revenue = eventRegs.reduce((sum, reg) => sum + reg.amount, 0)
                        return { event, revenue }
                      })
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map(({ event, revenue }) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                          <Badge variant="secondary">{revenue.toFixed(2)} USDC</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
                <CardDescription>Attendee statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Registrations</span>
                    <span className="font-medium">{organizerStats.totalAttendees}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-medium">{organizerStats.totalRevenue.toFixed(2)} USDC</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Check-in Rate</span>
                    <span className="font-medium">{organizerStats.averageAttendance}%</span>
                  </div>
                  <Separator />
                  {myEvents.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Capacity Fill</span>
                        <span className="font-medium">
                          {Math.round(
                            (myEvents.reduce((sum, event) => sum + event.attendees, 0) /
                              myEvents.reduce((sum, event) => sum + event.capacity, 0)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

