"use client";

import { useEffect, useState } from "react";
import { SongCard } from "@/components/song-card";
import { AlbumCard } from "@/components/album-card";
import { ArtistCard } from "@/components/artist-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getChartTracks,
  getPopularArtists,
  getRandomTrack,
  getAlbum,
} from "@/lib/music-api";
import { type Song, usePlayerStore } from "@/store/player-store";
import { Shuffle, Disc, Mic2, Sparkles } from "lucide-react";

export default function Home() {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, addToQueue } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get chart tracks for featured songs
        const tracksData = await getChartTracks();
        const formattedSongs = Array.isArray(tracksData)
          ? tracksData.slice(0, 6).map((song) => ({
              id: song.id || `song-${Math.random()}`,
              title: song.title || "Unknown Song",
              artist: song.artist?.name || "Unknown Artist",
              artistId: song.artist?.id || "unknown",
              album: song.album?.title || "Unknown Album",
              albumId: song.album?.id || "unknown",
              duration: song.duration || 180,
              cover:
                song.album?.cover_medium ||
                "/placeholder.svg?height=300&width=300",
              audioUrl:
                song.preview ||
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            }))
          : [];

        setFeaturedSongs(formattedSongs);

        // Get albums from track IDs for new releases
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

              // Limit to 6 albums
              if (albumPromises.length >= 6) break;
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

        setNewReleases(formattedAlbums);

        // Get popular artists
        const artistsData = await getPopularArtists();

        const formattedArtists = artistsData.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          image: artist.picture_medium,
        }));

        setPopularArtists(formattedArtists);

        // Add all songs to queue for continuous playback
        if (formattedSongs.length > 0) {
          formattedSongs.forEach((song) => {
            addToQueue(song);
          });
        }
      } catch (error) {
        toast.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToQueue]);

  const playRandomSong = async () => {
    try {
      // Get a random track from the API
      const randomTrack = await getRandomTrack();

      if (randomTrack) {
        const formattedSong: Song = {
          id: randomTrack.id || `song-${Math.random()}`,
          title: randomTrack.title || "Unknown Song",
          artist: randomTrack.artist?.name || "Unknown Artist",
          artistId: randomTrack.artist?.id || "unknown",
          album: randomTrack.album?.title || "Unknown Album",
          albumId: randomTrack.album?.id || "unknown",
          duration: randomTrack.duration || 180,
          cover:
            randomTrack.album?.cover_medium ||
            "/placeholder.svg?height=300&width=300",
          audioUrl:
            randomTrack.preview ||
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        };

        setCurrentSong(formattedSong);
      } else if (featuredSongs.length > 0) {
        // Fallback to featured songs if random track fails
        const randomIndex = Math.floor(Math.random() * featuredSongs.length);
        setCurrentSong(featuredSongs[randomIndex]);
      }
    } catch (error) {
      toast.error("Error playing random song:", error);

      // Fallback to featured songs if there's an error
      if (featuredSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * featuredSongs.length);
        setCurrentSong(featuredSongs[randomIndex]);
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ocean-darkest to-ocean-dark p-8 text-white mb-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to MusicStream</h1>
          <p className="text-ocean-lightest mb-6 max-w-2xl">
            Discover new music, create playlists, and enjoy your favorite songs.
            Your personal music experience starts here.
          </p>
          <Button
            onClick={playRandomSong}
            className="bg-ocean-light hover:bg-ocean-medium text-ocean-darkest"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Play Random Song
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <svg
            width="300"
            height="300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 16.5C9.51 16.5 7.5 14.49 7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5ZM12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-ocean-dark" />
            <h2 className="text-2xl font-bold text-ocean-darkest dark:text-white">
              Featured Songs
            </h2>
          </div>
          <Button
            onClick={playRandomSong}
            variant="outline"
            size="sm"
            className="border-ocean-medium text-ocean-dark hover:bg-ocean-lightest dark:border-ocean-medium dark:text-ocean-light dark:hover:bg-ocean-dark/20"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Play Random
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center mb-6">
          <Disc className="h-6 w-6 mr-2 text-ocean-dark" />
          <h2 className="text-2xl font-bold text-ocean-darkest dark:text-white">
            New Releases
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {newReleases.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center mb-6">
          <Mic2 className="h-6 w-6 mr-2 text-ocean-dark" />
          <h2 className="text-2xl font-bold text-ocean-darkest dark:text-white">
            Popular Artists
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
