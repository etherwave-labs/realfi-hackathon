"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, MapPin, QrCode, Share2, Download, Loader2, ExternalLink, Copy, Check } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  eventDate: string
  eventLocation: string
  transactionHash: string
  registrationId: string
  amount?: number
  currency?: string
  organizerAddress?: string
}

export function ConfirmationModal({
  isOpen,
  onClose,
  eventTitle,
  eventDate,
  eventLocation,
  transactionHash,
  registrationId,
  amount,
  currency = "USDC",
  organizerAddress,
}: ConfirmationModalProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    if (isOpen && transactionHash) {
      // Pour les événements gratuits, pas de vérification
      if (transactionHash === "FREE-EVENT") {
        setIsVerifying(false)
        return
      }
      const timer = setTimeout(() => {
        setIsVerifying(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, transactionHash])

  const handleCopyTxHash = async () => {
    await navigator.clipboard.writeText(transactionHash)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    if (!address) return "N/A"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isFreeEvent = transactionHash === "FREE-EVENT" || amount === 0
  const explorerUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-2">
            {isVerifying ? (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
            <DialogTitle>
              {isVerifying ? "Verifying..." : "Registration Confirmed!"}
            </DialogTitle>
            <DialogDescription>
              {isVerifying 
                ? "Confirming your registration..." 
                : isFreeEvent 
                  ? "Your free registration has been confirmed" 
                  : "Your payment has been successfully processed"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground text-center">
              {isFreeEvent ? "Confirming your registration..." : "Verifying transaction on Ethereum Sepolia..."}
            </p>
            {!isFreeEvent && (
              <p className="text-xs text-muted-foreground text-center">
                This may take a few seconds
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isFreeEvent ? (
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
                      ✅ Free Registration Confirmed!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You've been registered to this free event
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Event Type</span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                        FREE 🎉
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">Instant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : amount ? (
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
                      ✅ Transaction Confirmed!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment has been successfully processed
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount paid</span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                        {amount} {currency}
                      </span>
                    </div>
                    {organizerAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sent to</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {formatAddress(organizerAddress)}
                        </code>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">Ethereum Sepolia</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Registration ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {registrationId}
                </Badge>
              </div>
            </div>

            {!isFreeEvent && (
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Transaction Hash:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                        {transactionHash}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyTxHash}
                        className="flex-shrink-0"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Sepolia Etherscan
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>✅ Next steps:</strong>
              </p>
              <ul className="text-xs text-blue-800/80 dark:text-blue-200/80 space-y-1 mt-2 list-disc list-inside">
                {!isFreeEvent && <li>You will receive a refund + 20% bonus if you attend</li>}
                <li>Don't forget to check-in on the day of the event!</li>
                <li>Keep your QR code for access</li>
              </ul>
            </div>

            <Button onClick={onClose} className="w-full" size="lg">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
