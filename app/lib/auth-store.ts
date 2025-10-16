import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface User {
  address: string
  email?: string
  displayName?: string
  loginType?: string
  username?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isInitialized: boolean
  isConnecting: boolean
  setUser: (user: User | null) => void
  setIsInitialized: (initialized: boolean) => void
  setIsConnecting: (connecting: boolean) => void
  login: () => Promise<void>
  logout: () => Promise<void>
  getAccounts: () => Promise<string[]>
  updateProfile: (username: string, avatar?: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      isConnecting: false,

      setUser: (user) => set({ user }),
      setIsInitialized: (initialized) => set({ isInitialized: initialized }),
      setIsConnecting: (connecting) => set({ isConnecting: connecting }),

      login: async () => {
        try {
          set({ isConnecting: true })

          // Vérifier que window.waap est disponible
          if (typeof window === "undefined" || !window.waap) {
            throw new Error("WaaP SDK not initialized. Please wait for the app to load.")
          }

          console.log("🔄 Starting login flow...")

          // Appeler login() - cela ouvre l'UI et les événements accountsChanged 
          // dans le provider se chargeront de mettre à jour l'état
          console.log("🔐 Opening login UI...")
          
          try {
            const loginType = await window.waap.login()
            console.log("✅ Login UI completed, type:", loginType)
          } catch (loginError) {
            console.error("⚠️ Login UI error:", loginError)
            // Ne pas throw ici car parfois login() peut échouer mais accountsChanged se déclenche quand même
          }

          // Attendre que l'événement accountsChanged se déclenche
          // Le provider va automatiquement mettre à jour le user via setUser()
          console.log("⏳ Waiting for account connection...")
          
          // Essayer de récupérer les comptes plusieurs fois avec timeout
          let attempts = 0
          const maxAttempts = 10
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            try {
              const accounts = await window.waap.request({ method: "eth_accounts" })
              console.log(`📋 Attempt ${attempts + 1}: Accounts =`, accounts)
              
              if (accounts && accounts.length > 0 && accounts[0]) {
                const address = accounts[0]
                const currentUser = get().user
                
                // Préserver le username et l'avatar s'ils existent et que l'adresse est la même
                const preservedProfile = currentUser && currentUser.address === address 
                  ? { username: currentUser.username, avatar: currentUser.avatar }
                  : {}
                
                set({
                  user: {
                    address,
                    ...preservedProfile,
                  },
                  isConnecting: false,
                })
                
                console.log("✅ User logged in:", address)
                return
              }
            } catch (error) {
              console.warn(`⚠️ Attempt ${attempts + 1} failed:`, error)
            }
            
            attempts++
          }
          
          console.warn("⚠️ No accounts found after all attempts")
          set({ isConnecting: false })
          throw new Error("Connection timeout - no accounts found")
          
        } catch (error) {
          console.error("❌ Login error:", error)
          set({ isConnecting: false })
          throw error
        }
      },

      logout: async () => {
        try {
          // Appeler logout sur le provider WaaP
          if (typeof window !== "undefined" && window.waap) {
            await window.waap.logout()
          }
          
          // Effacer l'utilisateur du state
          set({ user: null })
          
          // Nettoyer le localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("eventchain-auth")
            console.log("🗑️ localStorage cleaned")
          }
        } catch (error) {
          console.error("Logout error:", error)
          // Même en cas d'erreur, nettoyer le state local
          set({ user: null })
          if (typeof window !== "undefined") {
            localStorage.removeItem("eventchain-auth")
          }
        }
      },

      getAccounts: async () => {
        try {
          if (typeof window === "undefined" || !window.waap) {
            return []
          }

          const accounts = await window.waap.request({ method: "eth_requestAccounts" })
          return accounts || []
        } catch (error) {
          console.error("Get accounts error:", error)
          return []
        }
      },

      updateProfile: (username, avatar) =>
        set((state) => ({
          user: state.user ? { ...state.user, username, avatar } : null,
        })),
    }),
    {
      name: "eventchain-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      // Valider les données restaurées depuis le localStorage
      merge: (persistedState: any, currentState: AuthState) => {
        // Si l'utilisateur persisté n'a pas d'adresse valide, on l'ignore
        if (persistedState?.user && !persistedState.user.address) {
          console.log("🗑️ User invalide dans localStorage, ignoré")
          return { ...currentState, user: null }
        }
        return { ...currentState, ...persistedState }
      },
      onRehydrateStorage: () => (state) => {
        // Vérifier après la restauration
        if (state?.user && !state.user.address) {
          console.log("🗑️ Nettoyage user invalide après restauration")
          state.user = null
        }
      },
    },
  ),
)

// Types pour TypeScript
declare global {
  interface Window {
    waap?: {
      login: () => Promise<void>
      logout: () => Promise<void>
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (data: any) => void) => void
      removeListener: (event: string, callback: (data: any) => void) => void
    }
  }
}
