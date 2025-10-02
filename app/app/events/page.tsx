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
    <div className="min-h-screen">
      {/* Hero avec gradient animé */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50/40 via-gray-50 to-blue-50/40 py-16 mb-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 hover:scale-105 transition-transform duration-300 inline-block">
              <span className="text-gradient-metamask text-glow hover:animate-wiggle cursor-default">Discover Events</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Find and register for blockchain and Web3 events near you
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-8">

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-panel border-gray-300 focus:border-orange-500/70 focus:ring-orange-500/30 focus:scale-105 transition-all duration-300 hover:shadow-md"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] glass-orange border-orange-500/20 hover:border-orange-500/40 hover:scale-105 hover:shadow-lg transition-all duration-300 text-gray-900">
                <Filter className="h-4 w-4 mr-2 text-orange-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-card border-orange-500/20 bg-white">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-gray-900 focus:bg-orange-50 focus:text-orange-900">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px] glass-blue border-blue-500/20 hover:border-blue-500/40 hover:scale-105 hover:shadow-lg transition-all duration-300 text-gray-900">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="glass-card border-blue-500/20 bg-white">
                {locations.map((location) => (
                  <SelectItem key={location} value={location} className="text-gray-900 focus:bg-blue-50 focus:text-blue-900">
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
        <TabsList className="mb-6 bg-white border border-gray-300 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <TabsTrigger value="upcoming" className="text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-300 hover:bg-orange-50 hover:scale-105 font-semibold">
            À venir ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-gray-700 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-300 hover:bg-orange-50 hover:scale-105 font-semibold">
            <CheckCircle2 className="h-4 w-4 mr-2 group-hover:animate-spin-slow" />
            Événements passés ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Événements à venir */}
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id} className="overflow-hidden glass-card border-gray-200 card-glow group animate-scale-in hover:border-orange-400/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.image || "/media/template.png"}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="glass-orange border border-orange-500/40 text-orange-900 font-semibold">{event.category}</Badge>
                      <span className="text-sm font-medium text-gradient-metamask">
                        {event.price} {event.currency}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-orange-400 transition-all duration-300 group-hover:translate-x-1">{event.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center group/item hover:translate-x-1 transition-transform duration-200">
                        <Calendar className="mr-2 h-3 w-3 text-orange-400 group-hover/item:animate-bounce-gentle" />
                        {event.date}
                        {event.time && ` • ${event.time}`}
                      </div>
                      <div className="flex items-center group/item hover:translate-x-1 transition-transform duration-200">
                        <MapPin className="mr-2 h-3 w-3 text-blue-400 group-hover/item:animate-bounce-gentle" />
                        {event.location}
                      </div>
                      <div className="flex items-center group/item hover:translate-x-1 transition-transform duration-200">
                        <Users className="mr-2 h-3 w-3 text-orange-300 group-hover/item:animate-bounce-gentle" />
                        {event.attendees}/{event.capacity} registered
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Up to {event.noShowPayoutPercentage ?? 0}% of no-show deposits go back to attendees.
                      </div>
                    </div>
                    <Button asChild className="w-full gradient-primary glow-primary hover:scale-105 hover:shadow-2xl transition-all duration-300 group-hover:animate-pulse-slow">
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
              {pastEvents.map((event, index) => (
                <Card key={event.id} className="overflow-hidden glass-card border-gray-200 hover:shadow-xl transition-all duration-300 opacity-80 hover:opacity-100 group animate-scale-in hover:border-emerald-400/50 hover:-translate-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.image || "/media/template.png"}
                      alt={event.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <Badge className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-sm text-white border border-emerald-400/50 glow-primary">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complété
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-gray-300 text-gray-600">{event.category}</Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {event.price} {event.currency}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight text-muted-foreground group-hover:text-foreground transition-colors">{event.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3 text-emerald-400/60" />
                        {event.date}
                        {event.time && ` • ${event.time}`}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3 w-3 text-amber-400/60" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-3 w-3 text-cyan-400/60" />
                        {event.attendees}/{event.capacity} ont participé
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full glass-panel border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 transition-all">
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
    </div>
  )
}
