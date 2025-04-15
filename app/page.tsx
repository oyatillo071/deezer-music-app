"use client"

import { useEffect, useState } from "react"
import { SongCard } from "@/components/song-card"
import { AlbumCard } from "@/components/album-card"
import { ArtistCard } from "@/components/artist-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getNewReleases, getRandomTracks } from "@/lib/music-api"
import { type Song, usePlayerStore } from "@/store/player-store"
import { Shuffle } from "lucide-react"

export default function Home() {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentSong } = usePlayerStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // In a real app, these would be actual API calls
        // For now, we'll simulate with mock data

        // Featured songs
        const songsData = await getRandomTracks().catch(() => [])
        const formattedSongs = Array.isArray(songsData)
          ? songsData.slice(0, 6).map((song) => ({
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

        setFeaturedSongs(formattedSongs)

        // New releases (albums)
        const albumsData = await getNewReleases().catch(() => [])
        setNewReleases(
          Array.isArray(albumsData)
            ? albumsData.slice(0, 6).map((album) => ({
                id: album.id || `album-${Math.random()}`,
                title: album.title || "Unknown Album",
                artist: album.artist?.name || "Unknown Artist",
                artistId: album.artist?.id || "unknown",
                cover: album.cover_medium || "/placeholder.svg?height=300&width=300",
              }))
            : [],
        )

        // Top artists
        setTopArtists([
          {
            id: "artist-1",
            name: "The Weeknd",
            image: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "artist-2",
            name: "Billie Eilish",
            image: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "artist-3",
            name: "Drake",
            image: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "artist-4",
            name: "Dua Lipa",
            image: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "artist-5",
            name: "Post Malone",
            image: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "artist-6",
            name: "Ariana Grande",
            image: "/placeholder.svg?height=300&width=300",
          },
        ])
      } catch (error) {
        console.error("Error fetching home data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const playRandomSong = () => {
    if (featuredSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * featuredSongs.length)
      setCurrentSong(featuredSongs[randomIndex])
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Songs</h2>
          <Button onClick={playRandomSong} variant="outline" size="sm">
            <Shuffle className="mr-2 h-4 w-4" />
            Play Random
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">New Releases</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newReleases.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Popular Artists</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
