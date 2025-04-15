"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SongCard } from "@/components/song-card"
import { AlbumCard } from "@/components/album-card"
import { ArtistCard } from "@/components/artist-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getArtist, getArtistTopTracks, getRelatedArtists } from "@/lib/music-api"
import { type Song, usePlayerStore } from "@/store/player-store"
import { Play, Pause } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ArtistPage() {
  const params = useParams()
  const artistId = params.id as string

  const [artist, setArtist] = useState<any>(null)
  const [topSongs, setTopSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [relatedArtists, setRelatedArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore()

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        setLoading(true)

        // In a real app, these would be actual API calls
        // For now, we'll simulate with mock data

        const artistData = await getArtist(artistId).catch(() => null)

        if (artistData) {
          setArtist({
            id: artistData.id || artistId,
            name: artistData.name || "Unknown Artist",
            image: artistData.picture_medium || "/placeholder.svg?height=300&width=300",
            followers: artistData.nb_fan || 10000,
            genres: artistData.genres || ["Pop", "Rock"],
          })
        } else {
          // If API fails, create a placeholder artist
          setArtist({
            id: artistId,
            name: "Sample Artist",
            image: "/placeholder.svg?height=300&width=300",
            followers: 10000,
            genres: ["Pop", "Rock"],
          })
        }

        // Get top tracks
        const tracksData = await getArtistTopTracks(artistId).catch(() => [])

        const formattedTracks = Array.isArray(tracksData)
          ? tracksData.slice(0, 10).map((track) => ({
              id: track.id || `track-${Math.random()}`,
              title: track.title || "Unknown Track",
              artist: track.artist?.name || "Unknown Artist",
              artistId: track.artist?.id || artistId,
              album: track.album?.title || "Unknown Album",
              albumId: track.album?.id || "unknown",
              duration: track.duration || 180,
              cover: track.album?.cover_medium || "/placeholder.svg?height=300&width=300",
              audioUrl: track.preview || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            }))
          : []

        setTopSongs(formattedTracks)

        // Get albums (mock data for now)
        setAlbums([
          {
            id: "album-1",
            title: "Greatest Hits",
            artist: artist?.name || "Unknown Artist",
            artistId: artistId,
            cover: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "album-2",
            title: "New Release",
            artist: artist?.name || "Unknown Artist",
            artistId: artistId,
            cover: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "album-3",
            title: "Classic Album",
            artist: artist?.name || "Unknown Artist",
            artistId: artistId,
            cover: "/placeholder.svg?height=300&width=300",
          },
          {
            id: "album-4",
            title: "Debut Album",
            artist: artist?.name || "Unknown Artist",
            artistId: artistId,
            cover: "/placeholder.svg?height=300&width=300",
          },
        ])

        // Get related artists
        const relatedData = await getRelatedArtists(artistId).catch(() => [])

        const formattedArtists = Array.isArray(relatedData)
          ? relatedData.slice(0, 6).map((artist) => ({
              id: artist.id || `artist-${Math.random()}`,
              name: artist.name || "Unknown Artist",
              image: artist.picture_medium || "/placeholder.svg?height=300&width=300",
            }))
          : []

        setRelatedArtists(
          formattedArtists.length > 0
            ? formattedArtists
            : [
                {
                  id: "related-1",
                  name: "Related Artist 1",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  id: "related-2",
                  name: "Related Artist 2",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  id: "related-3",
                  name: "Related Artist 3",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  id: "related-4",
                  name: "Related Artist 4",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  id: "related-5",
                  name: "Related Artist 5",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  id: "related-6",
                  name: "Related Artist 6",
                  image: "/placeholder.svg?height=300&width=300",
                },
              ],
        )
      } catch (error) {
        console.error("Error fetching artist details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtistDetails()
  }, [artistId])

  const handlePlayPause = () => {
    if (topSongs.length === 0) return

    const isPlayingThisArtist = currentSong && currentSong.artistId === artistId

    if (isPlayingThisArtist && isPlaying) {
      togglePlay()
    } else if (isPlayingThisArtist && !isPlaying) {
      togglePlay()
    } else {
      setCurrentSong(topSongs[0])
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8">
          <Skeleton className="absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end">
            <Skeleton className="h-32 w-32 rounded-full mr-6" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-32" />

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Artist not found</h2>
        <p className="text-muted-foreground mb-4">The artist you're looking for doesn't exist or couldn't be loaded.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row items-center md:items-end">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background mb-4 md:mb-0 md:mr-6">
            <Image src={artist.image || "/placeholder.svg"} alt={artist.name} fill className="object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">{artist.name}</h1>
            <p className="text-muted-foreground">
              {artist.followers.toLocaleString()} followers •{artist.genres.join(", ")}
            </p>
          </div>
        </div>
      </div>

      <Button size="lg" className="rounded-full" onClick={handlePlayPause} disabled={topSongs.length === 0}>
        {isPlaying && currentSong && currentSong.artistId === artistId ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Play
          </>
        )}
      </Button>

      <Tabs defaultValue="songs">
        <TabsList>
          <TabsTrigger value="songs">Popular</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="similar">Similar Artists</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Popular Songs</h2>

          {topSongs.length > 0 ? (
            <div className="space-y-1">
              {topSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 rounded-md hover:bg-accent/50 ${
                    currentSong?.id === song.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center text-muted-foreground w-6">
                    {currentSong?.id === song.id && isPlaying ? (
                      <div className="w-4 h-4 relative flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse absolute"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <SongCard song={song} variant="row" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No songs available for this artist.</p>
          )}
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="similar" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Fans Also Like</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
