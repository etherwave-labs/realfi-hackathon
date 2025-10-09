"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, QrCode, Clock, CheckCircle, XCircle, Wallet } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { useEventsStore } from "@/lib/events-store"
import { isEventPast } from "@/lib/event-utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeModal } from "@/components/registration/qr-code-modal"
import { useEscrow } from "@/hooks/use-escrow"
import { Loader2, DollarSign } from "lucide-react"
import { ethers } from "ethers"

export default function MyEventsPage() {
  const { user } = useAuthStore()
  const { events, registrations, getUserRegistrations } = useEventsStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedQRCode, setSelectedQRCode] = useState<{
    registrationId: string
    eventId: string
    eventTitle: string
    eventDate: string
    userAddress: string
    transactionHash: string
  } | null>(null)
  const { withdrawRedistribution, calculatePotentialRedistribution, isProcessing } = useEscrow()
  const [withdrawingEventId, setWithdrawingEventId] = useState<string | null>(null)
  const [redistributionAmounts, setRedistributionAmounts] = useState<Record<string, string>>({})

  const userRegistrations = user ? getUserRegistrations(user.address) : []
  
  const userEventsWithDetails = userRegistrations.map((registration) => {
    const event = events.find((e) => e.id === registration.eventId)
    return {
      registration,
      event,
    }
  }).filter((item) => item.event)

  const upcomingEvents = userEventsWithDetails.filter((item) => !isEventPast(item.event!))
  const pastEvents = userEventsWithDetails.filter((item) => isEventPast(item.event!))

  useEffect(() => {
    if (!user) {
      router.push("/events")
    }
  }, [user, router])

  // Charger les montants de redistribution pour les événements passés PAYANTS
  useEffect(() => {
    const loadRedistributions = async () => {
      if (!user?.address) return
      
      for (const { registration, event } of pastEvents) {
        // Seulement pour les événements payants
        if (registration.checkedIn && event && event.price > 0) {
          const amount = await calculatePotentialRedistribution(event.id, user.address)
          if (amount) {
            setRedistributionAmounts(prev => ({
              ...prev,
              [event.id]: ethers.formatEther(amount)
            }))
          }
        }
      }
    }
    loadRedistributions()
  }, [pastEvents, user, calculatePotentialRedistribution])

  if (!user) {
    return null
  }

  const handleWithdraw = async (eventId: string) => {
    if (!confirm("Voulez-vous retirer votre part de redistribution maintenant ?")) {
      return
    }

    setWithdrawingEventId(eventId)
    const result = await withdrawRedistribution(eventId)
    setWithdrawingEventId(null)

    if (result.success) {
      alert(`✅ Redistribution retirée avec succès!\n\nVous avez reçu ${redistributionAmounts[eventId] || "votre"} ETH\n\nTransaction: ${result.txHash}`)
      // Recharger les montants
      if (user?.address) {
        const amount = await calculatePotentialRedistribution(eventId, user.address)
        if (amount) {
          setRedistributionAmounts(prev => ({
            ...prev,
            [eventId]: ethers.formatEther(amount)
          }))
        }
      }
    } else {
      alert(`❌ Erreur lors du retrait: ${result.error}`)
    }
  }

  const getStatusBadge = (isPast: boolean, checkedIn: boolean) => {
    if (!isPast) {
      return <Badge variant="default">Registered</Badge>
    }
    if (checkedIn) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          Attended
        </Badge>
      )
    }
    return <Badge variant="destructive">No Show</Badge>
  }

  const getStatusIcon = (isPast: boolean, checkedIn: boolean) => {
    if (!isPast) {
      return <Clock className="h-4 w-4 text-blue-600" />
    }
    if (checkedIn) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="min-h-screen">
      {/* Hero avec gradient animé */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50/40 via-gray-50 to-blue-50/40 py-16 mb-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              <span className="text-gradient-metamask text-glow hover:animate-wiggle inline-block cursor-default">My Events</span>
            </h1>
            <p className="text-gray-600 text-lg">Manage your registrations and view your history</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-8">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-300">
          <TabsTrigger value="upcoming" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-gray-700 data-[state=active]:bg-accent data-[state=active]:text-white">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't registered for any events yet.
                </p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map(({ registration, event }, index) => (
              <Card key={registration.id} className="glass-card border-gray-200 hover:border-orange-400/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{event!.title}</CardTitle>
                      <CardDescription className="mt-1">
                        ID: {registration.id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(false, registration.checkedIn)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {event!.date} at {event!.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event!.location}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Amount paid:</span>
                      <span className="font-semibold">
                        {registration.amount} {registration.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transaction:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${registration.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs font-mono"
                      >
                        {registration.transactionHash.slice(0, 6)}...{registration.transactionHash.slice(-4)}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/events/${event!.id}`}>View Event</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedQRCode({
                        registrationId: registration.id,
                        eventId: event!.id,
                        eventTitle: event!.title,
                        eventDate: event!.date,
                        userAddress: registration.userAddress,
                        transactionHash: registration.transactionHash
                      })}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't attended any events yet.
                </p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            pastEvents.map(({ registration, event }, index) => {
              const isPast = isEventPast(event!)
              return (
                <Card key={registration.id} className="glass-card border-gray-200 hover:border-emerald-400/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up opacity-80 hover:opacity-100" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {event!.title}
                          {getStatusIcon(isPast, registration.checkedIn)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          ID: {registration.id}
                        </CardDescription>
                      </div>
                      {getStatusBadge(isPast, registration.checkedIn)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {event!.date} at {event!.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event!.location}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amount paid:</span>
                        <span className="font-semibold">
                          {registration.amount} {registration.currency}
                        </span>
                      </div>
                      {registration.checkedIn && redistributionAmounts[event!.id] && (
                        <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                          <span>💰 Redistribution disponible:</span>
                          <span className="font-semibold">
                            +{parseFloat(redistributionAmounts[event!.id]).toFixed(4)} ETH
                          </span>
                        </div>
                      )}
                      {!registration.checkedIn && isPast && (
                        <div className="text-red-600 dark:text-red-400 text-xs">
                          No refund - Contributed to attendee bonus pool
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-muted-foreground">Transaction:</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${registration.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs font-mono"
                        >
                          {registration.transactionHash.slice(0, 6)}...{registration.transactionHash.slice(-4)}
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/events/${event!.id}`}>View Event</Link>
                      </Button>
                      {registration.checkedIn && redistributionAmounts[event!.id] && parseFloat(redistributionAmounts[event!.id]) > 0 && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleWithdraw(event!.id)}
                          disabled={isProcessing || withdrawingEventId === event!.id}
                        >
                          {withdrawingEventId === event!.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Retrait...
                            </>
                          ) : (
                            <>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Retirer
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
      </div>

      {selectedQRCode && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setSelectedQRCode(null)}
          registrationId={selectedQRCode.registrationId}
          eventId={selectedQRCode.eventId}
          eventTitle={selectedQRCode.eventTitle}
          eventDate={selectedQRCode.eventDate}
          userAddress={selectedQRCode.userAddress}
          transactionHash={selectedQRCode.transactionHash}
        />
      )}
    </div>
  )
}
