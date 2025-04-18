"use client";

import { useEffect, useState } from "react";
import { AlbumCard } from "@/components/album-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChartTracks, getAlbum, getRandomAlbums } from "@/lib/music-api";
import { Disc, Music } from "lucide-react";
import Link from "next/link";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);

        // First try to get albums from chart tracks
        const tracksData = await getChartTracks();
        const albumPromises = [];
        const uniqueAlbumIds = new Set();

        // Get unique album IDs from tracks
        if (Array.isArray(tracksData)) {
          for (const track of tracksData) {
            if (
              track.album &&
              track.album.id &&
              !uniqueAlbumIds.has(track.album.id)
            ) {
              uniqueAlbumIds.add(track.album.id);
              albumPromises.push(getAlbum(track.album.id));

              // Limit to 12 albums
              if (albumPromises.length >= 12) break;
            }
          }
        }

        // If we don't have enough albums, get random ones
        if (albumPromises.length < 6) {
          const randomAlbumsData = await getRandomAlbums(
            12 - albumPromises.length
          );
          if (Array.isArray(randomAlbumsData)) {
            for (const album of randomAlbumsData) {
              albumPromises.push(Promise.resolve(album));
            }
          }
        }

        // Fetch album details
        const albumsData = await Promise.all(albumPromises);
        const formattedAlbums = albumsData
          .filter((album) => album) // Filter out null results
          .map((album) => ({
            id: album.id || `album-${Math.random()}`,
            title: album.title || "Unknown Album",
            artist: album.artist?.name || "Unknown Artist",
            artistId: album.artist?.id || "unknown",
            cover:
              album.cover_medium || "/placeholder.svg?height=300&width=300",
          }));

        setAlbums(formattedAlbums);
      } catch (error) {
        toast.error("Error fetching albums:", error);

        // Fallback to random albums
        try {
          const randomAlbumsData = await getRandomAlbums(12);
          if (Array.isArray(randomAlbumsData)) {
            const formattedAlbums = randomAlbumsData.map((album) => ({
              id: album.id || `album-${Math.random()}`,
              title: album.title || "Unknown Album",
              artist: album.artist?.name || "Unknown Artist",
              artistId: album.artist?.id || "unknown",
              cover:
                album.cover_medium || "/placeholder.svg?height=300&width=300",
            }));
            setAlbums(formattedAlbums);
          }
        } catch (fallbackError) {
          toast.error("Error fetching fallback albums:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Albums</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No albums found</h3>
          <p className="text-muted-foreground mb-4">
            Try refreshing the page or check back later
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
