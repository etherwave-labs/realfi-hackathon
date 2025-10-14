"use client"

import { useEffect } from "react"
import { initSilk } from "@silk-wallet/silk-wallet-sdk"
import { useAuthStore } from "@/lib/auth-store"

interface HumanWalletProviderProps {
  children: React.ReactNode
}

export function HumanWalletProvider({ children }: HumanWalletProviderProps) {
  const { setIsInitialized, setUser, user } = useAuthStore()

  useEffect(() => {
    const initWallet = async () => {
      try {
        // Vérifier si on revient d'une authentification email (callback WAAP)
        const urlParams = new URLSearchParams(window.location.search)
        const hasEmailCallback = urlParams.has('bundle') || urlParams.has('token') || urlParams.has('state')
        
        // Vérifier si Human Wallet est déjà initialisé
        if (window.silk) {
          setIsInitialized(true)
          
          // Si on revient d'un callback email, attendre que la session soit établie
          if (hasEmailCallback) {
            console.log("📧 Détection d'un callback d'authentification email...")
            // Attendre un peu pour que le SDK finalise l'authentification
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          // Vérifier la session existante
          try {
            const accounts = await window.silk.request({ method: "eth_accounts" })
            if (accounts && accounts.length > 0 && accounts[0]) {
              // Préserver le profil si c'est le même utilisateur
              const preservedProfile = user && user.address === accounts[0]
                ? { username: user.username, avatar: user.avatar }
                : {}
              setUser({ address: accounts[0], ...preservedProfile })
              console.log("✅ Utilisateur connecté:", accounts[0])
              
              // Nettoyer l'URL après le callback
              if (hasEmailCallback) {
                window.history.replaceState({}, document.title, window.location.pathname)
              }
            } else {
              // Pas de compte connecté, réinitialiser l'utilisateur
              console.log("🔓 Pas de wallet connecté, nettoyage de l'état")
              setUser(null)
              // Nettoyer aussi le localStorage
              localStorage.removeItem("eventchain-auth")
            }
          } catch (error) {
            // Session non trouvée, réinitialiser l'utilisateur
            console.log("🔓 Erreur wallet, nettoyage de l'état")
            setUser(null)
            localStorage.removeItem("eventchain-auth")
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
            if (accounts && accounts.length > 0 && accounts[0]) {
              // Préserver le profil si c'est le même utilisateur
              const currentUser = useAuthStore.getState().user
              const preservedProfile = currentUser && currentUser.address === accounts[0]
                ? { username: currentUser.username, avatar: currentUser.avatar }
                : {}
              setUser({
                address: accounts[0],
                ...preservedProfile,
              })
              console.log("✅ Utilisateur restauré:", accounts[0])
            } else {
              // Pas de compte connecté, réinitialiser l'utilisateur
              console.log("🔓 Pas de wallet connecté, nettoyage de l'état")
              setUser(null)
              localStorage.removeItem("eventchain-auth")
            }
          } catch (error) {
            // Session non trouvée, réinitialiser l'utilisateur
            console.log("🔓 Erreur wallet, nettoyage de l'état")
            setUser(null)
            localStorage.removeItem("eventchain-auth")
          }

          // Écouter les changements de compte
          // @ts-ignore
          window.silk.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length > 0) {
              // Préserver le profil si c'est le même utilisateur
              const currentUser = useAuthStore.getState().user
              const preservedProfile = currentUser && currentUser.address === accounts[0]
                ? { username: currentUser.username, avatar: currentUser.avatar }
                : {}
              setUser({
                address: accounts[0],
                ...preservedProfile,
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
  }, [setIsInitialized, setUser, user])

  return <>{children}</>
}

