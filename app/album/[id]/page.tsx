"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/store/player-store";
import { formatDuration } from "@/lib/utils";
import { Play, Pause, Clock, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAlbum, getRandomAlbum } from "@/lib/music-api";

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentSong, isPlaying, setCurrentSong, togglePlay } =
    usePlayerStore();

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        setLoading(true);

        const albumData = await getAlbum(albumId);

        if (!albumData) {
          throw new Error("Album not found");
        }

        // Format the album data
        const formattedAlbum = {
          id: albumData.id || albumId,
          title: albumData.title || "Unknown Album",
          artist: albumData.artist?.name || "Unknown Artist",
          artistId: albumData.artist?.id || "unknown",
          cover:
            albumData.cover_medium || "/placeholder.svg?height=300&width=300",
          releaseDate: albumData.release_date || "2023",
          trackCount: albumData.nb_tracks || 0,
          genres: albumData.genres?.data?.map((genre: any) => genre.name) || [],
          label: albumData.label || "",
          tracks: Array.isArray(albumData.tracks?.data)
            ? albumData.tracks.data.map((track: any) => ({
                id: track.id || `track-${Math.random()}`,
                title: track.title || "Unknown Track",
                artist: albumData.artist?.name || "Unknown Artist",
                artistId: albumData.artist?.id || "unknown",
                album: albumData.title || "Unknown Album",
                albumId: albumData.id || albumId,
                duration: track.duration || 30,
                cover:
                  albumData.cover_medium ||
                  "/placeholder.svg?height=300&width=300",
                audioUrl:
                  track.preview ||
                  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              }))
            : [],
        };

        setAlbum(formattedAlbum);
      } catch (error) {
        toast.error("Error fetching album details:", error);
        setError(
          "Failed to load album details. Trying to get a random album..."
        );

        try {
          // Fallback to random album
          const randomAlbum = await getRandomAlbum();

          if (randomAlbum) {
            const formattedAlbum = {
              id: randomAlbum.id || albumId,
              title: randomAlbum.title || "Unknown Album",
              artist: randomAlbum.artist?.name || "Unknown Artist",
              artistId: randomAlbum.artist?.id || "unknown",
              cover:
                randomAlbum.cover_medium ||
                "/placeholder.svg?height=300&width=300",
              releaseDate: randomAlbum.release_date || "2023",
              trackCount: randomAlbum.nb_tracks || 0,
              genres:
                randomAlbum.genres?.data?.map((genre: any) => genre.name) || [],
              label: randomAlbum.label || "",
              tracks: Array.isArray(randomAlbum.tracks?.data)
                ? randomAlbum.tracks.data.map((track: any) => ({
                    id: track.id || `track-${Math.random()}`,
                    title: track.title || "Unknown Track",
                    artist: randomAlbum.artist?.name || "Unknown Artist",
                    artistId: randomAlbum.artist?.id || "unknown",
                    album: randomAlbum.title || "Unknown Album",
                    albumId: randomAlbum.id || albumId,
                    duration: track.duration || 30,
                    cover:
                      randomAlbum.cover_medium ||
                      "/placeholder.svg?height=300&width=300",
                    audioUrl:
                      track.preview ||
                      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                  }))
                : [],
            };

            setAlbum(formattedAlbum);
            setError("Showing a random album instead.");
          } else {
            setError("Could not load any album. Please try again later.");
          }
        } catch (fallbackError) {
          toast.error("Error fetching random album:", fallbackError);
          setError("Could not load any album. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [albumId]);

  const isCurrentAlbum = currentSong?.albumId === albumId;
  const songs = album?.tracks || [];

  const handlePlayPause = () => {
    if (songs.length === 0) return;

    if (isCurrentAlbum && isPlaying) {
      togglePlay();
    } else if (isCurrentAlbum && !isPlaying) {
      togglePlay();
    } else {
      setCurrentSong(songs[0]);
    }
  };

  const getTotalDuration = () => {
    return songs.reduce((total: number, song: any) => total + song.duration, 0);
  };

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
    );
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
    );
  }

  return (
    <div className="space-y-8 max-w-full">
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative aspect-square  md:w-64 w-32  flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={album.cover || "/placeholder.svg"}
            alt={album.title}
            fill
            className="object-cover rounded-md"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <h1 className="md:text-3xl text-lg sm:text-xl font-bold truncate">
            {album.title}
          </h1>
          <Link
            href={`/artist/${album.artistId}`}
            className="text-xl hover:underline block mt-2 truncate"
          >
            {album.artist}
          </Link>
          <div className="text-muted-foreground mt-2">
            <p className="truncate">
              {album.releaseDate} • {album.trackCount} songs •{" "}
              {formatDuration(getTotalDuration())}
            </p>
            {album.genres && album.genres.length > 0 && (
              <p className="mt-1 truncate">Genres: {album.genres.join(", ")}</p>
            )}
            {album.label && (
              <p className="mt-1 text-wrap truncate">Label: {album.label}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              size="lg"
              className="rounded-full"
              onClick={handlePlayPause}
              disabled={songs.length === 0}
            >
              {isPlaying && isCurrentAlbum ? (
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

      <div className="space-y-4 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b text-sm text-muted-foreground">
          <div className="w-6">#</div>
          <div>Song</div>
          <div>
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {songs.length > 0 ? (
          songs.map((song: any, index: number) => (
            <div
              key={song.id}
              className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 rounded-md hover:bg-accent/50 ${
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

              <div className="min-w-0 overflow-hidden">
                <SongCard song={song} variant="row" />
              </div>

              <div className="flex items-center text-muted-foreground whitespace-nowrap">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border rounded-md">
            <Music className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No tracks available for this album
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
