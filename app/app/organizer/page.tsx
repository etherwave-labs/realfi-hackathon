import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Plus, BarChart3 } from "lucide-react"

export default function OrganizerLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center overflow-hidden py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-balance">
                Host events with <span className="text-primary">guaranteed attendance</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-pretty">
                Create events with stablecoin deposits. Attendees get rewarded for showing up,
                no-shows fund the community.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/organizer/dashboard">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/create">Create Your First Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="flex flex-col items-center py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Higher Attendance Rates</h3>
                <p className="text-muted-foreground">
                  Financial incentives ensure people actually show up to your events
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Automated Payments</h3>
                <p className="text-muted-foreground">
                  Smart contracts handle all payments, refunds, and service fees automatically
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Track registrations, attendance, and earnings in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="flex flex-col items-center py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Simple steps to create successful events with guaranteed attendance
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  1
                </div>
                <CardTitle>Create Your Event</CardTitle>
                <CardDescription>
                  Set event details, capacity, and registration fee in stablecoins
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  2
                </div>
                <CardTitle>Attendees Register</CardTitle>
                <CardDescription>
                  People pay registration fees which are held in smart contracts
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  3
                </div>
                <CardTitle>Automatic Settlement</CardTitle>
                <CardDescription>
                  Attendees get refunds + bonuses, you receive service fees
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join hundreds of organizers who are creating better events with guaranteed
                attendance
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/organizer/dashboard">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Organizing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
