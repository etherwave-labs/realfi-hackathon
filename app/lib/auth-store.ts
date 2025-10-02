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

          // Vérifier que window.silk est disponible
          if (typeof window === "undefined" || !window.silk) {
            throw new Error("Human Wallet SDK not initialized")
          }

          // Déclencher la connexion via Human Wallet
          const loginType = await window.silk.login()
          console.log("Login type:", loginType)

          // Récupérer les comptes
          const accounts = await window.silk.request({ method: "eth_requestAccounts" })
          console.log("Accounts:", accounts)

          if (accounts && accounts.length > 0) {
            const address = accounts[0]
            const currentUser = get().user
            
            // Préserver le username et l'avatar s'ils existent et que l'adresse est la même
            const preservedProfile = currentUser && currentUser.address === address 
              ? { username: currentUser.username, avatar: currentUser.avatar }
              : {}
            
            set({
              user: {
                address,
                loginType,
                ...preservedProfile,
              },
              isConnecting: false,
            })
          } else {
            throw new Error("No accounts found")
          }
        } catch (error) {
          console.error("Login error:", error)
          set({ isConnecting: false })
          throw error
        }
      },

      logout: async () => {
        try {
          if (typeof window !== "undefined" && window.silk) {
            // Human Wallet ne fournit pas de méthode logout explicite
            // On efface juste l'état local
            set({ user: null })
          }
        } catch (error) {
          console.error("Logout error:", error)
        }
      },

      getAccounts: async () => {
        try {
          if (typeof window === "undefined" || !window.silk) {
            return []
          }

          const accounts = await window.silk.request({ method: "eth_requestAccounts" })
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
    },
  ),
)

// Types pour TypeScript
declare global {
  interface Window {
    silk?: {
      login: () => Promise<string>
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (data: any) => void) => void
      removeListener: (event: string, callback: (data: any) => void) => void
    }
  }
}

