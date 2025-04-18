"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/song-card";
import { AlbumCard } from "@/components/album-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/store/player-store";
import { Play, Pause, Music, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getArtist, getArtistTracks, getArtistAlbums } from "@/lib/music-api";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  cover: string;
  audioUrl: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
}

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.id as string;

  const { currentSong, isPlaying, setCurrentSong, togglePlay } =
    usePlayerStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
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
              setTopSongs(data.topSongs);
              setAlbums(data.albums);
              setLoading(false);
              return;
            }
          } catch (e) {
            toast.error("Error parsing stored artist data:", e);
          }
        }

        // Fetch from API if not in storage
        const artistData = await getArtist(artistId);

        if (!artistData) {
          throw new Error("Artist not found");
        }

        // Get artist tracks
        const tracksData = await getArtistTracks(artistData);

        // Get artist albums
        const albumsData = await getArtistAlbums(artistData.id);

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

        const formattedAlbums = Array.isArray(albumsData)
          ? albumsData.map((album: any) => ({
              id: album.id,
              title: album.title || "Unknown Album",
              artist: artistData.name,
              artistId: artistData.id,
              cover:
                album.cover_medium || "/placeholder.svg?height=300&width=300",
            }))
          : [];

        setArtist(formattedArtist);
        setTopSongs(formattedSongs);
        setAlbums(formattedAlbums);

        // Save to localStorage
        try {
          const expiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              data: {
                artist: formattedArtist,
                topSongs: formattedSongs,
                albums: formattedAlbums,
              },
              expiry,
            })
          );
        } catch (e) {
          toast.error("Error saving artist data to localStorage:", e);
        }
      } catch (error) {
        toast.error("Error fetching artist data:", error);
        setError("Failed to load artist data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  const handlePlayPause = () => {
    if (topSongs.length === 0) return;

    const isPlayingThisArtist =
      currentSong && currentSong.artistId === artistId;

    if (isPlayingThisArtist && isPlaying) {
      togglePlay();
    } else if (isPlayingThisArtist && !isPlaying) {
      togglePlay();
    } else {
      setCurrentSong(topSongs[0]);
    }
  };

  const navigateToSongs = () => {
    router.push(`/artist/${artistId}/songs`);
  };

  const navigateToAlbums = () => {
    router.push(`/artist/${artistId}/albums`);
  };

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

      <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row items-center md:items-end">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background mb-4 md:mb-0 md:mr-6">
            <Image
              src={artist.image || "/placeholder.svg?height=300&width=300"}
              alt={artist.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">{artist.name}</h1>
            <p className="text-muted-foreground">
              {artist.followers.toLocaleString()} followers
            </p>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="rounded-full"
        onClick={handlePlayPause}
        disabled={topSongs.length === 0}
      >
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
        </TabsList>

        <TabsContent value="songs" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Songs</h2>
            {topSongs.length > 5 && (
              <Button variant="outline" size="sm" onClick={navigateToSongs}>
                More <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {topSongs.length > 0 ? (
            <div className="space-y-1">
              {topSongs.slice(0, 5).map((song, index) => (
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Albums</h2>
            {albums.length > 4 && (
              <Button variant="outline" size="sm" onClick={navigateToAlbums}>
                More <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.slice(0, 4).map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No albums found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any albums for this artist
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
