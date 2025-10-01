"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: () => void
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const { isConnecting, login } = useAuthStore()

  const handleConnectHumanWallet = async () => {
    try {
      await login()
      onConnect()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Connect your wallet to register for this event</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Card
            className="cursor-pointer hover:bg-accent transition-colors border-2 border-primary/30"
            onClick={() => !isConnecting && handleConnectHumanWallet()}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      Human Wallet
                      <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                        Recommended
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Sign in with email, phone or social accounts
                    </CardDescription>
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or coming soon</span>
            </div>
          </div>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🦊</span>
                  <div>
                    <CardTitle className="text-sm">MetaMask</CardTitle>
                    <CardDescription className="text-xs">Connect using browser extension</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <CardTitle className="text-sm">WalletConnect</CardTitle>
                    <CardDescription className="text-xs">Connect using mobile wallet</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
