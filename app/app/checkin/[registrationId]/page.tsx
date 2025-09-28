"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, QrCode, Calendar, MapPin, Clock, AlertCircle } from "lucide-react"
import { useParams } from "next/navigation"

// Mock registration data
const registrationData = {
  id: "REG-2024-001",
  attendeeName: "Alice Johnson",
  eventTitle: "Web3 Developer Meetup",
  eventDate: "Dec 15, 2024",
  eventTime: "6:00 PM - 9:00 PM",
  eventLocation: "TechHub San Francisco, 123 Market Street, San Francisco, CA",
  registrationFee: 25,
  currency: "USDC",
  checkedIn: false,
  qrCode: "QR123456789",
}

export default function AttendeeCheckInPage() {
  const params = useParams()
  const [isCheckedIn, setIsCheckedIn] = useState(registrationData.checkedIn)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)

  const handleCheckIn = () => {
    setIsCheckedIn(true)
    setCheckInTime(new Date().toLocaleString())
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Event Check-In</h1>
        <p className="text-muted-foreground">Verify your attendance to receive your refund and bonus</p>
      </div>

      {/* QR Code Display */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Your Check-In QR Code</p>
              <p className="text-sm text-muted-foreground">Show this to the event organizer</p>
              <Badge variant="outline" className="mt-2 font-mono">
                {registrationData.qrCode}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{registrationData.eventTitle}</CardTitle>
          <CardDescription>Registration ID: {registrationData.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              {registrationData.eventDate}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              {registrationData.eventTime}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              {registrationData.eventLocation}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-In Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Check-In Status</CardTitle>
          <CardDescription>Your current attendance status for this event</CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckedIn ? (
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Successfully Checked In!</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Checked in at {checkInTime}. You'll receive your refund + bonus after the event ends.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Not Checked In Yet</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Show your QR code to the organizer to check in and secure your refund.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Details about your registration fee and potential refund</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Registration Fee Paid</span>
              <span className="font-medium">
                {registrationData.registrationFee} {registrationData.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Refund (if attended)</span>
              <span className="font-medium">
                {registrationData.registrationFee} {registrationData.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bonus (from no-shows)</span>
              <span className="font-medium text-green-600">
                +{Math.round(registrationData.registrationFee * 0.2)} {registrationData.currency}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Total if Attended</span>
                <span className="font-bold text-green-600">
                  {registrationData.registrationFee + Math.round(registrationData.registrationFee * 0.2)}{" "}
                  {registrationData.currency}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> Your registration fee is held in a smart contract. If you attend and check
              in, you get your full fee back plus a bonus funded by no-shows. If you don't attend, your fee goes to the
              bonus pool for attendees.
            </p>
          </div>

          {!isCheckedIn && (
            <Button onClick={handleCheckIn} className="w-full mt-4">
              <CheckCircle className="mr-2 h-4 w-4" />
              Simulate Check-In (Demo)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
