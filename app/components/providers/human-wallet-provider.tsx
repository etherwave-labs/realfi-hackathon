"use client"

import { useEffect, useRef } from "react"
import { initWaaP } from "@silk-wallet/silk-wallet-sdk"
import { useAuthStore } from "@/lib/auth-store"
import { waapConfig } from "@/waap.config"

interface HumanWalletProviderProps {
  children: React.ReactNode
}

export function HumanWalletProvider({ children }: HumanWalletProviderProps) {
  const { setIsInitialized, setUser } = useAuthStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initWallet = async () => {
      try {
        // Wait for window to be ready
        if (typeof window === 'undefined') return

        console.log("🔄 Initializing WaaP...")
        
        // Initialize WaaP
        const provider = initWaaP(waapConfig)
        
        // Attach to window for global access
        ;(window as any).waap = provider
        
        setIsInitialized(true)
        console.log("✅ WaaP initialized and attached to window.waap")

        // Check for existing session
        try {
          const accounts = (await provider.request({ method: "eth_accounts" })) as string[]
          
          if (accounts && accounts.length > 0 && accounts[0]) {
            setUser({ address: accounts[0] })
            console.log("✅ Session restored:", accounts[0])
          } else {
            setUser(null)
            console.log("🔓 No active session")
          }
        } catch (error) {
          console.log("🔓 No active session:", error)
          setUser(null)
        }

        // Set up event listeners
        provider.on("accountsChanged", (accounts: string[]) => {
          if (accounts && accounts.length > 0 && accounts[0]) {
            setUser({ address: accounts[0] })
            console.log("👤 Account changed:", accounts[0])
          } else {
            setUser(null)
            console.log("🔓 Disconnected")
          }
        })

        provider.on("chainChanged", (chainId: string) => {
          console.log("🔗 Chain changed:", chainId)
        })

      } catch (error) {
        console.error("❌ Failed to initialize WaaP:", error)
        setIsInitialized(true)
      }
    }

    initWallet()
  }, [setIsInitialized, setUser])

  return <>{children}</>
}
