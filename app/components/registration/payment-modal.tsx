"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Wallet, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"
import { getUSDCBalance, getEthereumProvider } from "@/lib/payment-service"
import { switchToArbitrumSepolia, ensureArbitrumSepolia } from "@/lib/network-utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (transactionHash: string) => void
  eventTitle: string
  price: number
  currency: string
  walletAddress: string
  organizerWalletAddress: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  price,
  currency,
  walletAddress,
  organizerWalletAddress,
}: PaymentModalProps) {
  const { sendPayment, isProcessing, error } = usePayment()
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [ethBalance, setEthBalance] = useState<string>("0")

  // Charger les soldes USDC et ETH de l'utilisateur
  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress && isOpen) {
        try {
          const provider = getEthereumProvider()
          if (provider) {
            // Charger USDC
            const usdc = await getUSDCBalance(walletAddress, provider)
            setUsdcBalance(usdc)
            
            // Charger ETH (pour les gas fees)
            const eth = await provider.getBalance(walletAddress)
            const ethers = await import("ethers")
            setEthBalance(ethers.formatEther(eth))
          } else {
            setUsdcBalance("N/A")
            setEthBalance("N/A")
          }
        } catch (err) {
          console.error("Error loading balances:", err)
          setUsdcBalance("Error")
          setEthBalance("Error")
        }
      }
    }
    loadBalances()
  }, [walletAddress, isOpen])

  const isWrongNetwork = usdcBalance.includes("Wrong Network") || usdcBalance === "N/A"
  const hasEnoughBalance = !isWrongNetwork && parseFloat(usdcBalance) >= price
  const hasEnoughEth = parseFloat(ethBalance) >= 0.001 // Minimum 0.001 ETH requis pour les gas
  const hasValidOrganizerAddress = organizerWalletAddress && organizerWalletAddress !== "" && organizerWalletAddress.length === 42 && organizerWalletAddress.startsWith("0x")

  const handleSwitchNetwork = async () => {
    const switched = await switchToArbitrumSepolia()
    if (switched) {
      // Recharger le solde après avoir changé de réseau
      const provider = getEthereumProvider()
      if (provider && walletAddress) {
        const balance = await getUSDCBalance(walletAddress, provider)
        setUsdcBalance(balance)
      }
    }
  }

  const handlePayment = async () => {
    try {
      console.log("🔍 Starting payment process...")
      console.log("📍 Organizer wallet address:", organizerWalletAddress)
      console.log("💰 Amount:", price, "USDC")
      
      // Vérifier que l'adresse de l'organisateur est valide
      if (!organizerWalletAddress || organizerWalletAddress === "") {
        console.error("❌ No organizer wallet address provided!")
        alert("Erreur: Aucune adresse de wallet pour l'organisateur")
        return
      }

      // FORCER le switch vers Ethereum Sepolia AVANT toute transaction
      console.log("🌐 Forcing switch to Ethereum Sepolia...")
      
      // Vérifier le réseau actuel
      const provider = getEthereumProvider()
      if (provider) {
        const network = await provider.getNetwork()
        const currentChainId = Number(network.chainId)
        console.log("Current Chain ID:", currentChainId)
        
        if (currentChainId !== 11155111) {
          console.log("⚠️ Wrong network! Switching to Ethereum Sepolia...")
          const switched = await ensureArbitrumSepolia()
          
          if (!switched) {
            alert("⚠️ Veuillez basculer manuellement sur le réseau Ethereum Sepolia dans votre wallet !")
            return
          }
          
          // Attendre un peu que le réseau soit bien changé
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          console.log("✅ Already on Ethereum Sepolia")
        }
      }

      console.log("✅ Network OK, sending payment...")
      
      // 🔥 IMPORTANT : Fermer cette modal AVANT d'ouvrir Human Wallet
      // Cela évite que cette modal bloque les clics sur Human Wallet
      onClose()
      
      // Petit délai pour permettre à la modal de se fermer proprement
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const result = await sendPayment(organizerWalletAddress, price)
      
      if (result.success && result.transactionHash) {
        console.log("✅ Payment successful! TX:", result.transactionHash)
        onConfirm(result.transactionHash)
      } else {
        console.error("❌ Payment failed:", result.error)
        // Si échec, on pourrait réouvrir la modal ou afficher l'erreur autrement
        alert(`❌ Paiement échoué: ${result.error}`)
      }
    } catch (err) {
      console.error("❌ Payment error:", err)
      alert(`❌ Erreur: ${err instanceof Error ? err.message : "Paiement échoué"}`)
    }
  }

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

          {/* USDC Payment Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-medium">USD Coin (USDC)</p>
                    <p className="text-xs text-muted-foreground">Ethereum Sepolia Testnet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{usdcBalance} USDC</p>
                  <p className="text-xs text-muted-foreground">Your Balance</p>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="text-xs text-muted-foreground space-y-2">
                <div>
                  <p>Organizer receives: {price} USDC</p>
                  <p className="mt-1 font-mono text-[10px]">
                    {organizerWalletAddress.slice(0, 10)}...{organizerWalletAddress.slice(-8)}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs">⛽ ETH Balance (for gas): <span className="font-medium">{parseFloat(ethBalance).toFixed(4)} ETH</span></p>
                  {parseFloat(ethBalance) === 0 && (
                    <p className="text-destructive text-xs mt-1">
                      ⚠️ You need ETH for transaction fees!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="flex flex-col space-y-3 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-semibold">Wrong Network</p>
              </div>
              <p className="text-xs">
                Please switch your wallet to <strong>Ethereum Sepolia</strong> testnet to continue.
              </p>
              <div className="text-xs space-y-1 mt-2 bg-yellow-500/5 p-2 rounded">
                <p><strong>Network:</strong> Ethereum Sepolia</p>
                <p><strong>Chain ID:</strong> 11155111</p>
                <p><strong>RPC:</strong> https://rpc.sepolia.org</p>
              </div>
              <Button
                onClick={handleSwitchNetwork}
                variant="outline"
                size="sm"
                className="w-full mt-2 border-yellow-500/30 hover:bg-yellow-500/20"
              >
                Switch to Ethereum Sepolia
              </Button>
            </div>
          )}

          {/* Organizer Address Warning */}
          {!hasValidOrganizerAddress && (
            <div className="flex flex-col space-y-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-semibold">❌ Impossible de procéder au paiement</p>
              </div>
              <p className="text-xs">
                <strong>Adresse de l'organisateur manquante ou invalide.</strong><br/>
                Pour des raisons de sécurité, nous ne pouvons pas traiter ce paiement.
              </p>
              <p className="text-xs mt-2 bg-destructive/5 p-2 rounded">
                💡 <strong>Si vous êtes l'organisateur :</strong> Créez un nouvel événement en étant connecté avec votre wallet.
              </p>
            </div>
          )}

          {/* Balance Warning */}
          {!hasEnoughBalance && !isWrongNetwork && hasValidOrganizerAddress && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Insufficient USDC balance. Need {price} USDC.</p>
            </div>
          )}

          {/* ETH Gas Warning */}
          {parseFloat(ethBalance) === 0 && !isWrongNetwork && hasValidOrganizerAddress && (
            <div className="flex flex-col space-y-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-semibold">⛽ No ETH for Gas Fees</p>
              </div>
              <p className="text-xs">
                You need ETH to pay for transaction fees (gas) on Ethereum Sepolia, even when sending USDC.
              </p>
              <a 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                Get free testnet ETH from Sepolia Faucet →
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
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
            <Button onClick={handlePayment} className="flex-1" disabled={!hasEnoughBalance || !hasEnoughEth || isProcessing || !hasValidOrganizerAddress}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {price} USDC
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
