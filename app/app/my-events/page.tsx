"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, QrCode, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

// Mock user events data
const userEvents = {
  upcoming: [
    {
      id: 1,
      title: "Web3 Developer Meetup",
      date: "Dec 15, 2024",
      time: "6:00 PM",
      location: "San Francisco, CA",
      status: "registered",
      registrationId: "REG-2024-001",
      paidAmount: 25,
      currency: "USDC",
      qrCode: "QR123456",
    },
  ],
  past: [
    {
      id: 2,
      title: "DeFi Trading Workshop",
      date: "Nov 20, 2024",
      time: "2:00 PM",
      location: "New York, NY",
      status: "attended",
      registrationId: "REG-2024-002",
      paidAmount: 50,
      currency: "USDC",
      refundAmount: 60, // 50 + 20% bonus
      qrCode: "QR789012",
    },
    {
      id: 3,
      title: "NFT Art Gallery Opening",
      date: "Nov 15, 2024",
      time: "7:00 PM",
      location: "Los Angeles, CA",
      status: "no-show",
      registrationId: "REG-2024-003",
      paidAmount: 30,
      currency: "USDC",
      qrCode: "QR345678",
    },
  ],
}

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge variant="default">Registered</Badge>
      case "attended":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Attended
          </Badge>
        )
      case "no-show":
        return <Badge variant="destructive">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attended":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "no-show":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Events</h1>
        <p className="text-muted-foreground">Manage your event registrations and view your history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({userEvents.upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({userEvents.past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {userEvents.upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't registered for any upcoming events yet.
                </p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            userEvents.upcoming.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="mt-1">Registration ID: {event.registrationId}</CardDescription>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Paid: </span>
                      <span className="font-medium">
                        {event.paidAmount} {event.currency}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        Show QR Code
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>View Event</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {userEvents.past.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {event.title}
                      {getStatusIcon(event.status)}
                    </CardTitle>
                    <CardDescription className="mt-1">Registration ID: {event.registrationId}</CardDescription>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Paid: </span>
                      <span className="font-medium">
                        {event.paidAmount} {event.currency}
                      </span>
                    </div>
                    {event.status === "attended" && event.refundAmount && (
                      <div className="text-green-600">
                        <span className="text-muted-foreground">Refund + Bonus: </span>
                        <span className="font-medium">
                          +{event.refundAmount} {event.currency}
                        </span>
                      </div>
                    )}
                    {event.status === "no-show" && (
                      <div className="text-red-600 text-xs">No refund - contributed to attendee bonus pool</div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event.id}`}>View Event</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
