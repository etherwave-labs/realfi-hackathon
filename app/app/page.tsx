"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar03Icon,
  Location01Icon,
  UserGroupIcon,
  WalletAdd01Icon,
  CheckmarkBadge03Icon,
  ZapIcon,
} from "hugeicons-react"
import { useEventsStore } from "@/lib/events-store"
import { isEventPast } from "@/lib/event-utils"
import { useMemo } from "react"

export default function HomePage() {
  const { events } = useEventsStore()

  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => !isEventPast(event))
      .sort((a, b) => {
        const idA = parseInt(a.id, 10)
        const idB = parseInt(b.id, 10)
        return idB - idA
      })
      .slice(0, 3)
  }, [events])
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center overflow-hidden py-32 lg:py-40 bg-gradient-to-br from-background via-background to-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-balance">
                Decentralized events with{" "}
                <span className="text-gradient-primary">guaranteed rewards</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl text-pretty leading-relaxed">
                Register for local events with stablecoins. Get rewarded for showing up. No-shows
                fund the community.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="gradient-primary rounded-2xl text-lg px-8 py-6 font-semibold"
              >
                <Link href="/events">Discover Events</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl text-lg px-8 py-6 font-semibold border-2 border-accent/30 hover:border-accent hover:bg-accent/10 bg-transparent"
                asChild
              >
                <Link href="/create">Create Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center py-16 md:py-32 lg:py-40">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary shadow-lg">
                <WalletAdd01Icon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Pay with Stablecoins</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Secure, transparent payments using USDC and other stablecoins
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-accent shadow-lg">
                <CheckmarkBadge03Icon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Guaranteed Refunds</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Show up and get your money back plus a bonus from no-shows
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-warm shadow-lg">
                <ZapIcon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Instant Settlement</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Automated smart contracts handle all payments and rewards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Preview */}
      <section className="flex flex-col items-center py-16 md:py-32 lg:py-40 bg-card/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-6xl">Upcoming Events</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join these exciting events and earn rewards for your attendance
              </p>
            </div>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className={`mx-auto grid max-w-5xl items-center gap-8 py-16 ${upcomingEvents.length === 1 ? 'lg:grid-cols-1 max-w-2xl' : upcomingEvents.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3'} lg:gap-12`}>
              {upcomingEvents.map((event) => (
                <Link href={`/events/${event.id}`} key={event.id}>
                  <Card className="rounded-3xl border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl cursor-pointer h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="rounded-2xl bg-accent/20 text-accent font-semibold"
                        >
                          {event.category}
                        </Badge>
                        <span className="text-lg font-bold text-primary">
                          {event.price} {event.currency}
                        </span>
                      </div>
                      <CardTitle className="text-2xl line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="text-base line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar03Icon className="mr-2 h-4 w-4 text-accent" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Location01Icon className="mr-2 h-4 w-4 text-accent" />
                          {event.location.split(",")[0]}
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="mr-2 h-4 w-4 text-accent" />
                          {event.attendees}/{event.capacity}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                No upcoming events yet. Be the first to create one!
              </p>
              <Button asChild className="gradient-primary rounded-2xl text-lg px-8 py-6 font-semibold mt-6">
                <Link href="/create">Create Event</Link>
              </Button>
            </div>
          )}
          <div className="flex justify-center">
            <Button asChild className="gradient-accent rounded-2xl text-lg px-8 py-6 font-semibold">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
