"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type Playlist, usePlayerStore } from "@/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, Clock, Music, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

export default function PlaylistPage() {
  const params = useParams()
  const playlistId = params.id as string

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  const { playlists, currentSong, isPlaying, setCurrentSong, togglePlay, removeFromPlaylist } = usePlayerStore()

  useEffect(() => {
    // Find the playlist in the store
    const foundPlaylist = playlists.find((p) => p.id === playlistId)

    if (foundPlaylist) {
      setPlaylist(foundPlaylist)
    } else {
      // If not found, create a placeholder for UI
      setPlaylist({
        id: playlistId,
        name: "Unknown Playlist",
        songs: [],
      })
    }

    setLoading(false)
  }, [playlistId, playlists])

  const handlePlayPause = () => {
    if (!playlist || playlist.songs.length === 0) return

    const firstSong = playlist.songs[0]
    const isPlayingThisPlaylist = currentSong && playlist.songs.some((song) => song.id === currentSong.id)

    if (isPlayingThisPlaylist && isPlaying) {
      togglePlay()
    } else if (isPlayingThisPlaylist && !isPlaying) {
      togglePlay()
    } else {
      setCurrentSong(firstSong)
    }
  }

  const getTotalDuration = () => {
    if (!playlist) return 0
    return playlist.songs.reduce((total, song) => total + song.duration, 0)
  }

  const handleRemoveSong = (songId: string) => {
    removeFromPlaylist(playlistId, songId)
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
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
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

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
        <p className="text-muted-foreground mb-4">
          The playlist you're looking for doesn't exist or couldn't be loaded.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative h-64 w-64 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-md flex items-center justify-center">
          {playlist.cover ? (
            <Image
              src={playlist.cover || "/placeholder.svg"}
              alt={playlist.name}
              fill
              className="object-cover rounded-md"
            />
          ) : (
            <Music className="h-24 w-24 text-primary/60" />
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="text-muted-foreground mt-2">
            {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"} •{" "}
            {formatDuration(getTotalDuration())}
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button size="lg" className="rounded-full" onClick={handlePlayPause} disabled={playlist.songs.length === 0}>
              {isPlaying && currentSong && playlist.songs.some((song) => song.id === currentSong.id) ? (
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
          </div>
        </div>
      </div>

      {playlist.songs.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-2 border-b text-sm text-muted-foreground">
            <div className="hidden md:block">#</div>
            <div>Title</div>
            <div className="hidden md:block">
              <Clock className="h-4 w-4" />
            </div>
            <div></div>
          </div>

          {playlist.songs.map((song, index) => (
            <div
              key={song.id}
              className={`grid grid-cols-[1fr_auto] md:grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-2 rounded-md hover:bg-accent/50 ${
                currentSong?.id === song.id ? "bg-accent" : ""
              }`}
            >
              <div className="hidden md:flex items-center text-muted-foreground">
                {currentSong?.id === song.id && isPlaying ? (
                  <div className="w-4 h-4 relative flex items-center justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse absolute"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src={song.cover || "/placeholder.svg?height=40&width=40"}
                    alt={song.title}
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="font-medium">{song.title}</div>
                  <Link href={`/artist/${song.artistId}`} className="text-sm text-muted-foreground hover:underline">
                    {song.artist}
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex items-center text-muted-foreground">{formatDuration(song.duration)}</div>

              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/song/${song.id}`}>Go to Song</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/artist/${song.artistId}`}>Go to Artist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRemoveSong(song.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Remove from Playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No songs in this playlist</h3>
          <p className="text-muted-foreground mb-4">Add songs to this playlist to see them here</p>
          <Button asChild>
            <Link href="/">Discover Music</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
