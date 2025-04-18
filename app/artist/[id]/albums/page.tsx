"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlbumCard } from "@/components/album-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Music } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getArtist, getArtistAlbums } from "@/lib/music-api";

export default function ArtistAlbumsPage() {
  const params = useParams();
  const artistId = params.id as string;

  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistAlbums = async () => {
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
        setAlbums(formattedAlbums);
      } catch (error) {
        toast.error("Error fetching artist albums:", error);
        setError("Failed to load artist albums. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAlbums();
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
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
        <h1 className="text-2xl font-bold">{artist.name} - Albums</h1>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
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
          <Button asChild>
            <Link href={`/artist/${artistId}`}>Back to Artist</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
