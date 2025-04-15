"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SongCard } from "@/components/song-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTrack, searchMusic } from "@/lib/music-api"
import { type Song, usePlayerStore } from "@/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, Heart, Share2, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SongDetailPage() {
  const params = useParams()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const { currentSong, isPlaying, setCurrentSong, togglePlay, favorites, toggleFavorite, addToQueue } = usePlayerStore()

  const isCurrentSong = currentSong?.id === songId
  const isFavorite = song ? favorites.some((s) => s.id === song.id) : false

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        setLoading(true)

        // In a real app, this would be an actual API call
        // For now, we'll simulate with mock data

        const songData = await getTrack(songId).catch(() => null)

        if (songData) {
          const formattedSong: Song = {
            id: songData.id || songId,
            title: songData.title || "Unknown Song",
            artist: songData.artist?.name || "Unknown Artist",
            artistId: songData.artist?.id || "unknown",
            album: songData.album?.title || "Unknown Album",
            albumId: songData.album?.id || "unknown",
            duration: songData.duration || 180,
            cover: songData.album?.cover_medium || "/placeholder.svg?height=300&width=300",
            audioUrl: songData.preview || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          }

          setSong(formattedSong)

          // Get related songs based on artist
          if (formattedSong.artist) {
            const relatedData = await searchMusic(formattedSong.artist).catch(() => [])

            const formatted = Array.isArray(relatedData)
              ? relatedData
                  .filter((s) => s.id !== songId)
                  .slice(0, 6)
                  .map((s) => ({
                    id: s.id || `song-${Math.random()}`,
                    title: s.title || "Unknown Song",
                    artist: s.artist?.name || "Unknown Artist",
                    artistId: s.artist?.id || "unknown",
                    album: s.album?.title || "Unknown Album",
                    albumId: s.album?.id || "unknown",
                    duration: s.duration || 180,
                    cover: s.album?.cover_medium || "/placeholder.svg?height=300&width=300",
                    audioUrl: s.preview || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                  }))
              : []

            setRelatedSongs(formatted)
          }
        } else {
          // If API fails, create a placeholder song
          setSong({
            id: songId,
            title: "Sample Song",
            artist: "Sample Artist",
            artistId: "sample-artist",
            album: "Sample Album",
            albumId: "sample-album",
            duration: 180,
            cover: "/placeholder.svg?height=300&width=300",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          })

          // Create some placeholder related songs
          setRelatedSongs(
            Array(6)
              .fill(0)
              .map((_, i) => ({
                id: `related-${i}`,
                title: `Related Song ${i + 1}`,
                artist: "Related Artist",
                artistId: "related-artist",
                album: "Related Album",
                albumId: "related-album",
                duration: 180,
                cover: "/placeholder.svg?height=300&width=300",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              })),
          )
        }
      } catch (error) {
        console.error("Error fetching song details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSongDetails()
  }, [songId])

  const handlePlayPause = () => {
    if (isCurrentSong) {
      togglePlay()
    } else if (song) {
      setCurrentSong(song)
    }
  }

  const handleAddToQueue = () => {
    if (song) {
      addToQueue(song)
    }
  }

  const handleToggleFavorite = () => {
    if (song) {
      toggleFavorite(song)
    }
  }

  const handleShare = () => {
    if (typeof navigator.share === "function") {
      navigator
        .share({
          title: song?.title || "Check out this song",
          text: `Listen to ${song?.title} by ${song?.artist}`,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch(console.error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-64 w-64 rounded-md flex-shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-2 mt-6">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
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
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Song not found</h2>
        <p className="text-muted-foreground mb-4">The song you're looking for doesn't exist or couldn't be loaded.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative h-64 w-64 flex-shrink-0">
          <Image src={song.cover || "/placeholder.svg"} alt={song.title} fill className="object-cover rounded-md" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <Link href={`/artist/${song.artistId}`} className="text-xl hover:underline block mt-2">
            {song.artist}
          </Link>
          <Link href={`/album/${song.albumId}`} className="text-muted-foreground hover:underline block mt-1">
            {song.album}
          </Link>
          <p className="text-muted-foreground mt-2">{formatDuration(song.duration)}</p>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button size="lg" className="rounded-full" onClick={handlePlayPause}>
              {isCurrentSong && isPlaying ? (
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
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={handleToggleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={handleAddToQueue}>
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Similar Songs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {relatedSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </div>
    </div>
  )
}
