"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Upload, QrCode, AlertTriangle } from "lucide-react"
import { useEventsStore } from "@/lib/events-store"
import { useAuthStore } from "@/lib/auth-store"
import { verifyQRCodeData, QRCodeData } from "@/lib/qr-code-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScanQRCodePage() {
  const { events, registrations, checkInUser } = useEventsStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  
  // Filtrer pour ne montrer que les événements dont l'utilisateur est l'organisateur
  const myEvents = useMemo(() => {
    if (!user?.address) return []
    return events.filter(
      (event) => event.organizer?.walletAddress?.toLowerCase() === user.address.toLowerCase()
    )
  }, [events, user?.address])
  const [scannedData, setScannedData] = useState<string>("")
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean
    data?: QRCodeData
    error?: string
    registration?: any
  } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedEventId) {
      alert("Please select an event first")
      return
    }

    try {
      const html5QrCode = await import("html5-qrcode").then((mod) => mod.Html5Qrcode)
      const qr = new html5QrCode("qr-reader", { verbose: false })

      const imageUrl = URL.createObjectURL(file)
      
      try {
        const text = await qr.scanFile(file, false)
        handleQRCodeResult(text)
      } catch (error) {
        setVerificationResult({
          valid: false,
          error: "Could not read QR code from image",
        })
      }
    } catch (error) {
      setVerificationResult({
        valid: false,
        error: "Error processing image",
      })
    }
  }

  const handleManualInput = () => {
    if (!selectedEventId) {
      alert("Please select an event first")
      return
    }

    if (!scannedData) {
      alert("Please paste QR code data")
      return
    }

    handleQRCodeResult(scannedData)
  }

  const handleQRCodeResult = (qrData: string) => {
    if (!selectedEventId) return

    const verification = verifyQRCodeData(qrData, selectedEventId)

    if (verification.valid && verification.data) {
      const registration = registrations.find(
        (reg) => reg.id === verification.data!.registrationId
      )

      setVerificationResult({
        ...verification,
        registration,
      })
    } else {
      setVerificationResult(verification)
    }
  }

  const handleCheckIn = () => {
    if (verificationResult?.data) {
      checkInUser(verificationResult.data.registrationId)
      alert(`✓ Check-in successful for ${verificationResult.data.registrationId}`)
      setVerificationResult(null)
      setScannedData("")
    }
  }

  // Rediriger si pas connecté
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>Vous devez être connecté pour scanner des QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connectez votre wallet pour accéder à cette page.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div id="qr-reader" style={{ display: "none" }}></div>

      <div className="mb-8">
        <Link href="/organizer/dashboard" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Scan QR Codes</h1>
        <p className="text-muted-foreground">Verify and check-in attendees for your events</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
            <CardDescription>Choose the event you want to verify QR codes for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent>
                {myEvents.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Vous n'avez pas encore créé d'événements
                  </SelectItem>
                ) : (
                  myEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {event.date}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedEventId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload QR Code Image</CardTitle>
                <CardDescription>Upload a screenshot or photo of the QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
                <CardDescription>Or paste the QR code data manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full h-32 p-3 text-sm border rounded-lg font-mono"
                  placeholder="Paste QR code data here..."
                  value={scannedData}
                  onChange={(e) => setScannedData(e.target.value)}
                />
                <Button onClick={handleManualInput} className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Verify QR Code
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {verificationResult && (
          <Card className={verificationResult.valid ? "border-green-500" : "border-destructive"}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <CardTitle>
                  {verificationResult.valid ? "Valid QR Code ✓" : "Invalid QR Code"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationResult.valid && verificationResult.data ? (
                <>
                  <div className="bg-green-500/10 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registration ID</span>
                      <Badge variant="secondary">{verificationResult.data.registrationId}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wallet Address</span>
                      <code className="text-xs">
                        {verificationResult.data.userAddress.slice(0, 10)}...
                      </code>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Transaction</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${verificationResult.data.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View on Explorer
                      </a>
                    </div>
                    {verificationResult.registration && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Amount Paid</span>
                          <span className="font-semibold">
                            {verificationResult.registration.amount}{" "}
                            {verificationResult.registration.currency}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Check-in Status</span>
                          <Badge variant={verificationResult.registration.checkedIn ? "secondary" : "default"}>
                            {verificationResult.registration.checkedIn ? "Already Checked In" : "Not Checked In"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {verificationResult.registration && !verificationResult.registration.checkedIn && (
                    <Button onClick={handleCheckIn} className="w-full" size="lg">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check In Attendee
                    </Button>
                  )}
                </>
              ) : (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Verification Failed</p>
                      <p className="text-sm text-destructive/80 mt-1">
                        {verificationResult.error || "QR code is not valid for this event"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={() => {
                setVerificationResult(null)
                setScannedData("")
              }} className="w-full">
                Scan Another QR Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

