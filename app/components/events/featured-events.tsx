"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar03Icon, Location01Icon, UserGroupIcon } from "hugeicons-react"
import { useEvents } from "@/components/ui/use-events"

export function FeaturedEvents() {
  const { events } = useEvents()
  const featured = events.slice(0, 2)

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-8 py-16 lg:grid-cols-2 lg:gap-12">
      {featured.map((event) => (
        <Card key={event.id} className="rounded-3xl border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
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
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription className="text-base line-clamp-2">{event.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar03Icon className="mr-2 h-4 w-4 text-accent" />
                {event.date}
              </div>
              <div className="flex items-center">
                <Location01Icon className="mr-2 h-4 w-4 text-accent" />
                {event.location}
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="mr-2 h-4 w-4 text-accent" />
                {event.attendees}/{event.capacity} registered
              </div>
            </div>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
