"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, QrCode, Share2, Download } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  eventDate: string
  eventLocation: string
  transactionHash: string
  registrationId: string
}

export function ConfirmationModal({
  isOpen,
  onClose,
  eventTitle,
  eventDate,
  eventLocation,
  transactionHash,
  registrationId,
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle>Registration Confirmed!</DialogTitle>
            <DialogDescription>You're all set for the event. Here are your details:</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{eventTitle}</CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-3 w-3" />
                  {eventDate}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-3 w-3" />
                  {eventLocation}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Registration Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Registration ID</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {registrationId}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transaction</span>
              <Badge variant="outline" className="font-mono text-xs">
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
              </Badge>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Your Check-in QR Code</p>
                  <p className="text-xs text-muted-foreground">Show this at the event</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Remember:</strong> You'll receive your full registration fee back plus a 20% bonus if you attend.
              Make sure to check in at the event!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Save Ticket
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
