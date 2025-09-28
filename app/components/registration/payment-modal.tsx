"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Wallet, ArrowRight, Loader2, AlertCircle } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  eventTitle: string
  price: number
  currency: string
  walletAddress: string
  isProcessing: boolean
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  price,
  currency,
  walletAddress,
  isProcessing,
}: PaymentModalProps) {
  const [selectedToken, setSelectedToken] = useState("USDC")

  const tokens = [
    { symbol: "USDC", name: "USD Coin", balance: "1,250.00", icon: "💵" },
    { symbol: "USDT", name: "Tether USD", balance: "890.50", icon: "💰" },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "2,100.75", icon: "🟡" },
  ]

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken)
  const hasEnoughBalance = selectedTokenData && Number.parseFloat(selectedTokenData.balance.replace(",", "")) >= price

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
          <DialogDescription>Review your registration details and complete payment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{eventTitle}</CardTitle>
              <CardDescription>Registration Fee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total</span>
                <span>
                  {price} {currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          {/* Token Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Payment Token</h3>
            <div className="space-y-2">
              {tokens.map((token) => (
                <Card
                  key={token.symbol}
                  className={`cursor-pointer transition-colors ${
                    selectedToken === token.symbol ? "ring-2 ring-primary" : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedToken(token.symbol)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{token.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{token.balance}</p>
                        <p className="text-xs text-muted-foreground">Balance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Balance Warning */}
          {!hasEnoughBalance && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Insufficient balance for selected token</p>
            </div>
          )}

          {/* Payment Terms */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Refund Policy:</strong> Full refund + 20% bonus if you attend the event
            </p>
            <p>
              <strong>No-show Policy:</strong> No refund if you don't attend
            </p>
            <p>
              <strong>Smart Contract:</strong> Payments are processed automatically via smart contract
            </p>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1" disabled={!hasEnoughBalance || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {price} {selectedToken}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
