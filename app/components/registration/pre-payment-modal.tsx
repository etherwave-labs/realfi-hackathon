"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowRight, Info, Wallet } from "lucide-react"

interface PrePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  eventTitle: string
  price: number
  currency: string
  organizerAddress: string
}

export function PrePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  price,
  currency,
  organizerAddress,
}: PrePaymentModalProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Review your transaction details before continuing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Event</span>
                <span className="font-medium text-right max-w-[200px] truncate">{eventTitle}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {price} {currency}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recipient</span>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {formatAddress(organizerAddress)}
                </code>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium">Ethereum Sepolia</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                    ⚠️ Important: About the Display
                  </p>
                  <p className="text-xs text-yellow-600/90 dark:text-yellow-500/90 leading-relaxed">
                    Human Wallet will display <strong>"$0"</strong> in its confirmation window. 
                    This is <strong>NORMAL</strong> and does NOT mean the transaction is free!
                  </p>
                  <div className="bg-yellow-500/10 p-2 rounded text-xs space-y-1">
                    <p className="font-semibold">💡 Why?</p>
                    <p className="text-yellow-600/80 dark:text-yellow-500/80">
                      Human Wallet only displays the amount of ETH being sent. Since we're sending{" "}
                      <strong>USDC tokens</strong> (not ETH), it shows $0. But the{" "}
                      <strong>{price} USDC will be transferred</strong>!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <strong>What will happen:</strong>
                  </p>
                  <ol className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-1 list-decimal list-inside">
                    <li>Human Wallet will open (showing "$0" - this is normal)</li>
                    <li>You will confirm the transaction</li>
                    <li>The <strong>{price} USDC</strong> will be sent to the organizer</li>
                    <li>You will receive a success confirmation</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              I understand, continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
