"use client"

import { useState } from "react"
import { sendUSDCPayment, getEthereumProvider, type PaymentParams } from "@/lib/payment-service"
import { useAuthStore } from "@/lib/auth-store"

export interface UsePaymentResult {
  sendPayment: (recipientAddress: string, amountUSDC: number) => Promise<{
    success: boolean
    transactionHash?: string
    error?: string
  }>
  isProcessing: boolean
  error: string | null
}

export function usePayment(): UsePaymentResult {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const sendPayment = async (recipientAddress: string, amountUSDC: number) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Vérifier que l'utilisateur est connecté
      if (!user) {
        throw new Error("Please connect your wallet first")
      }

      // Obtenir le provider Ethereum
      const provider = getEthereumProvider()
      if (!provider) {
        throw new Error("No Ethereum provider found. Please install MetaMask or connect with Human Wallet.")
      }

      // Effectuer le paiement
      const result = await sendUSDCPayment({
        recipientAddress,
        amountUSDC,
        provider,
      })

      if (!result.success) {
        setError(result.error || "Payment failed")
      }

      return result
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during payment"
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    sendPayment,
    isProcessing,
    error,
  }
}

