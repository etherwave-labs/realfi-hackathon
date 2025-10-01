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
  const { addEvent } = useEvents()

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
    refundPolicy: "Full refund + 20% bonus if you attend. No refund for no-shows.",
    requirements: "",
    isPublic: true,
    allowWaitlist: true,
    image: DEFAULT_EVENT_IMAGE,
    noShowPayoutPercentage: "20",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
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
        name: "Community Organizer",
        verified: true,
        walletAddress: user?.address, // Utilise l'adresse du wallet connecté
      },
      image: formData.image || DEFAULT_EVENT_IMAGE,
      tags,
      refundPolicy: formData.refundPolicy,
      requirements: formData.requirements,
      startDateTime,
      endDateTime,
      isPublic: formData.isPublic,
      allowWaitlist: formData.allowWaitlist,
      noShowPayoutPercentage: payoutPercentage,
    }

    const eventId = addEvent(newEvent)

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/organizer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Event</h1>
        <p className="text-muted-foreground">Set up your event with stablecoin deposits and guaranteed attendance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
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
            <Card>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
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
                    />
                  </div>
                  <span className="pb-2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Attendees can claim up to this percentage of the no-show deposit pool; you’ll keep the rest.
                </p>
              </CardContent>
            </Card>
            {/* Capacity & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
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

            {/* Refund Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Refund Policy
                </CardTitle>
                <CardDescription>How refunds work for your event</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your refund policy..."
                  rows={3}
                  value={formData.refundPolicy}
                  onChange={(e) => handleInputChange("refundPolicy", e.target.value)}
                />
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>How it works:</strong> Attendees who show up get their full registration fee back plus a 20%
                    bonus funded by no-shows. You receive a 10% service fee from the total registration pool.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
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
          <Button type="submit" disabled={!isFormValid() || isSubmitting} size="lg">
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
  )
}
