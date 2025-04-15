"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SongCard } from "@/components/song-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlaylistModal } from "@/components/playlist-modal"
import { usePlayerStore } from "@/store/player-store"
import { Music, Plus } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const { favorites, playlists } = usePlayerStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <PlaylistModal />
      </div>

      <Tabs defaultValue="playlists">
        <TabsList>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="songs">Liked Songs</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Liked Songs</CardTitle>
                <CardDescription>{favorites.length} songs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-md flex items-center justify-center">
                  <Music className="h-16 w-16 text-white" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/playlist/favorites">View Playlist</Link>
                </Button>
              </CardFooter>
            </Card>

            {playlists
              .filter((p) => p.id !== "favorites")
              .map((playlist) => (
                <Card key={playlist.id}>
                  <CardHeader className="pb-4">
                    <CardTitle>{playlist.name}</CardTitle>
                    <CardDescription>{playlist.songs.length} songs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {playlist.songs.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 h-40 overflow-hidden">
                        {playlist.songs.slice(0, 4).map((song, index) => (
                          <div key={song.id} className="relative aspect-square">
                            <img
                              src={song.cover || "/placeholder.svg?height=100&width=100"}
                              alt={song.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/40 rounded-md flex items-center justify-center">
                        <Music className="h-16 w-16 text-primary/60" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/playlist/${playlist.id}`}>View Playlist</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle>Create Playlist</CardTitle>
                <CardDescription>Add a new collection of songs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 border-2 border-dashed rounded-md flex items-center justify-center">
                  <Plus className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
              <CardFooter>
                <PlaylistModal />
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="songs" className="mt-6">
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
                <Link href="/">Discover Music</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
