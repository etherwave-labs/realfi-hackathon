"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  QrCode01Icon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  UserGroupIcon,
  Clock01Icon,
  DollarCircleIcon,
  ArrowLeft01Icon,
  Camera01Icon,
  UserCheck01Icon,
  AlertCircleIcon,
} from "hugeicons-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock event and attendee data
const eventData = {
  id: 1,
  title: "Web3 Developer Meetup",
  date: "Dec 15, 2024",
  time: "6:00 PM - 9:00 PM",
  location: "TechHub San Francisco",
  registrations: 45,
  capacity: 50,
  registrationFee: 25,
  currency: "USDC",
  status: "active",
}

const attendeeData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    walletAddress: "0x1234...5678",
    registrationId: "REG-2024-001",
    registeredAt: "2024-12-01T10:00:00Z",
    checkedIn: true,
    checkedInAt: "2024-12-15T18:05:00Z",
    avatar: "/placeholder.svg?key=alice",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    walletAddress: "0x2345...6789",
    registrationId: "REG-2024-002",
    registeredAt: "2024-12-02T14:30:00Z",
    checkedIn: true,
    checkedInAt: "2024-12-15T18:12:00Z",
    avatar: "/placeholder.svg?key=bob",
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol@example.com",
    walletAddress: "0x3456...7890",
    registrationId: "REG-2024-003",
    registeredAt: "2024-12-03T09:15:00Z",
    checkedIn: false,
    checkedInAt: null,
    avatar: "/placeholder.svg?key=carol",
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david@example.com",
    walletAddress: "0x4567...8901",
    registrationId: "REG-2024-004",
    registeredAt: "2024-12-04T16:45:00Z",
    checkedIn: false,
    checkedInAt: null,
    avatar: "/placeholder.svg?key=david",
  },
  {
    id: 5,
    name: "Eva Martinez",
    email: "eva@example.com",
    walletAddress: "0x5678...9012",
    registrationId: "REG-2024-005",
    registeredAt: "2024-12-05T11:20:00Z",
    checkedIn: true,
    checkedInAt: "2024-12-15T18:08:00Z",
    avatar: "/placeholder.svg?key=eva",
  },
]

