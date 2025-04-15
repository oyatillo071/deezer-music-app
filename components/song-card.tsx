"use client"

import { type Song, usePlayerStore } from "@/store/player-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDuration } from "@/lib/utils"
import { Play, MoreHorizontal, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SongCardProps {
  song: Song
  variant?: "default" | "compact" | "row"
}

export function SongCard({ song, variant = "default" }: SongCardProps) {
  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    togglePlay,
    addToQueue,
    toggleFavorite,
    favorites,
    playlists,
    addToPlaylist,
  } = usePlayerStore()

  const isActive = currentSong?.id === song.id
  const isFavorite = favorites.some((s) => s.id === song.id)

  const handlePlay = () => {
    if (isActive) {
      togglePlay()
    } else {
      setCurrentSong(song)
    }
  }

  if (variant === "row") {
    return (
      <div className={`flex items-center p-2 rounded-md hover:bg-accent/50 group ${isActive ? "bg-accent" : ""}`}>
        <div className="relative h-10 w-10 mr-3 flex-shrink-0">
          <Image
            src={song.cover || "/placeholder.svg?height=40&width=40"}
            alt={song.title}
            fill
            className="object-cover rounded-md"
          />
          <Button
            variant="default"
            size="icon"
            className="absolute inset-0 opacity-0 group-hover:opacity-90 rounded-md h-10 w-10 flex items-center justify-center"
            onClick={handlePlay}
          >
            <Play className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/song/${song.id}`} className="text-sm font-medium hover:underline truncate block">
            {song.title}
          </Link>
          <Link
            href={`/artist/${song.artistId}`}
            className="text-xs text-muted-foreground hover:underline truncate block"
          >
            {song.artist}
          </Link>
        </div>

        <div className="text-xs text-muted-foreground mr-2">{formatDuration(song.duration)}</div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => addToQueue(song)}>Add to Queue</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleFavorite(song)}>
              {isFavorite ? "Remove from Liked Songs" : "Add to Liked Songs"}
            </DropdownMenuItem>
            {playlists
              .filter((playlist) => playlist.id !== "favorites")
              .map((playlist) => (
                <DropdownMenuItem key={playlist.id} onClick={() => addToPlaylist(playlist.id, song)}>
                  Add to {playlist.name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="group relative">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src={song.cover || "/placeholder.svg?height=200&width=200"}
            alt={song.title}
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="default" size="icon" className="rounded-full h-10 w-10" onClick={handlePlay}>
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <Link href={`/song/${song.id}`} className="text-sm font-medium hover:underline truncate block">
            {song.title}
          </Link>
          <Link
            href={`/artist/${song.artistId}`}
            className="text-xs text-muted-foreground hover:underline truncate block"
          >
            {song.artist}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={song.cover || "/placeholder.svg?height=300&width=300"}
            alt={song.title}
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="default" size="icon" className="rounded-full h-12 w-12" onClick={handlePlay}>
              <Play className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => toggleFavorite(song)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
        <div className="p-3">
          <Link href={`/song/${song.id}`} className="font-medium hover:underline truncate block">
            {song.title}
          </Link>
          <Link
            href={`/artist/${song.artistId}`}
            className="text-sm text-muted-foreground hover:underline truncate block mt-1"
          >
            {song.artist}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
