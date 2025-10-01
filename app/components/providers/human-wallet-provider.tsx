"use client"

import { useEffect } from "react"
import { initSilk } from "@silk-wallet/silk-wallet-sdk"
import { useAuthStore } from "@/lib/auth-store"

interface HumanWalletProviderProps {
  children: React.ReactNode
}

export function HumanWalletProvider({ children }: HumanWalletProviderProps) {
  const { setIsInitialized, setUser } = useAuthStore()

  useEffect(() => {
    const initWallet = async () => {
      try {
        // Vérifier si Human Wallet est déjà initialisé
        if (window.silk) {
          setIsInitialized(true)
          
          // Vérifier la session existante
          try {
            const accounts = await window.silk.request({ method: "eth_accounts" })
            if (accounts && accounts.length > 0) {
              setUser({ address: accounts[0] })
            }
          } catch (error) {
            // Session non trouvée, c'est normal
          }
          return
        }

        // Configuration Human Wallet
        const initConfig: any = {
          config: {
            allowedSocials: [], // Désactivé tous les réseaux sociaux
            authenticationMethods: ["email"], // Uniquement email
            styles: { darkMode: true },
          },
          useStaging: true, // Mettre à false en production
        }

        // Initialiser le SDK
        await initSilk(initConfig)
        setIsInitialized(true)

        // Vérifier si un utilisateur est déjà connecté
        // @ts-ignore - Type complexe du SDK
        if (window.silk) {
          try {
            // @ts-ignore
            const accounts = await window.silk.request({ method: "eth_accounts" })
            if (accounts && accounts.length > 0) {
              setUser({
                address: accounts[0],
              })
            }
          } catch (error) {
            // Session non trouvée, c'est normal
          }

          // Écouter les changements de compte
          // @ts-ignore
          window.silk.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length > 0) {
              setUser({
                address: accounts[0],
              })
            } else {
              setUser(null)
            }
          })

          // Écouter les changements de réseau (sans recharger automatiquement)
          // @ts-ignore
          window.silk.on("chainChanged", (chainId: string) => {
            // Réseau changé, l'UI se mettra à jour automatiquement
          })
        }
      } catch (error) {
        console.error("❌ Failed to initialize Human Wallet:", error)
        setIsInitialized(true) // On marque comme initialisé même en cas d'erreur
      }
    }

    initWallet()
  }, [setIsInitialized, setUser])

  return <>{children}</>
}

