"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import type { EventOrganizer } from "@/lib/events-store"

interface OrganizerInfoCardProps {
  organizer: EventOrganizer
}

export function OrganizerInfoCard({ organizer }: OrganizerInfoCardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (organizer?.walletAddress) {
      try {
        await navigator.clipboard.writeText(organizer.walletAddress)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error("Failed to copy address:", error)
      }
    }
  }

  const formatAddress = (address?: string) => {
    if (!address || address.length < 10) return "N/A"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!organizer) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>About the Organizer</CardTitle>
          {organizer.verified && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              ✓ Verified
            </Badge>
          )}
        </div>
        <CardDescription>Event organizer information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{organizer?.name || "Unknown Organizer"}</p>
        </div>
        
        {organizer?.walletAddress ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Payment Wallet</p>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <code className="text-xs font-mono">
                {formatAddress(organizer.walletAddress)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="ml-2 h-8 w-8 p-0"
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💰 All payments for this event will be sent directly to this wallet address
            </p>
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
              <p className="text-green-600 dark:text-green-400">
                ✅ Full address: <code className="font-mono">{organizer.walletAddress}</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive">
              ⚠️ <strong>No wallet address set for this organizer.</strong><br/>
              If you're the organizer, please create a new event while connected with your wallet.
            </p>
          </div>
        )}

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Note:</strong> Each organizer receives payments directly to their own wallet. 
            Your registration fee will be sent to the address shown above.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
