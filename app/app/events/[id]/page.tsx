"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Clock, Wallet, ArrowLeft, Share2, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { WalletConnectModal } from "@/components/registration/wallet-connect-modal"
import { PaymentModal } from "@/components/registration/payment-modal"
import { PrePaymentModal } from "@/components/registration/pre-payment-modal"
import { ConfirmationModal } from "@/components/registration/confirmation-modal"
import { OrganizerInfoCard } from "@/components/ui/organizer-info-card"
import { useEvent, useEvents } from "@/components/ui/use-events"
import { useAuthStore } from "@/lib/auth-store"
import { isEventPast } from "@/lib/event-utils"
import { useEventsStore } from "@/lib/events-store"
import { useEscrow } from "@/hooks/use-escrow"
import { ethers } from "ethers"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { events, registerForEvent, isUserRegistered } = useEventsStore()
  const { user } = useAuthStore()
  const [registrationStep, setRegistrationStep] = useState<"idle" | "wallet" | "pre-payment" | "payment" | "confirmation">("idle")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const [registrationId, setRegistrationId] = useState("")
  const { getEventStats } = useEscrow()
  const [blockchainStats, setBlockchainStats] = useState<{
    totalParticipants: number
    attendees: number
    absentees: number
    redistributionAmount: string
  } | null>(null)

  const eventId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const event = useEvent(eventId)

  const fallbackEvent = useMemo(() => events[0], [events])
  const currentEvent = event ?? fallbackEvent
  const isPast = currentEvent ? isEventPast(currentEvent) : false

  useEffect(() => {
    if (!event && eventId) {
      router.replace("/events")
    }
  }, [event, eventId, router])

  // Charger les statistiques blockchain (seulement pour événements payants)
  useEffect(() => {
    const loadStats = async () => {
      if (eventId && isPast && currentEvent && currentEvent.price > 0) {
        const stats = await getEventStats(eventId)
        if (stats) {
          setBlockchainStats({
            totalParticipants: Number(stats.totalParticipants),
            attendees: Number(stats.attendeeCount),
            absentees: Number(stats.absenteeCount),
            redistributionAmount: ethers.formatEther(stats.redistributionAmount)
          })
        }
      }
    }
    loadStats()
  }, [eventId, isPast, currentEvent, getEventStats])

  if (!currentEvent) {
    return null
  }

  const handleStartRegistration = () => {
    // Si l'événement est gratuit, inscription directe
    if (currentEvent.price === 0) {
      if (user) {
        handleFreeRegistration()
      } else {
        setRegistrationStep("wallet")
      }
      return
    }

    // Pour les événements payants
    if (user) {
      setRegistrationStep("pre-payment")
    } else {
      setRegistrationStep("wallet")
    }
  }

  const handleWalletConnect = () => {
    // Une fois connecté, vérifier si c'est gratuit
    if (user) {
      if (currentEvent.price === 0) {
        handleFreeRegistration()
      } else {
        setRegistrationStep("pre-payment")
      }
    }
  }

  const handleFreeRegistration = () => {
    // Inscription gratuite sans transaction
    if (user && currentEvent) {
      const regId = registerForEvent(
        currentEvent.id,
        user.address,
        "FREE-EVENT-NO-TX", // Pas de hash de transaction pour les événements gratuits
        0,
        currentEvent.currency
      )
      setRegistrationId(regId)
      setTransactionHash("FREE-EVENT")
      setRegistrationStep("confirmation")
      console.log("✅ Inscription gratuite réussie:", regId)
    }
  }

  const handlePrePaymentConfirm = () => {
    // L'utilisateur a compris l'avertissement, ouvrir Human Wallet
    setRegistrationStep("payment")
  }

  const handlePaymentConfirm = async (txHash: string) => {
    // Le paiement est déjà traité par le PaymentModal
    setTransactionHash(txHash)
    
    // Enregistrer l'utilisateur pour cet événement
    if (user && currentEvent) {
      const regId = registerForEvent(
        currentEvent.id,
        user.address,
        txHash,
        currentEvent.price,
        currentEvent.currency
      )
      setRegistrationId(regId)
      console.log("✅ Utilisateur enregistré avec succès:", regId)
    }
    
    setRegistrationStep("confirmation")
  }

  const handleCloseModals = () => {
    setRegistrationStep("idle")
    setIsProcessing(false)
  }

  const spotsLeft = currentEvent.capacity - currentEvent.attendees
  const isAlreadyRegistered = user ? isUserRegistered(currentEvent.id, user.address) : false

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <Image
              src={currentEvent.image || "/media/template.png"}
              alt={currentEvent.title}
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Event Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {isPast && (
                <Badge className="bg-green-600 text-white">
                  Événement complété
                </Badge>
              )}
              <Badge variant="secondary">{currentEvent.category}</Badge>
              {(currentEvent.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">{currentEvent.title}</h1>

            {/* Event Meta */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {currentEvent.date}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {currentEvent.time}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {currentEvent.location}
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {currentEvent.attendees}/{currentEvent.capacity} registered
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {currentEvent.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <p className="text-muted-foreground">{currentEvent.requirements ?? "Check the organizer’s notes for details."}</p>
          </div>

          {/* Organizer */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Organizer</h2>
            <div className="flex items-center space-x-3">
              <Avatar>
              <AvatarImage src={currentEvent.organizer.avatar || "/media/template.png"} />
                <AvatarFallback>{currentEvent.organizer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentEvent.organizer.name}</span>
                  {currentEvent.organizer.eventsCreated !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {currentEvent.organizer.eventsCreated} {currentEvent.organizer.eventsCreated === 1 ? 'event' : 'events'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Event organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Registration</span>
                <span className="text-2xl font-bold">
                  {currentEvent.price} {currentEvent.currency}
                </span>
              </CardTitle>
              <CardDescription>
                {spotsLeft > 0 ? (
                  <span className="text-green-600">{spotsLeft} spot{spotsLeft > 1 ? "s" : ""} left</span>
                ) : (
                  <span className="text-red-600">Event is full</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Refund policy:</strong>
                </p>
                <p>{currentEvent.refundPolicy}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Attendees who check in can claim up to {currentEvent.noShowPayoutPercentage ?? 0}% of the no-show deposit pool. The rest is returned to you.
                </p>
              </div>
              <Separator />
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleStartRegistration} 
                disabled={spotsLeft === 0 || isPast || isAlreadyRegistered}
              >
                {isAlreadyRegistered ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Already Registered ✓
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    {isPast ? "Event completed" : spotsLeft > 0 ? "Register now" : "Event full"}
                  </>
                )}
              </Button>
              {isAlreadyRegistered && !isPast && (
                <p className="text-xs text-green-600 dark:text-green-400 text-center">✅ You are registered for this event</p>
              )}
              {!isAlreadyRegistered && !isPast && (
                <p className="text-xs text-muted-foreground text-center">Connect your wallet to complete your registration</p>
              )}
              {isPast && (
                <p className="text-xs text-muted-foreground text-center">This event has already taken place</p>
              )}
            </CardContent>
          </Card>

          {/* Organizer Info Card */}
          <OrganizerInfoCard organizer={currentEvent.organizer} />

          {/* Blockchain Stats (si événement passé) */}
          {isPast && blockchainStats && (
            <Card className="border-blue-400/30">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Statistiques Blockchain
                </CardTitle>
                <CardDescription>Données vérifiées sur la blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">👥 Inscrits:</span>
                  <span className="font-semibold">{blockchainStats.totalParticipants}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">✅ Présents:</span>
                  <span className="font-semibold text-green-600">{blockchainStats.attendees}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">❌ Absents:</span>
                  <span className="font-semibold text-red-600">{blockchainStats.absentees}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">💰 Redistribué:</span>
                  <span className="font-semibold text-blue-600">
                    {parseFloat(blockchainStats.redistributionAmount).toFixed(4)} ETH
                  </span>
                </div>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-center">
                  ⛓️ Vérifié sur Sepolia
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Copy Link
              </Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{currentEvent.location}</p>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Map coming soon</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WalletConnectModal
        isOpen={registrationStep === "wallet"}
        onClose={handleCloseModals}
        onConnect={handleWalletConnect}
      />

      <PrePaymentModal
        isOpen={registrationStep === "pre-payment"}
        onClose={handleCloseModals}
        onConfirm={handlePrePaymentConfirm}
        eventTitle={currentEvent.title}
        price={currentEvent.price}
        currency={currentEvent.currency}
        organizerAddress={currentEvent.organizer?.walletAddress || ""}
      />

      <PaymentModal
        isOpen={registrationStep === "payment"}
        onClose={handleCloseModals}
        onConfirm={handlePaymentConfirm}
        eventTitle={currentEvent.title}
        price={currentEvent.price}
        currency={currentEvent.currency}
        walletAddress={user?.address || ""}
        organizerWalletAddress={currentEvent.organizer?.walletAddress || ""}
        eventId={currentEvent.id}
      />

      <ConfirmationModal
        isOpen={registrationStep === "confirmation"}
        onClose={handleCloseModals}
        eventTitle={currentEvent.title}
        eventDate={currentEvent.date}
        eventLocation={currentEvent.location}
        transactionHash={transactionHash}
        registrationId={registrationId || `REG-${Date.now()}`}
        amount={currentEvent.price}
        currency={currentEvent.currency}
        organizerAddress={currentEvent.organizer?.walletAddress}
      />
    </div>
  )
}
