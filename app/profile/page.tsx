"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SongCard } from "@/components/song-card"
import { useUserStore } from "@/store/user-store"
import { usePlayerStore } from "@/store/player-store"
import { getInitials } from "@/lib/utils"
import { Music, Settings, Upload } from "lucide-react"

export default function ProfilePage() {
  const { username, profilePicture, setUsername, setProfilePicture } = useUserStore()
  const { favorites, playlists } = usePlayerStore()

  const [editMode, setEditMode] = useState(false)
  const [newUsername, setNewUsername] = useState(username)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveProfile = () => {
    setUsername(newUsername)
    setEditMode(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePicture(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profilePicture || undefined} alt={username} />
                <AvatarFallback className="text-2xl">{getInitials(username)}</AvatarFallback>
              </Avatar>
              {editMode && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              {editMode ? (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">{username}</h2>
                  <p className="text-muted-foreground">Music Enthusiast</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {editMode ? (
                  <>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="favorites">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">
            <Music className="h-4 w-4 mr-2" />
            Liked Songs
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <Music className="h-4 w-4 mr-2" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          <h2 className="text-xl font-bold mb-4">Your Liked Songs</h2>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No liked songs yet</h3>
              <p className="text-muted-foreground mb-4">Start liking songs to see them here</p>
              <Button asChild>
                <a href="/">Discover Music</a>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
          {playlists.filter((p) => p.id !== "favorites").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlists
                .filter((p) => p.id !== "favorites")
                .map((playlist) => (
                  <Card key={playlist.id}>
                    <CardHeader>
                      <CardTitle>{playlist.name}</CardTitle>
                      <CardDescription>{playlist.songs.length} songs</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild>
                        <a href={`/playlist/${playlist.id}`}>View Playlist</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
              <p className="text-muted-foreground mb-4">Create your first playlist to organize your music</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" type="password" value="••••••••••••••••••••••" readOnly />
                  <Button variant="outline">Update</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key is stored locally and used to access the music service
                </p>
              </div>

              <div className="space-y-2">
                <Label>Data & Privacy</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Local Data</p>
                    <p className="text-sm text-muted-foreground">
                      Remove all locally stored data including playlists and favorites
                    </p>
                  </div>
                  <Button variant="destructive">Clear Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
