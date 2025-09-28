"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Loader2 } from "lucide-react"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: string) => void
  isConnecting: boolean
}

const wallets = [
  {
    name: "MetaMask",
    description: "Connect using browser extension",
    icon: "🦊",
    type: "metamask",
    popular: true,
  },
  {
    name: "WalletConnect",
    description: "Connect using mobile wallet",
    icon: "📱",
    type: "walletconnect",
    popular: true,
  },
  {
    name: "Coinbase Wallet",
    description: "Connect using Coinbase",
    icon: "🔵",
    type: "coinbase",
    popular: false,
  },
  {
    name: "Human Wallet",
    description: "Recommended for this platform",
    icon: "👤",
    type: "human",
    popular: true,
  },
]

export function WalletConnectModal({ isOpen, onClose, onConnect, isConnecting }: WalletConnectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose a wallet to connect and register for this event</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Card
              key={wallet.type}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => !isConnecting && onConnect(wallet.type)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        {wallet.name}
                        {wallet.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">{wallet.description}</CardDescription>
                    </div>
                  </div>
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
