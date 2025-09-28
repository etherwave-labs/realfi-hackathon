"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react"
import Link from "next/link"

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Web3 Developer Meetup",
    description: "Learn about the latest in blockchain development and network with fellow developers",
    category: "Tech Meetup",
    date: "Dec 15, 2024",
    time: "6:00 PM",
    location: "San Francisco, CA",
    price: 25,
    currency: "USDC",
    attendees: 45,
    capacity: 50,
    organizer: "SF Web3 Community",
    image: "/web3-developer-meetup.jpg",
  },
  {
    id: 2,
    title: "DeFi Trading Workshop",
    description: "Hands-on workshop covering advanced DeFi trading strategies and risk management",
    category: "Workshop",
    date: "Dec 18, 2024",
    time: "2:00 PM",
    location: "New York, NY",
    price: 50,
    currency: "USDC",
    attendees: 12,
    capacity: 20,
    organizer: "DeFi Academy",
    image: "/defi-trading-workshop.jpg",
  },
  {
    id: 3,
    title: "NFT Art Gallery Opening",
    description: "Exclusive opening of digital art gallery featuring emerging NFT artists",
    category: "Art & Culture",
    date: "Dec 20, 2024",
    time: "7:00 PM",
    location: "Los Angeles, CA",
    price: 30,
    currency: "USDC",
    attendees: 78,
    capacity: 100,
    organizer: "Crypto Art Collective",
    image: "/nft-art-gallery-opening.jpg",
  },
  {
    id: 4,
    title: "Blockchain Startup Pitch Night",
    description: "Watch innovative blockchain startups pitch their ideas to investors",
    category: "Networking",
    date: "Dec 22, 2024",
    time: "6:30 PM",
    location: "Austin, TX",
    price: 15,
    currency: "USDC",
    attendees: 23,
    capacity: 75,
    organizer: "Austin Blockchain Hub",
    image: "/blockchain-startup-pitch-night.jpg",
  },
  {
    id: 5,
    title: "Smart Contract Security Audit",
    description: "Learn how to audit smart contracts and identify common vulnerabilities",
    category: "Workshop",
    date: "Dec 25, 2024",
    time: "10:00 AM",
    location: "Seattle, WA",
    price: 75,
    currency: "USDC",
    attendees: 8,
    capacity: 15,
    organizer: "Security First Labs",
    image: "/smart-contract-security-audit.jpg",
  },
  {
    id: 6,
    title: "Crypto Gaming Tournament",
    description: "Compete in blockchain-based games and win cryptocurrency prizes",
    category: "Gaming",
    date: "Dec 28, 2024",
    time: "1:00 PM",
    location: "Miami, FL",
    price: 20,
    currency: "USDC",
    attendees: 156,
    capacity: 200,
    organizer: "GameFi League",
    image: "/crypto-gaming-tournament.jpg",
  },
]

const categories = ["All", "Tech Meetup", "Workshop", "Art & Culture", "Networking", "Gaming"]
const locations = [
  "All",
  "San Francisco, CA",
  "New York, NY",
  "Los Angeles, CA",
  "Austin, TX",
  "Seattle, WA",
  "Miami, FL",
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    const matchesLocation = selectedLocation === "All" || event.location === selectedLocation

    return matchesSearch && matchesCategory && matchesLocation
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Events</h1>
        <p className="text-muted-foreground">Find and register for local blockchain and Web3 events</p>
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

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {mockEvents.length} events
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img src={event.image || "/placeholder.svg"} alt={event.title} className="object-cover w-full h-full" />
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
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-3 w-3" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-3 w-3" />
                  {event.attendees}/{event.capacity} registered
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search criteria or browse all events</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
              setSelectedLocation("All")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
