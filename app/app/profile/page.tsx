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

  useEffect(() => {
    if (!user) {
      router.push("/events")
    } else {
      setUsername(user.username || "")
      setAvatar(user.avatar || "")
    }
  }, [user, router])

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/events" className="text-sm text-primary hover:underline mb-2 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-4 mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">Customize your profile information</p>
      </div>

      <Card>
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

      <Card className="mt-6">
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
  )
}

