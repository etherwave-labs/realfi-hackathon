"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar03Icon, WalletAdd01Icon, Add01Icon, UserIcon } from "hugeicons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth-store"

export function Header() {
  const { user, isConnecting, login, logout } = useAuthStore()

  const handleConnect = async () => {
    try {
      await login()
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Disconnect failed:", error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-200 shadow-lg backdrop-blur-xl animate-slide-down">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2 group" href="/">
            <Calendar03Icon className="h-7 w-7 text-primary group-hover:animate-wiggle group-hover:text-accent transition-all" />
            <span className="hidden font-bold text-xl sm:inline-block text-gradient-primary group-hover:animate-pulse-slow">
              EventChain
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm lg:gap-8">
            <Link
              className="transition-all hover:text-primary text-foreground/80 font-medium hover:scale-110 hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
              href="/events"
            >
              Events
            </Link>
            <Link
              className="transition-all hover:text-primary text-foreground/80 font-medium hover:scale-110 hover:-translate-y-0.5 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
              href="/organizer"
            >
              For Organizers
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="ghost"
              className="inline-flex items-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 hover:text-primary h-10 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Calendar03Icon className="h-7 w-7 text-primary animate-pulse-slow" />
              <span className="ml-2 font-bold text-gradient-primary">EventChain</span>
            </Button>
          </div>
          <nav className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              className="gradient-primary rounded-2xl font-semibold glow-primary hover:scale-110 hover:rotate-1 hover:shadow-2xl transition-all duration-300 hover:animate-pulse"
              asChild
            >
              <Link href="/create">
                <Add01Icon className="h-4 w-4 mr-2 group-hover:animate-spin-slow" />
                Create Event
              </Link>
            </Button>
            {user && user.address ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-2 border-orange-300/40 hover:border-orange-400/60 hover:bg-orange-50 bg-white/70 hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username || "Avatar"}
                        className="h-5 w-5 rounded-full object-cover mr-2 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4 mr-2 animate-pulse-slow" />
                    )}
                    {user.username || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-2 border-orange-200/50 glass-card animate-fade-in-down shadow-2xl">
                  {user.username && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gradient-primary">
                        {user.username}
                      </div>
                      <DropdownMenuSeparator className="bg-orange-200/40" />
                    </>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-orange-50 transition-colors">
                    <Link href="/profile">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-orange-50 transition-colors">
                    <Link href="/wallet">
                      <WalletAdd01Icon className="h-4 w-4 mr-2 text-accent animate-bounce-gentle" />
                      My Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-200/40" />
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-orange-50 transition-colors">
                    <Link href="/my-events">My Events</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-orange-50 transition-colors">
                    <Link href="/organizer/dashboard">Organizer Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-200/40" />
                  <DropdownMenuItem className="rounded-xl" disabled>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatAddress(user.address)}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-200/40" />
                  <DropdownMenuItem className="rounded-xl text-destructive hover:bg-red-50 transition-colors hover:animate-shake" onClick={handleDisconnect}>
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-2 border-orange-300/40 hover:border-orange-400/60 hover:bg-orange-50 bg-white/70 hover:scale-110 hover:-rotate-1 transition-all duration-300 glow-accent hover:shadow-xl"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <WalletAdd01Icon className="h-4 w-4 mr-2 group-hover:animate-wiggle" />
                {isConnecting ? (
                  <span className="animate-pulse">Connecting...</span>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
