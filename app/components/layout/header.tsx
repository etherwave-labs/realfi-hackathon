"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar03Icon, WalletAdd01Icon, Add01Icon, User02Icon } from "hugeicons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gradient bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Calendar03Icon className="h-7 w-7 text-primary" />
            <span className="hidden font-bold text-xl sm:inline-block text-gradient-primary">EventChain</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm lg:gap-8">
            <Link className="transition-colors hover:text-primary text-foreground/80 font-medium" href="/events">
              Events
            </Link>
            <Link className="transition-colors hover:text-primary text-foreground/80 font-medium" href="/organizer">
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
              <Calendar03Icon className="h-7 w-7 text-primary" />
              <span className="ml-2 font-bold text-gradient-primary">EventChain</span>
            </Button>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="default" size="sm" className="gradient-primary rounded-2xl font-semibold" asChild>
              <Link href="/create">
                <Add01Icon className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/10 bg-transparent"
                >
                  <User02Icon className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-2 border-border/50">
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/my-events">My Events</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link href="/organizer/dashboard">Organizer Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl">
                  <WalletAdd01Icon className="h-4 w-4 mr-2 text-accent" />
                  Wallet: 0x1234...5678
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl text-destructive">Disconnect Wallet</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
