"use client"

import { useState, useCallback } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { getEthereumProvider } from "@/lib/payment-service"
import {
  createEventOnChain,
  purchaseTicketOnChain,
  markAttendanceOnChain,
  markAttendanceBatchOnChain,
  finalizeEventOnChain,
  withdrawRedistributionOnChain,
  cancelEventOnChain,
  getEventInfoOnChain,
  getParticipantInfoOnChain,
  getEventStatsOnChain,
  calculatePotentialRedistributionOnChain,
  type EscrowEventInfo,
  type EscrowParticipantInfo,
  type EscrowEventStats,
} from "@/lib/escrow-contract"

export interface UseEscrowResult {
  createEvent: (
    eventId: string,
    ticketPriceUSDC: number,
    eventEndTimestamp: number,
    redistributionPercentage: number
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>

  purchaseTicket: (
    eventId: string,
    ticketPriceUSDC: number
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>

  markAttendance: (
    eventId: string,
    participantAddress: string
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>

  markAttendanceBatch: (
    eventId: string,
    participantAddresses: string[]
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>

  finalizeEvent: (eventId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>

  withdrawRedistribution: (eventId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>

  cancelEvent: (eventId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>

  getEventInfo: (eventId: string) => Promise<EscrowEventInfo | null>
  getParticipantInfo: (eventId: string, participantAddress: string) => Promise<EscrowParticipantInfo | null>
  getEventStats: (eventId: string) => Promise<EscrowEventStats | null>
  calculatePotentialRedistribution: (eventId: string, participantAddress: string) => Promise<bigint | null>

  isProcessing: boolean
  error: string | null
}

export function useEscrow(): UseEscrowResult {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const getProvider = useCallback(() => {
    const provider = getEthereumProvider()
    if (!provider) {
      throw new Error("No Ethereum provider found. Please connect your wallet.")
    }
    return provider
  }, [])

  const createEvent = useCallback(
    async (eventId: string, ticketPriceUSDC: number, eventEndTimestamp: number, redistributionPercentage: number) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await createEventOnChain(eventId, ticketPriceUSDC, eventEndTimestamp, redistributionPercentage, provider)

        if (!result.success) {
          setError(result.error || "Failed to create event on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while creating event"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const purchaseTicket = useCallback(
    async (eventId: string, ticketPriceUSDC: number) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await purchaseTicketOnChain(eventId, ticketPriceUSDC, provider)

        if (!result.success) {
          setError(result.error || "Failed to purchase ticket on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while purchasing ticket"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const markAttendance = useCallback(
    async (eventId: string, participantAddress: string) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await markAttendanceOnChain(eventId, participantAddress, provider)

        if (!result.success) {
          setError(result.error || "Failed to mark attendance on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while marking attendance"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const markAttendanceBatch = useCallback(
    async (eventId: string, participantAddresses: string[]) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await markAttendanceBatchOnChain(eventId, participantAddresses, provider)

        if (!result.success) {
          setError(result.error || "Failed to mark attendance batch on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while marking attendance batch"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const finalizeEvent = useCallback(
    async (eventId: string) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await finalizeEventOnChain(eventId, provider)

        if (!result.success) {
          setError(result.error || "Failed to finalize event on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while finalizing event"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const withdrawRedistribution = useCallback(
    async (eventId: string) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await withdrawRedistributionOnChain(eventId, provider)

        if (!result.success) {
          setError(result.error || "Failed to withdraw redistribution on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while withdrawing redistribution"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const cancelEvent = useCallback(
    async (eventId: string) => {
      setIsProcessing(true)
      setError(null)

      try {
        if (!user) {
          throw new Error("Please connect your wallet first")
        }

        const provider = getProvider()
        const result = await cancelEventOnChain(eventId, provider)

        if (!result.success) {
          setError(result.error || "Failed to cancel event on chain")
        }

        return result
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred while canceling event"
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    [user, getProvider]
  )

  const getEventInfo = useCallback(
    async (eventId: string) => {
      try {
        const provider = getProvider()
        return await getEventInfoOnChain(eventId, provider)
      } catch (err: any) {
        console.error("Error getting event info:", err)
        return null
      }
    },
    [getProvider]
  )

  const getParticipantInfo = useCallback(
    async (eventId: string, participantAddress: string) => {
      try {
        const provider = getProvider()
        return await getParticipantInfoOnChain(eventId, participantAddress, provider)
      } catch (err: any) {
        console.error("Error getting participant info:", err)
        return null
      }
    },
    [getProvider]
  )

  const getEventStats = useCallback(
    async (eventId: string) => {
      try {
        const provider = getProvider()
        return await getEventStatsOnChain(eventId, provider)
      } catch (err: any) {
        console.error("Error getting event stats:", err)
        return null
      }
    },
    [getProvider]
  )

  const calculatePotentialRedistribution = useCallback(
    async (eventId: string, participantAddress: string) => {
      try {
        const provider = getProvider()
        return await calculatePotentialRedistributionOnChain(eventId, participantAddress, provider)
      } catch (err: any) {
        console.error("Error calculating potential redistribution:", err)
        return null
      }
    },
    [getProvider]
  )

  return {
    createEvent,
    purchaseTicket,
    markAttendance,
    markAttendanceBatch,
    finalizeEvent,
    withdrawRedistribution,
    cancelEvent,
    getEventInfo,
    getParticipantInfo,
    getEventStats,
    calculatePotentialRedistribution,
    isProcessing,
    error,
  }
}
