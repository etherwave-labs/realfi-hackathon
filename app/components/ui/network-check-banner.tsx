"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { getEthereumProvider } from "@/lib/payment-service"

export function NetworkCheckBanner() {
  const [currentNetwork, setCurrentNetwork] = useState<string>("")
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkNetwork = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== "undefined" && window.silk) {
        try {
          const chainIdHex = await window.silk.request({ method: "eth_chainId" })
          const chainId = parseInt(chainIdHex, 16)
          
          const networkNames: { [key: number]: string } = {
            1: "Ethereum Mainnet ❌",
            5: "Goerli Testnet",
            11155111: "Ethereum Sepolia ✅",
            137: "Polygon Mainnet ❌",
            80001: "Mumbai Testnet",
            421614: "Arbitrum Sepolia",
          }
          
          const networkName = networkNames[chainId] || `Unknown Network (Chain ID: ${chainId})`
          setCurrentNetwork(networkName)
          setIsCorrectNetwork(chainId === 11155111)
          
          return
        } catch (silkError) {
          console.error("Error with window.silk:", silkError)
        }
      }
      
      const provider = getEthereumProvider()
      if (provider) {
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
        
        const networkNames: { [key: number]: string } = {
          1: "Ethereum Mainnet ❌",
          5: "Goerli Testnet",
          11155111: "Ethereum Sepolia ✅",
          137: "Polygon Mainnet ❌",
          80001: "Mumbai Testnet",
          421614: "Arbitrum Sepolia",
        }
        
        const networkName = networkNames[chainId] || `Unknown Network (Chain ID: ${chainId})`
        setCurrentNetwork(networkName)
        setIsCorrectNetwork(chainId === 11155111)
      } else {
        setCurrentNetwork("❌ No wallet connected")
      }
    } catch (error) {
      console.error("❌ Error checking network:", error)
      setCurrentNetwork("❌ Unable to detect network")
      setIsCorrectNetwork(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkNetwork()
    
    const provider = getEthereumProvider()
    if (provider && typeof window !== "undefined") {
      const handleChainChanged = () => {
        checkNetwork()
      }
      
      if (window.silk) {
        window.silk.on("chainChanged", handleChainChanged)
        
        return () => {
          if (window.silk?.removeListener) {
            window.silk.removeListener("chainChanged", handleChainChanged)
          }
        }
      }
    }
  }, [])

  if (isLoading) {
    return (
      <Card className="mb-4 border-blue-500/50">
        <CardContent className="p-4 flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <div>
            <p className="font-semibold">Checking network...</p>
            <p className="text-sm text-muted-foreground">Verifying your wallet's network connection...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isCorrectNetwork) {
    return (
      <Card className="mb-4 border-green-500/50 bg-green-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="font-semibold text-green-600">✅ Correct Network</p>
            <p className="text-sm text-green-600/80">
              Connected to <strong>{currentNetwork}</strong>. You can make transactions.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={checkNetwork}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-destructive bg-destructive/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-destructive">❌ Wrong Network Detected!</p>
            <p className="text-sm">
              You are on <strong>{currentNetwork}</strong>, but this app requires{" "}
              <strong>Ethereum Sepolia Testnet</strong>.
            </p>
          </div>
        </div>
        
        <div className="bg-destructive/20 p-3 rounded-md text-sm space-y-2 border border-destructive/30">
          <p className="font-semibold">📝 How to change network in Human Wallet:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
            <li>Open Human Wallet (click on your profile in the top right)</li>
            <li>Look for the "Network" selector</li>
            <li>Select <strong>"Ethereum Sepolia"</strong> or <strong>"Sepolia"</strong></li>
            <li>Confirm the network change</li>
            <li>Reload this page</li>
          </ol>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={checkNetwork}
          className="w-full"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Recheck Network
        </Button>
      </CardContent>
    </Card>
  )
}
