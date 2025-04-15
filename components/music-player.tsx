"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/player-store"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [showVolume, setShowVolume] = useState(false)

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeat,
    shuffle,
    favorites,
    currentTime,
    duration,
    togglePlay,
    setIsPlaying,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    updateCurrentTime,
    updateDuration,
  } = usePlayerStore()

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentSong, setIsPlaying])

  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      updateDuration(audio.duration)
    }

    const handleEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        nextSong()
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [nextSong, repeat, updateCurrentTime, updateDuration])

  // Check if current song is in favorites
  const isFavorite = currentSong ? favorites.some((song) => song.id === currentSong.id) : false

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    updateCurrentTime(newTime)
  }

  if (!currentSong) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-2 md:p-4">
      <audio ref={audioRef} src={currentSong.audioUrl} preload="auto" />

      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Song info */}
        <div className="flex items-center w-1/4 min-w-[120px]">
          <div className="relative h-12 w-12 mr-3 flex-shrink-0">
            <Image
              src={currentSong.cover || "/placeholder.svg?height=48&width=48"}
              alt={currentSong.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="truncate">
            <Link href={`/song/${currentSong.id}`} className="text-sm font-medium hover:underline truncate block">
              {currentSong.title}
            </Link>
            <Link
              href={`/artist/${currentSong.artistId}`}
              className="text-xs text-muted-foreground hover:underline truncate block"
            >
              {currentSong.artist}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => currentSong && toggleFavorite(currentSong)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Button variant="ghost" size="icon" onClick={toggleShuffle} className={shuffle ? "text-primary" : ""}>
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={previousSong}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="default" size="icon" className="rounded-full h-10 w-10" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSong}>
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={repeat !== "off" ? "text-primary" : ""}
            >
              {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center w-full gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">{formatDuration(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center justify-end w-1/4 min-w-[100px]">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleMute} onMouseEnter={() => setShowVolume(true)}>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            {showVolume && (
              <div
                className="absolute bottom-full right-0 p-4 bg-background border rounded-md shadow-md"
                onMouseLeave={() => setShowVolume(false)}
              >
                <Slider
                  orientation="vertical"
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  className="h-24"
                  onValueChange={(value) => setVolume(value[0])}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
