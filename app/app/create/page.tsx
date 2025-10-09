"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEvents } from "@/components/ui/use-events"
import { useAuthStore } from "@/lib/auth-store"
import type { NewEventInput } from "@/lib/events-store"
import { useEscrow } from "@/hooks/use-escrow"

const categories = [
  "Tech Meetup",
  "Workshop",
  "Networking",
  "Conference",
  "Art & Culture",
  "Gaming",
  "Education",
  "Business",
  "Other",
]

const currencies = [
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDT", name: "Tether USD" },
  { symbol: "DAI", name: "Dai Stablecoin" },
]

const DEFAULT_EVENT_IMAGE = "/media/template.png"

function formatTime(startTime: string, endTime?: string) {
  const toDisplay = (time: string) => time
  if (!endTime) {
    return toDisplay(startTime)
  }
  return `${toDisplay(startTime)} - ${toDisplay(endTime)}`
}

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const { addEvent, getEventsByOrganizer } = useEvents()
  const { createEvent: createEventOnChain } = useEscrow()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    registrationFee: "",
    currency: "USDC",
    requirements: "",
    isPublic: true,
    allowWaitlist: true,
    image: DEFAULT_EVENT_IMAGE,
    noShowPayoutPercentage: "20",
  })

  // Si l'utilisateur n'est pas connecté, rediriger
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to create an event</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to connect your wallet to create an event and receive payments.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Go to Home Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    // Validation spéciale pour le pourcentage de bonus (max 100%)
    if (field === "noShowPayoutPercentage" && typeof value === "string") {
      const numValue = Number(value)
      if (value !== "" && (!isNaN(numValue) && numValue > 100)) {
        return // Bloquer la saisie si > 100
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payoutPercentage = Number(formData.noShowPayoutPercentage)
    const registrationFee = Number(formData.registrationFee)

    if (Number.isNaN(payoutPercentage) || payoutPercentage < 0 || payoutPercentage > 100) {
      setIsSubmitting(false)
      return
    }

    if (Number.isNaN(registrationFee) || registrationFee < 0) {
      setIsSubmitting(false)
      return
    }

    const startDateTime = formData.date && formData.startTime ? `${formData.date}T${formData.startTime}` : undefined
    const endDateTime = formData.date && formData.endTime ? `${formData.date}T${formData.endTime}` : undefined

    // Calculer le nombre d'événements déjà créés par cet organisateur
    const organizerEvents = user?.address ? getEventsByOrganizer(user.address) : []
    const eventsCreatedCount = organizerEvents.length

    // Générer automatiquement la politique de remboursement basée sur le pourcentage de bonus
    const refundPolicy = registrationFee === 0 
      ? "Free event - no deposit required."
      : `Deposit returned + ${payoutPercentage}% bonus if you attend. No refund for no-shows.`

    const newEvent: NewEventInput = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: new Date(formData.date).toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: formData.startTime ? formatTime(formData.startTime, formData.endTime) : "",
      location: formData.location,
      price: Number(formData.registrationFee),
      currency: formData.currency,
      attendees: 0,
      capacity: Number(formData.capacity),
      organizer: {
        name: user?.username || `User ${user?.address.slice(0, 6)}`,
        avatar: user?.avatar,
        verified: true,
        walletAddress: user?.address,
        eventsCreated: eventsCreatedCount + 1, // +1 pour inclure cet événement
      },
      image: formData.image || DEFAULT_EVENT_IMAGE,
      tags,
      refundPolicy: refundPolicy,
      requirements: formData.requirements,
      startDateTime,
      endDateTime,
      isPublic: formData.isPublic,
      allowWaitlist: formData.allowWaitlist,
      noShowPayoutPercentage: payoutPercentage,
    }

    const eventId = addEvent(newEvent)

    // Créer l'événement sur la blockchain SEULEMENT si c'est payant
    if (startDateTime && endDateTime && registrationFee > 0) {
      const eventEndDate = new Date(endDateTime)
      const eventEndTimestamp = Math.floor(eventEndDate.getTime() / 1000)
      const currentTimestamp = Math.floor(Date.now() / 1000)
      
      // IMPORTANT: Ajouter un buffer de sécurité pour le fuseau horaire
      // La blockchain utilise UTC, donc on ajoute 10 minutes de buffer
      const SAFETY_BUFFER = 600 // 10 minutes en secondes
      const minRequiredTimestamp = currentTimestamp + SAFETY_BUFFER
      
      console.log("🕐 Vérification des fuseaux horaires...")
      console.log("⏰ Heure locale actuelle:", new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))
      console.log("🌍 Heure UTC actuelle:", new Date().toUTCString())
      console.log("📅 Date de fin événement (local):", eventEndDate.toLocaleString('fr-FR'))
      console.log("🌐 Date de fin événement (UTC):", eventEndDate.toUTCString())
      console.log("⏱️  Timestamp actuel (UTC):", currentTimestamp, "→", new Date(currentTimestamp * 1000).toUTCString())
      console.log("🎯 Timestamp fin événement:", eventEndTimestamp, "→", new Date(eventEndTimestamp * 1000).toUTCString())
      console.log("⚡ Différence:", eventEndTimestamp - currentTimestamp, "secondes (", Math.floor((eventEndTimestamp - currentTimestamp) / 60), "minutes )")
      
      // Vérifier que la date de fin est dans le futur avec un buffer de sécurité
      if (eventEndTimestamp <= minRequiredTimestamp) {
        const minutesNeeded = Math.ceil((minRequiredTimestamp - eventEndTimestamp) / 60)
        alert(`⚠️ ERREUR DE FUSEAU HORAIRE !\n\n` +
          `La blockchain utilise l'heure UTC (universelle).\n\n` +
          `Votre événement se termine à: ${eventEndDate.toUTCString()}\n` +
          `Heure UTC actuelle: ${new Date().toUTCString()}\n\n` +
          `❌ L'événement se termine dans ${minutesNeeded < 0 ? 'le passé' : minutesNeeded + ' minutes'} (en UTC).\n\n` +
          `✅ Solution: Ajoutez au moins ${Math.abs(minutesNeeded) + 15} minutes à l'heure de fin.\n` +
          `Exemple: Mettez 21:00 ou plus au lieu de ${formData.endTime}`)
        setIsSubmitting(false)
        return
      }
      
      console.log("🔗 Création de l'événement payant sur la blockchain...")
      console.log("Debug - Event ID:", eventId)
      console.log("Debug - Prix:", registrationFee, "ETH")
      console.log("Debug - Pourcentage redistribution:", payoutPercentage)
      
      try {
        const result = await createEventOnChain(
          eventId,
          registrationFee,
          eventEndTimestamp,
          payoutPercentage
        )
        
        if (result.success) {
          console.log("✅ Événement créé sur la blockchain:", result.txHash)
          alert(`✅ SUCCÈS !\n\nÉvénement créé avec succès sur la blockchain!\n\nTransaction: ${result.txHash}\n\nL'événement est maintenant disponible et toutes les fonctions blockchain fonctionneront.`)
        } else {
          console.error("⚠️ Erreur blockchain (événement créé quand même):", result.error)
          alert(`⚠️ Événement créé localement, mais erreur blockchain:\n${result.error}\n\nL'événement est disponible mais les fonctions blockchain ne fonctionneront pas.`)
        }
      } catch (error: any) {
        console.error("❌ Erreur lors de la création blockchain:", error)
        // L'événement est quand même créé localement, donc on continue
        alert(`ℹ️ Événement créé localement.\n\nUne erreur s'est produite lors de la confirmation blockchain, mais l'événement devrait être sur la blockchain.\n\nVérifiez la console pour plus de détails.`)
      }
    } else if (registrationFee === 0) {
      console.log("✨ Événement gratuit créé (pas de blockchain nécessaire)")
    }

    setIsSubmitting(false)
    router.push(`/events/${eventId}`)
  }

  const isFormValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.category &&
      formData.date &&
      formData.startTime &&
      formData.location &&
      formData.capacity &&
      formData.registrationFee
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero with animated gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50/40 via-gray-50 to-blue-50/40 py-12 mb-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-slide-down">
            <Button variant="ghost" asChild className="mb-4 hover:text-orange-400 transition-colors hover:scale-105 hover:-translate-x-1">
              <Link href="/organizer/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              <span className="text-gradient-metamask text-glow hover:animate-wiggle inline-block cursor-default">Create New Event</span>
            </h1>
            <p className="text-gray-600 text-lg">Set up your event with stablecoin deposits and guaranteed attendance</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-8 max-w-4xl">

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Web3 Developer Meetup"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event, what attendees will learn, and what to expect..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags (optional)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Add up to 5 tags to help people find your event</p>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-400" />
                  Date & Time
                </CardTitle>
                <CardDescription>When will your event take place?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="glass-card border-gray-200 hover:border-blue-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-blue-400" />
                  Location
                </CardTitle>
                <CardDescription>Where will your event be held?</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="location">Venue Address *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., TechHub San Francisco, 123 Market Street, San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Extra information for attendees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="requirements">Requirements (optional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="e.g., Bring your laptop, basic knowledge of blockchain recommended..."
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Event</Label>
                      <p className="text-sm text-muted-foreground">Anyone can discover and register for this event</p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Waitlist</Label>
                      <p className="text-sm text-muted-foreground">Let people join a waitlist when the event is full</p>
                    </div>
                    <Switch
                      checked={formData.allowWaitlist}
                      onCheckedChange={(checked) => handleInputChange("allowWaitlist", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up sticky top-4" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-orange-400" />
                  No-show payout
                </CardTitle>
                <CardDescription>Choose how much of the no-show pool is paid to attendees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="registrationFee">Registration Fee *</Label>
                    <Input
                      id="registrationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="25.00"
                      value={formData.registrationFee}
                      onChange={(e) => handleInputChange("registrationFee", e.target.value)}
                      required
                    />
                  </div>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.symbol} value={currency.symbol}>
                          {currency.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Set the registration price attendees lock in when they register.
                </p>
                <div className="flex items-end gap-2 mt-4">
                  <div className="flex-1">
                    <Label htmlFor="noShowPayoutPercentage">Max bonus share *</Label>
                    <Input
                      id="noShowPayoutPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.noShowPayoutPercentage}
                      onChange={(e) => handleInputChange("noShowPayoutPercentage", e.target.value)}
                      required
                      className={
                        formData.noShowPayoutPercentage && Number(formData.noShowPayoutPercentage) > 100
                          ? "border-red-500"
                          : ""
                      }
                    />
                  </div>
                  <span className="pb-2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Attendees can claim up to this percentage of the no-show deposit pool; you'll keep the rest. <strong>(Max: 100%)</strong>
                </p>
              </CardContent>
            </Card>
            {/* Capacity & Pricing */}
            <Card className="glass-card border-gray-200 hover:border-blue-400/30 transition-all duration-300 animate-fade-in-up sticky top-4" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-400" />
                  Capacity & Pricing
                </CardTitle>
                <CardDescription>Set your event limits and fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Max Attendees *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Refund Policy Info */}
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-orange-400" />
                  How It Works
                </CardTitle>
                <CardDescription>Automatic refund policy based on your settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Politique de remboursement :</strong>
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {formData.registrationFee && Number(formData.registrationFee) > 0 
                      ? `Les participants qui se présentent récupèrent leur dépôt + ${formData.noShowPayoutPercentage}% de bonus (financé par les absents). Pas de remboursement pour les absents.`
                      : "Événement gratuit - aucun dépôt requis."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Event Preview</CardTitle>
                <CardDescription>How your event will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                    {formData.date || "Date not set"} {formData.startTime && `at ${formData.startTime}`}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                    {formData.location || "Location not set"}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-3 w-3 text-muted-foreground" />
                    {formData.capacity ? `Up to ${formData.capacity} attendees` : "Capacity not set"}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-3 w-3 text-muted-foreground" />
                    {formData.registrationFee ? `${formData.registrationFee} ${formData.currency}` : "Price not set"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/organizer/dashboard">Cancel</Link>
          </Button>
          <Button type="submit" disabled={!isFormValid() || isSubmitting} size="lg" className="btn-metamask glow-metamask hover:scale-105">
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
