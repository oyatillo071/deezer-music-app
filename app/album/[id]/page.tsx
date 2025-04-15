"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SongCard } from "@/components/song-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAlbum } from "@/lib/music-api"
import { type Song, usePlayerStore } from "@/store/player-store"
import { formatDuration } from "@/lib/utils"
import { Play, Pause, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AlbumPage() {
  const params = useParams()
  const albumId = params.id as string
  
  const [album, setAlbum] = useState<any>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  
  const { 
    currentSong, 
    isPlaying, 
    setCurrentSong, 
    togglePlay 
  } = usePlayerStore()
  
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        setLoading(true)
        
        // In a real app, this would be an actual API call
        // For now, we'll simulate with mock data
        
        const albumData = await getAlbum(albumId).catch(() => null)
        
        if (albumData) {
          setAlbum({
            id: albumData.id || albumId,
            title: albumData.title || "Unknown Album",
            artist: albumData.artist?.name || "Unknown Artist",
            artistId: albumData.artist?.id || "unknown",
            cover: albumData.cover_medium || "/placeholder.svg?height=300&width=300",
            releaseDate: albumData.release_date || "2023",
            trackCount: albumData.nb_tracks || 10
          })
          
          // Format tracks
          const formattedTracks = Array.isArray(albumData.tracks?.data) 
            ? albumData.tracks.data.map((track: any, index: number) => ({
                id: track.id || `track-${index}`,
                title: track.title || `Track ${index + 1}`,
                artist: albumData.artist?.name || "Unknown Artist",
                artistId: albumData.artist?.id || "unknown",
                album: albumData.title || "Unknown Album",
                albumId: albumData.id || albumId,
                duration: track.duration || 180,
                cover: albumData.cover_medium || "/placeholder.svg?height=300&width=300",
                audioUrl: track.preview || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
              }))
            : []
            
          setSongs(formattedTracks)
        } else {
          // If API fails, create a placeholder album
          setAlbum({
            id: albumId,
            title: "Sample Album",
            artist: "Sample Artist",
            artistId: "sample-artist",
            cover: "/placeholder.svg?height=300&width=300",
            releaseDate: "2023",
            trackCount: 10
          })
          
          // Create placeholder tracks
          setSongs(Array(10).fill(0).map((_, i) => ({
            id: `track-${i}`,
            title: `Track ${i + 1}`,
            artist: "Sample Artist",
            artistId: "sample-artist",
            album: "Sample Album",
            albumId: albumId,
            duration: 180,
            cover: "/placeholder.svg?height=300&width=300",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          })))
        }
      } catch (error) {
        console.error("Error fetching album details:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlbumDetails()
  }, [albumId])
  
  const handlePlayPause = () => {
    if (songs.length === 0) return
    
    const isPlayingThisAlbum = currentSong && currentSong.albumId === albumId
    
    if (isPlayingThisAlbum && isPlaying) {
      togglePlay()
    } else if (isPlayingThisAlbum && !isPlaying) {
      togglePlay()
    } else {
      setCurrentSong(songs[0])
    }
  }
  
  const getTotalDuration = () => {
    return songs.reduce((total, song) => total + song.duration, 0)
  }
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-64 w-64 rounded-md flex-shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-8   />
          <div className=\"space-y-4 flex-1">
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
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Album not found</h2>
        <p className="text-muted-foreground mb-4">
          The album you're looking for doesn't exist or couldn't be loaded.
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
        <div className="relative h-64 w-64 flex-shrink-0">
          <Image 
            src={album.cover || "/placeholder.svg"} 
            alt={album.title}
            fill
            className="object-cover rounded-md"
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <Link href={`/artist/${album.artistId}`} className="text-xl hover:underline block mt-2">
            {album.artist}
          </Link>
          <p className="text-muted-foreground mt-2">
            {album.releaseDate} • {album.trackCount} songs • {formatDuration(getTotalDuration())}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <Button 
              size="lg" 
              className="rounded-full"
              onClick={handlePlayPause}
              disabled={songs.length === 0}
            >
              {isPlaying && currentSong && currentSong.albumId === albumId ? (
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
      
      <div className="space-y-4">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b text-sm text-muted-foreground">
          <div className="w-6">#</div>
          <div>Title</div>
          <div>
            <Clock className="h-4 w-4" />
          </div>
        </div>
        
        {songs.map((song, index) => (
          <div 
            key={song.id}
            className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 rounded-md hover:bg-accent/50 ${
              currentSong?.id === song.id ? 'bg-accent' : ''
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
            
            <div className="flex items-center text-muted-foreground">
              {formatDuration(song.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
