"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import { Download, CheckCircle } from "lucide-react"
import { generateQRCodeData } from "@/lib/qr-code-utils"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  registrationId: string
  eventId: string
  eventTitle: string
  userAddress: string
  transactionHash: string
  eventDate: string
}

export function QRCodeModal({
  isOpen,
  onClose,
  registrationId,
  eventId,
  eventTitle,
  userAddress,
  transactionHash,
  eventDate,
}: QRCodeModalProps) {
  // Mémoriser le QR code pour qu'il ne change pas à chaque rendu
  const qrData = useMemo(
    () => generateQRCodeData(registrationId, eventId, userAddress, transactionHash),
    [registrationId, eventId, userAddress, transactionHash]
  )

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-${registrationId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Event QR Code</DialogTitle>
          <DialogDescription className="text-center">
            Show this QR code at the event entrance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="text-center space-y-1">
                  <p className="font-semibold text-lg">{eventTitle}</p>
                  <p className="text-sm text-muted-foreground">{eventDate}</p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-xs font-medium">
                    Valid Registration - Payment Confirmed
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Registration ID: {registrationId}</p>
                <p className="truncate">Transaction: {transactionHash.slice(0, 20)}...</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-600 dark:text-blue-400">
            <p><strong>Important:</strong> Save this QR code to your device. You'll need to show it at the event entrance to check in and receive your refund + bonus.</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

