"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Search, Filter, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEvents } from "@/components/ui/use-events"
import { separateEvents, sortEventsByDate, isEventPast } from "@/lib/event-utils"

const DEFAULT_CATEGORY = "All"
const DEFAULT_LOCATION = "All"

export default function EventsPage() {
  const { events } = useEvents()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY)
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION)

  const categories = useMemo(() => {
    const uniqueCategories = new Set(events.map((event) => event.category))
    return [DEFAULT_CATEGORY, ...Array.from(uniqueCategories)]
  }, [events])

  const locations = useMemo(() => {
    const uniqueLocations = new Set(events.map((event) => event.location))
    return [DEFAULT_LOCATION, ...Array.from(uniqueLocations)]
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === DEFAULT_CATEGORY || event.category === selectedCategory
      const matchesLocation = selectedLocation === DEFAULT_LOCATION || event.location === selectedLocation

      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [events, searchQuery, selectedCategory, selectedLocation])

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const separated = separateEvents(filteredEvents)
    return {
      upcomingEvents: sortEventsByDate(separated.upcomingEvents),
      pastEvents: sortEventsByDate(separated.pastEvents).reverse(), // Les plus récents en premier pour les passés
    }
  }, [filteredEvents])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Events</h1>
        <p className="text-muted-foreground">Find and register for blockchain and Web3 events near you</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs pour séparer les événements */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            À venir ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Événements passés ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Événements à venir */}
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.image || "/media/template.png"}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      priority={index < 3}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{event.category}</Badge>
                      <span className="text-sm font-medium">
                        {event.price} {event.currency}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3" />
                        {event.date}
                        {event.time && ` • ${event.time}`}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-3 w-3" />
                        {event.attendees}/{event.capacity} registered
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Up to {event.noShowPayoutPercentage ?? 0}% of no-show deposits go back to attendees.
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun événement à venir</h3>
              <p className="text-muted-foreground">Consultez les événements passés ou créez un nouvel événement</p>
            </div>
          )}
        </TabsContent>

        {/* Événements passés */}
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow opacity-75">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.image || "/media/template.png"}
                      alt={event.title}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complété
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{event.category}</Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {event.price} {event.currency}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight text-muted-foreground">{event.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3" />
                        {event.date}
                        {event.time && ` • ${event.time}`}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-3 w-3" />
                        {event.attendees}/{event.capacity} ont participé
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/events/${event.id}`}>Voir les détails</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun événement passé</h3>
              <p className="text-muted-foreground">Les événements terminés apparaîtront ici</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or browse all events</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory(DEFAULT_CATEGORY)
              setSelectedLocation(DEFAULT_LOCATION)
            }}
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  )
}
