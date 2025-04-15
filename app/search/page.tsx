"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SongCard } from "@/components/song-card"
import { AlbumCard } from "@/components/album-card"
import { ArtistCard } from "@/components/artist-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { searchMusic } from "@/lib/music-api"
import type { Song } from "@/store/player-store"
import { SearchIcon } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("songs")

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return

    try {
      setLoading(true)

      // In a real app, these would be actual API calls
      // For now, we'll simulate with mock data

      // Search songs
      const songsData = await searchMusic(searchTerm, "track").catch(() => [])
      const formattedSongs = Array.isArray(songsData)
        ? songsData.slice(0, 12).map((song) => ({
            id: song.id || `song-${Math.random()}`,
            title: song.title || "Unknown Song",
            artist: song.artist?.name || "Unknown Artist",
            artistId: song.artist?.id || "unknown",
            album: song.album?.title || "Unknown Album",
            albumId: song.album?.id || "unknown",
            duration: song.duration || 180,
            cover: song.album?.cover_medium || "/placeholder.svg?height=300&width=300",
            audioUrl: song.preview || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          }))
        : []

      setSongs(formattedSongs)

      // Search albums
      const albumsData = await searchMusic(searchTerm, "album").catch(() => [])
      setAlbums(
        Array.isArray(albumsData)
          ? albumsData.slice(0, 12).map((album) => ({
              id: album.id || `album-${Math.random()}`,
              title: album.title || "Unknown Album",
              artist: album.artist?.name || "Unknown Artist",
              artistId: album.artist?.id || "unknown",
              cover: album.cover_medium || "/placeholder.svg?height=300&width=300",
            }))
          : [],
      )

      // Search artists
      const artistsData = await searchMusic(searchTerm, "artist").catch(() => [])
      setArtists(
        Array.isArray(artistsData)
          ? artistsData.slice(0, 12).map((artist) => ({
              id: artist.id || `artist-${Math.random()}`,
              name: artist.name || "Unknown Artist",
              image: artist.picture_medium || "/placeholder.svg?height=300&width=300",
            }))
          : [],
      )
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit">
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {query && (
        <>
          <h1 className="text-2xl font-bold">Search results for "{query}"</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="songs">Songs</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : songs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {songs.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No songs found matching "{query}"</p>
              )}
            </TabsContent>

            <TabsContent value="albums" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : albums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No albums found matching "{query}"</p>
              )}
            </TabsContent>

            <TabsContent value="artists" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : artists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No artists found matching "{query}"</p>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Search for music</h2>
          <p className="text-muted-foreground">Find your favorite songs, artists, and albums</p>
        </div>
      )}
    </div>
  )
}
