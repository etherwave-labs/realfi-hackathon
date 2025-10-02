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

  // Stats calculées en temps réel
  const stats = useMemo(() => {
    const totalEvents = events.length
    const activeEvents = events.filter((event) => !isEventPast(event)).length
    const totalAttendees = events.reduce((sum, event) => sum + event.attendees, 0)
    const avgAttendance = totalEvents > 0 ? Math.round((totalAttendees / events.reduce((sum, event) => sum + event.capacity, 0)) * 100) : 0
    
    return { totalEvents, activeEvents, totalAttendees, avgAttendance }
  }, [events])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Compact & Centered */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[75vh]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-orange-50/40 to-blue-50/50 animate-gradient bg-300%"></div>
          <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-400/15 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/12 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float hover:scale-110 transition-transform duration-1000" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-500/12 rounded-full mix-blend-multiply filter blur-3xl opacity-55 animate-float hover:scale-110 transition-transform duration-1000" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-45 animate-float hover:scale-110 transition-transform duration-1000" style={{ animationDelay: '6s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-300/8 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-300/8 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
            <div className="space-y-6 animate-fade-in-down relative">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none">
                Events with{" "}
                <span className="text-gradient-metamask animate-gradient bg-300% text-glow inline-block hover:animate-wiggle cursor-default">real rewards</span>
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-600 text-xl md:text-2xl animate-fade-in-up font-medium">
                Show up. Get paid. Simple as that.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                asChild
                size="lg"
                className="gradient-primary rounded-2xl text-lg px-10 py-7 font-semibold glow-primary hover:scale-110 hover:rotate-1 hover:shadow-2xl transition-all duration-300 hover:animate-heartbeat relative overflow-hidden group"
              >
                <Link href="/events">
                  <span className="relative z-10">Discover Events</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass-panel rounded-2xl text-lg px-10 py-7 font-semibold border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 hover:scale-110 hover:-rotate-1 transition-all duration-300"
                asChild
              >
                <Link href="/create">Create Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Real-time Dashboard Feel with Scroll */}
      <section className="py-12 bg-white border-y border-gray-200 overflow-hidden">
        <div className="relative">
          {/* Gradient overlays pour l'effet de fondu */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          {/* Container qui défile */}
          <div 
            className="flex gap-20" 
            style={{
              animation: 'scroll-slow 20s linear infinite',
              willChange: 'transform'
            }}
          >
            {/* Premier ensemble */}
            <div className="flex gap-20 shrink-0 px-10">
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-metamask mb-2">{stats.totalEvents}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Total Events</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-warm mb-2">{stats.activeEvents}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Active Now</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-vibrant mb-2">{stats.totalAttendees}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Attendees</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-metamask mb-2">{stats.avgAttendance}%</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Avg Attendance</div>
              </div>
            </div>
            
            {/* Deuxième ensemble (copie pour boucle infinie) */}
            <div className="flex gap-20 shrink-0 px-10" aria-hidden="true">
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-metamask mb-2">{stats.totalEvents}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Total Events</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-warm mb-2">{stats.activeEvents}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Active Now</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-vibrant mb-2">{stats.totalAttendees}</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Attendees</div>
              </div>
              <div className="text-center min-w-[220px]">
                <div className="text-4xl md:text-5xl font-bold text-gradient-metamask mb-2">{stats.avgAttendance}%</div>
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">Avg Attendance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid - Modern asymmetric layout */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in-up">
            <span className="text-gradient-vibrant">How it works</span>
          </h2>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - spans 2 columns */}
            <div className="md:col-span-2 glass-card rounded-3xl p-8 md:p-12 group animate-fade-in-up hover:shadow-2xl transition-all duration-500 border-2 border-orange-400/20 hover:border-orange-500/40 card-glow">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-3xl gradient-primary shadow-xl glow-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                  <WalletAdd01Icon className="h-10 w-10 md:h-12 md:w-12 text-white drop-shadow-md group-hover:animate-wiggle" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">Pay with Stablecoins</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Register for events using USDC and other stablecoins. Your payment is locked in a smart contract until the event concludes.
                  </p>
                </div>
              </div>
            </div>

            {/* Tall card */}
            <div className="md:row-span-2 glass-card rounded-3xl p-8 md:p-10 group animate-fade-in-up hover:shadow-2xl transition-all duration-500 border-2 border-orange-400/20 hover:border-orange-500/40 card-glow flex flex-col justify-center" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col items-center text-center space-y-6 h-full justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-warm shadow-xl glow-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <ZapIcon className="h-12 w-12 text-white drop-shadow-md group-hover:animate-wiggle" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-secondary transition-colors">Instant Settlement</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    After the event, funds are automatically distributed. No waiting, no manual processing.
                  </p>
                </div>
              </div>
            </div>

            {/* Wide card */}
            <div className="md:col-span-2 glass-card rounded-3xl p-8 md:p-12 group animate-fade-in-up hover:shadow-2xl transition-all duration-500 border-2 border-orange-400/20 hover:border-orange-500/40 card-glow" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-3xl gradient-accent shadow-xl glow-accent group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 flex-shrink-0">
                  <CheckmarkBadge03Icon className="h-10 w-10 md:h-12 md:w-12 text-white drop-shadow-md group-hover:animate-wiggle" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-accent transition-colors">Get Rewarded for Showing Up</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Attend the event and receive your deposit back plus a share of no-show fees. The more people skip, the more you earn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Modern Grid */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-white">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-10 animate-fade-in-up">
            <div className="mb-6">
              <h2 className="text-3xl md:text-5xl font-bold mb-3">
                <span className="text-gradient-metamask">Happening Now</span>
              </h2>
              <p className="text-gray-600 text-lg">
                {upcomingEvents.length} events waiting for you
              </p>
            </div>
          </div>

          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {upcomingEvents.map((event, index) => (
                  <Link href={`/events/${event.id}`} key={event.id}>
                    <Card className="rounded-3xl glass-card border-2 border-gray-200 hover:border-orange-400/60 card-glow cursor-pointer h-full group animate-zoom-in hover:-translate-y-2 hover:shadow-2xl transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant="secondary"
                            className="rounded-2xl glass-orange font-semibold border border-orange-400/50 text-orange-900"
                          >
                            {event.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-gradient-metamask">{event.price}</span>
                            <span className="text-sm text-gray-500">{event.currency}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">{event.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600 group-hover:text-primary transition-colors">
                            <Calendar03Icon className="mr-2 h-4 w-4 text-primary" />
                            <span className="font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600 group-hover:text-accent transition-colors">
                            <Location01Icon className="mr-2 h-4 w-4 text-accent" />
                            <span className="truncate">{event.location.split(",")[0]}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex items-center text-gray-600">
                              <UserGroupIcon className="mr-2 h-4 w-4 text-secondary" />
                              <span className="font-medium">{event.attendees}/{event.capacity}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round((event.attendees / event.capacity) * 100)}% full
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {/* Centered View All Button */}
              <div className="flex justify-center">
                <Button asChild className="gradient-metamask rounded-2xl px-8 py-6 font-semibold glow-metamask hover:scale-105 transition-all duration-300">
                  <Link href="/events">View All Events</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center animate-fade-in glass-card rounded-3xl border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-600 text-lg">
                  No upcoming events yet. Be the first to create one!
                </p>
                <Button asChild className="gradient-primary rounded-2xl text-lg px-8 py-6 font-semibold glow-primary hover:scale-105 transition-all duration-300">
                  <Link href="/create">Create Event</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
