"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/store/player-store";
import { ArrowLeft, Music } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getArtist, getArtistTracks } from "@/lib/music-api";

export default function ArtistSongsPage() {
  const params = useParams();
  const artistId = params.id as string;

  const { currentSong, isPlaying } = usePlayerStore();

  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get from localStorage first
        const storageKey = `music_artist_${artistId}`;
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
          try {
            const { data, expiry } = JSON.parse(storedData);
            const now = new Date().getTime();

            if (now < expiry) {
              setArtist(data.artist);
              setSongs(data.topSongs);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing stored artist data:", e);
          }
        }

        // Fetch from API if not in storage
        const artistData = await getArtist(artistId);

        if (!artistData) {
          throw new Error("Artist not found");
        }

        // Get artist tracks
        const tracksData = await getArtistTracks(artistData);

        // Format the data
        const formattedArtist = {
          id: artistData.id,
          name: artistData.name,
          image:
            artistData.picture_medium ||
            "/placeholder.svg?height=300&width=300",
          followers: artistData.nb_fan || 0,
        };

        const formattedSongs = Array.isArray(tracksData)
          ? tracksData.map((track: any) => ({
              id: track.id,
              title: track.title,
              artist: artistData.name,
              artistId: artistData.id,
              album: track.album?.title || "Unknown Album",
              albumId: track.album?.id || "unknown",
              duration: track.duration || 30,
              cover:
                track.album?.cover_medium ||
                "/placeholder.svg?height=300&width=300",
              audioUrl:
                track.preview ||
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            }))
          : [];

        setArtist(formattedArtist);
        setSongs(formattedSongs);
      } catch (error) {
        console.error("Error fetching artist songs:", error);
        setError("Failed to load artist songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistSongs();
  }, [artistId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="space-y-4">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Artist not found</h2>
        <p className="text-muted-foreground mb-4">
          The artist you're looking for doesn't exist or couldn't be loaded.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href={`/artist/${artistId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Artist
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{artist.name} - Songs</h1>
      </div>

      {songs.length > 0 ? (
        <div className="space-y-1">
          {songs.map((song, index) => (
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
        <div className="text-center py-12 border rounded-md">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No songs available</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any songs for this artist
          </p>
          <Button asChild>
            <Link href={`/artist/${artistId}`}>Back to Artist</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
