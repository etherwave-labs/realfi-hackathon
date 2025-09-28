"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Clock, Wallet, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { WalletConnectModal } from "@/components/registration/wallet-connect-modal"
import { PaymentModal } from "@/components/registration/payment-modal"
import { ConfirmationModal } from "@/components/registration/confirmation-modal"

// Mock event data (in real app, this would come from API/database)
const mockEvent = {
  id: 1,
  title: "Web3 Developer Meetup",
  description:
    "Join us for an exciting evening of learning about the latest developments in blockchain technology and Web3. This meetup is perfect for developers of all levels who are interested in decentralized applications, smart contracts, and the future of the internet.\n\nWe'll cover topics including:\n• Latest trends in DeFi and NFTs\n• Smart contract development best practices\n• Building dApps with modern frameworks\n• Networking opportunities with industry professionals\n\nLight refreshments will be provided. Don't miss this opportunity to connect with the vibrant Web3 community in San Francisco!",
  category: "Tech Meetup",
  date: "Dec 15, 2024",
  time: "6:00 PM - 9:00 PM",
  location: "TechHub San Francisco, 123 Market Street, San Francisco, CA 94105",
  price: 25,
  currency: "USDC",
  attendees: 45,
  capacity: 50,
  organizer: {
    name: "SF Web3 Community",
    avatar: "/organizer-avatar.jpg",
    verified: true,
  },
  image: "/web3-developer-meetup-event.jpg",
  tags: ["Web3", "Blockchain", "DeFi", "Smart Contracts", "Networking"],
  refundPolicy: "Full refund + 20% bonus if you attend. No refund for no-shows.",
  requirements: "Bring your laptop and be ready to learn!",
}

export default function EventDetailPage() {
  const params = useParams()
  const [registrationStep, setRegistrationStep] = useState<"idle" | "wallet" | "payment" | "confirmation">("idle")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionHash, setTransactionHash] = useState("")

  const handleStartRegistration = () => {
    setRegistrationStep("wallet")
  }

  const handleWalletConnect = async (walletType: string) => {
    setIsConnecting(true)
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
    setIsConnecting(false)
    setRegistrationStep("payment")
  }

  const handlePaymentConfirm = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setTransactionHash("0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890")
    setIsProcessing(false)
    setRegistrationStep("confirmation")
  }

  const handleCloseModals = () => {
    setRegistrationStep("idle")
    setIsConnecting(false)
    setIsProcessing(false)
  }

  const spotsLeft = mockEvent.capacity - mockEvent.attendees

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img
              src={mockEvent.image || "/placeholder.svg"}
              alt={mockEvent.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Event Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{mockEvent.category}</Badge>
              {mockEvent.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">{mockEvent.title}</h1>

            {/* Event Meta */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {mockEvent.date}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {mockEvent.time}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {mockEvent.location}
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {mockEvent.attendees}/{mockEvent.capacity} registered
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About This Event</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {mockEvent.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <p className="text-muted-foreground">{mockEvent.requirements}</p>
          </div>

          {/* Organizer */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Organizer</h2>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={mockEvent.organizer.avatar || "/placeholder.svg"} />
                <AvatarFallback>{mockEvent.organizer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mockEvent.organizer.name}</span>
                  {mockEvent.organizer.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Registration</span>
                <span className="text-2xl font-bold">
                  {mockEvent.price} {mockEvent.currency}
                </span>
              </CardTitle>
              <CardDescription>
                {spotsLeft > 0 ? (
                  <span className="text-green-600">{spotsLeft} spots left</span>
                ) : (
                  <span className="text-red-600">Event is full</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Refund Policy:</strong>
                </p>
                <p>{mockEvent.refundPolicy}</p>
              </div>
              <Separator />
              <Button className="w-full" size="lg" onClick={handleStartRegistration} disabled={spotsLeft === 0}>
                <Wallet className="mr-2 h-4 w-4" />
                {spotsLeft > 0 ? "Register Now" : "Event Full"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Connect your wallet to complete registration</p>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Copy Link
              </Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{mockEvent.location}</p>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Map placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WalletConnectModal
        isOpen={registrationStep === "wallet"}
        onClose={handleCloseModals}
        onConnect={handleWalletConnect}
        isConnecting={isConnecting}
      />

      <PaymentModal
        isOpen={registrationStep === "payment"}
        onClose={handleCloseModals}
        onConfirm={handlePaymentConfirm}
        eventTitle={mockEvent.title}
        price={mockEvent.price}
        currency={mockEvent.currency}
        walletAddress={walletAddress}
        isProcessing={isProcessing}
      />

      <ConfirmationModal
        isOpen={registrationStep === "confirmation"}
        onClose={handleCloseModals}
        eventTitle={mockEvent.title}
        eventDate={mockEvent.date}
        eventLocation={mockEvent.location}
        transactionHash={transactionHash}
        registrationId="REG-2024-001"
      />
    </div>
  )
}
