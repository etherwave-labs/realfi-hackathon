import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "EventChain - Decentralized Event Platform",
  description: "Register for local events with stablecoins and get rewarded for attendance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans w-full">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
