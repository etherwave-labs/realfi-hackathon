"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth-store"
import { getUSDCBalance, getEthereumProvider } from "@/lib/payment-service"
import { Copy, Check, ExternalLink, RefreshCw, Wallet as WalletIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"
import { ethers } from "ethers"

export default function WalletPage() {
  const { user } = useAuthStore()
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [ethBalance, setEthBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [networkName, setNetworkName] = useState<string>("Unknown")

  const loadBalances = async () => {
    if (!user?.address) return

    setIsLoading(true)
    try {
      const provider = getEthereumProvider()
      if (provider) {
        // Charger le solde USDC
        const usdc = await getUSDCBalance(user.address, provider)
        setUsdcBalance(usdc)

        // Charger le solde ETH
        const ethBal = await provider.getBalance(user.address)
        setEthBalance(ethers.formatEther(ethBal))

        // Obtenir le nom du réseau
        const network = await provider.getNetwork()
        setNetworkName(network.name || `Chain ID: ${network.chainId}`)
      }
    } catch (error) {
      console.error("Error loading balances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBalances()
  }, [user])

  const handleCopyAddress = async () => {
    if (user?.address) {
      await navigator.clipboard.writeText(user.address)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to view your balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Go back to the home page and click "Connect Wallet" to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Wallet</h1>
            <p className="text-muted-foreground">Manage your crypto assets and view your balance</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadBalances}
            disabled={isLoading}
            className="rounded-2xl"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Address Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <WalletIcon className="h-5 w-5 mr-2" />
              Wallet Address
            </CardTitle>
            <CardDescription>Your unique blockchain address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono">{user.address}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="ml-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG value={user.address} size={200} level="H" />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Scan this QR code to send funds to this wallet
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {networkName}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* USDC Balance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>USDC Balance</CardTitle>
              <span className="text-3xl">💵</span>
            </div>
            <CardDescription>USD Coin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  <span>{parseFloat(usdcBalance).toFixed(2)} USDC</span>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Contract: <code className="text-xs">0x1c7D...9C73</code>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Testnet USDC
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETH Balance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ETH Balance</CardTitle>
              <span className="text-3xl">⟠</span>
            </div>
            <CardDescription>Ethereum (for gas fees)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  <span>{parseFloat(ethBalance).toFixed(4)} ETH</span>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Used for transaction gas fees
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href="https://sepoliafaucet.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Testnet ETH
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common wallet operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" asChild>
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/my-events">
                  My Registrations
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://sepolia.etherscan.io/address/${user.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/organizer/dashboard">
                  Organizer Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

