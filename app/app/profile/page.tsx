"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { User, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Rediriger si pas d'utilisateur
  useEffect(() => {
    if (!user) {
      router.push("/events")
    }
  }, [user, router])

  // Initialiser les champs une seule fois
  useEffect(() => {
    if (user && !isInitialized) {
      setUsername(user.username || "")
      setAvatar(user.avatar || "")
      setIsInitialized(true)
    }
  }, [user, isInitialized])

  const handleSave = async () => {
    if (!username.trim()) {
      alert("Please enter a username")
      return
    }

    setIsSaving(true)
    try {
      updateProfile(username.trim(), avatar.trim() || undefined)
      alert("✓ Profile updated successfully!")
      router.push("/events")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero avec gradient animé */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50/40 via-gray-50 to-blue-50/40 py-16 mb-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="animate-fade-in-down">
            <Link href="/events" className="text-sm text-orange-500 hover:text-orange-600 mb-2 inline-flex items-center gap-2 hover:gap-3 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 mb-3">
              <span className="text-gradient-metamask text-glow hover:animate-wiggle inline-block cursor-default">Edit Profile</span>
            </h1>
            <p className="text-gray-600 text-lg">Customize your profile information</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-8 max-w-2xl">

      <Card className="glass-card border-gray-200 hover:border-orange-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your username and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {avatar ? (
                  <img src={avatar} alt={username || "Avatar"} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 rounded-full">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">This is how others will see you on the platform</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              placeholder="https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              type="url"
            />
            <p className="text-xs text-muted-foreground">Enter a URL to your profile picture</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-600 dark:text-blue-400">
            <p><strong>Tip:</strong> You can use free image hosting services like <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="underline">Imgur</a> or <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline">ImgBB</a> to upload your photo and get a URL.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 glass-card border-gray-200 hover:border-blue-400/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your blockchain identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Wallet Address:</span>
            <code className="text-xs">{user.address.slice(0, 10)}...{user.address.slice(-8)}</code>
          </div>
          {user.loginType && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Login Method:</span>
              <span className="capitalize">{user.loginType}</span>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