export default function CheckInPage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [attendees, setAttendees] = useState(attendeeData)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedTab, setSelectedTab] = useState("all")
  const [isEventEnded, setIsEventEnded] = useState(false)

  const checkedInCount = attendees.filter((a) => a.checkedIn).length
  const attendanceRate = Math.round((checkedInCount / attendees.length) * 100)

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.registrationId.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedTab === "checked-in") return matchesSearch && attendee.checkedIn
    if (selectedTab === "not-checked-in") return matchesSearch && !attendee.checkedIn
    return matchesSearch
  })

  const handleCheckIn = (attendeeId: number) => {
    setAttendees((prev) =>
      prev.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
            }
          : attendee,
      ),
    )
  }

  const handleCheckOut = (attendeeId: number) => {
    setAttendees((prev) =>
      prev.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              checkedIn: false,
              checkedInAt: null,
            }
          : attendee,
      ),
    )
  }

  const handleQRScan = () => {
    setIsScanning(true)
    // Simulate QR code scanning
    setTimeout(() => {
      // Mock successful scan - check in the first unchecked attendee
      const uncheckedAttendee = attendees.find((a) => !a.checkedIn)
      if (uncheckedAttendee) {
        handleCheckIn(uncheckedAttendee.id)
      }
      setIsScanning(false)
    }, 2000)
  }

  const handleEndEvent = async () => {
    setIsEventEnded(true)
    // In real app, this would trigger smart contract to distribute refunds and bonuses
    console.log("Ending event and processing payments...")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-2xl hover:bg-accent/10">
          <Link href="/organizer/dashboard">
            <ArrowLeft01Icon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-gradient-primary">{eventData.title}</h1>
            <p className="text-muted-foreground text-lg">
              {eventData.date} • {eventData.time} • {eventData.location}
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-2xl border-2 border-accent/30 hover:border-accent hover:bg-accent/10 bg-transparent"
                >
                  <Camera01Icon className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Scan Attendee QR Code</DialogTitle>
                  <DialogDescription className="text-base">
                    Point your camera at the attendee's QR code to check them in
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-64 h-64 bg-card rounded-3xl flex items-center justify-center border-2 border-border/50">
                    {isScanning ? (
                      <div className="text-center">
                        <div className="animate-pulse">
                          <QrCode01Icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Scanning...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <QrCode01Icon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Camera view placeholder</p>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleQRScan} disabled={isScanning} className="w-full gradient-primary rounded-2xl">
                    {isScanning ? "Scanning..." : "Start Scanning"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {!isEventEnded && (
              <Button onClick={handleEndEvent} className="gradient-warm rounded-2xl font-semibold">
                End Event & Process Payments
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="rounded-3xl border-2 border-border/50 hover:border-accent/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <div className="h-8 w-8 rounded-2xl bg-accent/20 flex items-center justify-center">
              <UserGroupIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{attendees.length}</div>
            <p className="text-xs text-muted-foreground">of {eventData.capacity} capacity</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-border/50 hover:border-chart-3/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <div className="h-8 w-8 rounded-2xl bg-chart-3/20 flex items-center justify-center">
              <UserCheck01Icon className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">{checkedInCount}</div>
            <p className="text-xs text-muted-foreground">{attendanceRate}% attendance rate</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-border/50 hover:border-chart-5/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <div className="h-8 w-8 rounded-2xl bg-chart-5/20 flex items-center justify-center">
              <Cancel01Icon className="h-4 w-4 text-chart-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-5">{attendees.length - checkedInCount}</div>
            <p className="text-xs text-muted-foreground">
              ${(attendees.length - checkedInCount) * eventData.registrationFee} bonus pool
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-border/50 hover:border-chart-4/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Fee</CardTitle>
            <div className="h-8 w-8 rounded-2xl bg-chart-4/20 flex items-center justify-center">
              <DollarCircleIcon className="h-4 w-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">
              ${Math.round(attendees.length * eventData.registrationFee * 0.1)}
            </div>
            <p className="text-xs text-muted-foreground">10% service fee</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Progress */}
      <Card className="mb-8 rounded-3xl border-2 border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Attendance Progress</CardTitle>
          <CardDescription>Real-time check-in status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Check-in Progress</span>
              <span className="text-primary">
                {checkedInCount}/{attendees.length} ({attendanceRate}%)
              </span>
            </div>
            <Progress value={attendanceRate} className="w-full h-3 rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      {/* Event End Status */}
      {isEventEnded && (
        <Card className="mb-8 rounded-3xl border-2 border-chart-3/30 bg-chart-3/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-chart-3/20 flex items-center justify-center">
                <CheckmarkCircle01Icon className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold text-chart-3 text-lg">Event Ended Successfully</p>
                <p className="text-sm text-muted-foreground">
                  Payments have been processed. Attendees received refunds + bonuses, and your service fee has been
                  transferred.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendee Management */}
      <Card className="rounded-3xl border-2 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Attendee Management</CardTitle>
              <CardDescription className="text-base">Check in attendees and manage attendance</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search01Icon className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-2xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="all" className="rounded-2xl">
                All ({attendees.length})
              </TabsTrigger>
              <TabsTrigger value="checked-in" className="rounded-2xl">
                Checked In ({checkedInCount})
              </TabsTrigger>
              <TabsTrigger value="not-checked-in" className="rounded-2xl">
                Not Checked In ({attendees.length - checkedInCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-6 border-2 border-border/50 rounded-3xl hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg font-semibold">{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-lg">{attendee.name}</h4>
                          {attendee.checkedIn ? (
                            <Badge className="rounded-2xl bg-chart-3/20 text-chart-3 border-chart-3/30">
                              <CheckmarkCircle01Icon className="mr-1 h-3 w-3" />
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-2xl border-chart-5/30 text-chart-5">
                              <Clock01Icon className="mr-1 h-3 w-3" />
                              Not Checked In
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-1">{attendee.email}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {attendee.registrationId} • {attendee.walletAddress}
                        </p>
                        {attendee.checkedInAt && (
                          <p className="text-xs text-muted-foreground">
                            Checked in at {new Date(attendee.checkedInAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {attendee.checkedIn ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckOut(attendee.id)}
                          disabled={isEventEnded}
                          className="rounded-2xl border-chart-5/30 hover:bg-chart-5/10"
                        >
                          <Cancel01Icon className="mr-1 h-4 w-4" />
                          Check Out
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCheckIn(attendee.id)}
                          disabled={isEventEnded}
                          className="gradient-accent rounded-2xl"
                        >
                          <CheckmarkCircle01Icon className="mr-1 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredAttendees.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No attendees found matching your search</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
