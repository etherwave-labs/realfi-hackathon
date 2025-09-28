"use client"

import { Separator } from "@/components/ui/separator"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Eye, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

// Mock organizer data
const organizerStats = {
  totalEvents: 12,
  totalRevenue: 2450,
  totalAttendees: 340,
  averageAttendance: 85,
}

const organizerEvents = {
  upcoming: [
    {
      id: 1,
      title: "Web3 Developer Meetup",
      date: "Dec 15, 2024",
      time: "6:00 PM",
      location: "San Francisco, CA",
      registrations: 45,
      capacity: 50,
      revenue: 1125,
      currency: "USDC",
      status: "active",
    },
    {
      id: 4,
      title: "Blockchain Startup Pitch Night",
      date: "Dec 22, 2024",
      time: "6:30 PM",
      location: "Austin, TX",
      registrations: 23,
      capacity: 75,
      revenue: 345,
      currency: "USDC",
      status: "active",
    },
  ],
  past: [
    {
      id: 2,
      title: "DeFi Trading Workshop",
      date: "Nov 20, 2024",
      time: "2:00 PM",
      location: "New York, NY",
      registrations: 20,
      capacity: 20,
      attendance: 18,
      revenue: 1000,
      serviceFee: 100,
      currency: "USDC",
      status: "completed",
    },
    {
      id: 3,
      title: "NFT Art Gallery Opening",
      date: "Nov 15, 2024",
      time: "7:00 PM",
      location: "Los Angeles, CA",
      registrations: 100,
      capacity: 100,
      attendance: 82,
      revenue: 3000,
      serviceFee: 300,
      currency: "USDC",
      status: "completed",
    },
  ],
}

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

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
        <Button asChild>
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
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
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${organizerStats.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizerStats.totalAttendees}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizerStats.averageAttendance}%</div>
                <p className="text-xs text-muted-foreground">+3% from last month</p>
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
              <div className="space-y-4">
                {[...organizerEvents.upcoming, ...organizerEvents.past.slice(0, 2)].map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {event.registrations}/{event.capacity} registered
                        </span>
                        <span>${event.revenue} revenue</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {organizerEvents.upcoming.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription>
                            {event.date} at {event.time} • {event.location}
                          </CardDescription>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Registration Progress</span>
                          <span>
                            {event.registrations}/{event.capacity} (
                            {Math.round((event.registrations / event.capacity) * 100)}%)
                          </span>
                        </div>
                        <Progress value={(event.registrations / event.capacity) * 100} className="w-full" />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium">
                              ${event.revenue} {event.currency}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Spots Left: </span>
                            <span className="font-medium">{event.capacity - event.registrations}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Event
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button variant="outline" size="sm">
                            Check-in
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Past Events</h2>
              <div className="space-y-4">
                {organizerEvents.past.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription>
                            {event.date} at {event.time} • {event.location}
                          </CardDescription>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Registered: </span>
                          <span className="font-medium">{event.registrations}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Attended: </span>
                          <span className="font-medium">{event.attendance}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Attendance Rate: </span>
                          <span className="font-medium">
                            {Math.round((event.attendance! / event.registrations) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Your Fee: </span>
                          <span className="font-medium text-green-600">
                            ${event.serviceFee} {event.currency}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <span className="text-muted-foreground">Revenue chart placeholder</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Attendance Rates
                </CardTitle>
                <CardDescription>Average attendance by event type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tech Meetups</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Workshops</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Networking</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20" />
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>Events with highest attendance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizerEvents.past.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <Badge variant="secondary">{Math.round((event.attendance! / event.registrations) * 100)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Your earnings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Service Fees</span>
                    <span className="font-medium">$400 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-medium">-$40 USDC</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Net Earnings</span>
                    <span className="font-bold text-green-600">$360 USDC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
