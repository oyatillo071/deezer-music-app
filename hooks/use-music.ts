"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChartTracks,
  getRandomTracks,
  getNewReleases,
  getRandomAlbums,
  getPopularArtists,
  getTrack,
  getRandomTrack,
  getAlbum,
  getRandomAlbum,
  getArtist,
  getArtistTracks,
  getArtistAlbums,
  searchMusic,
  getRandomArtist,
} from "@/lib/music-api";
import type { Song } from "@/store/player-store";

// Local storage keys
const STORAGE_KEYS = {
  FEATURED_SONGS: "music_featured_songs",
  NEW_RELEASES: "music_new_releases",
  TOP_ARTISTS: "music_top_artists",
  SEARCH_RESULTS: "music_search_results",
  TRACK_DETAILS: "music_track_",
  ALBUM_DETAILS: "music_album_",
  ARTIST_DETAILS: "music_artist_",
};

// Helper to get data from local storage with expiration
const getFromStorage = <T>(
  key: string
): { data: T | null; expired: boolean } => {
  try {
    if (typeof window === "undefined") return { data: null, expired: true };

    const item = localStorage.getItem(key);
    if (!item) return { data: null, expired: true };

    const { data, expiry } = JSON.parse(item);
    const now = new Date().getTime();

    if (now > expiry) {
      return { data, expired: true };
    }

    return { data, expired: false };
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return { data: null, expired: true };
  }
};

// Helper to save data to local storage with expiration
const saveToStorage = <T>(key: string, data: T, expiryMinutes = 60) => {
  try {
    if (typeof window === "undefined") return;

    const expiry = new Date().getTime() + expiryMinutes * 60 * 1000;
    localStorage.setItem(key, JSON.stringify({ data, expiry }));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Format track data to Song type
const formatTrackToSong = (track: any): Song => ({
  id: track.id || `song-${Math.random()}`,
  title: track.title || "Unknown Song",
  artist: track.artist?.name || "Unknown Artist",
  artistId: track.artist?.id || "unknown",
  album: track.album?.title || "Unknown Album",
  albumId: track.album?.id || "unknown",
  duration: track.duration || 30, // All songs are 30 seconds
  cover: track.album?.cover_medium || "/placeholder.svg?height=300&width=300",
  audioUrl:
    track.preview ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
});

// Format album data
const formatAlbum = (album: any) => ({
  id: album.id || `album-${Math.random()}`,
  title: album.title || "Unknown Album",
  artist: album.artist?.name || "Unknown Artist",
  artistId: album.artist?.id || "unknown",
  cover: album.cover_medium || "/placeholder.svg?height=300&width=300",
});

// Format artist data
const formatArtist = (artist: any) => ({
  id: artist.id || `artist-${Math.random()}`,
  name: artist.name || "Unknown Artist",
  image: artist.picture_medium || "/placeholder.svg?height=300&width=300",
});

// Custom hook for featured songs
export function useFeaturedSongs() {
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage<Song[]>(
      STORAGE_KEYS.FEATURED_SONGS
    );
    if (data && !expired) {
      queryClient.setQueryData(["featuredSongs"], data);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ["featuredSongs"],
    queryFn: async () => {
      try {
        const tracksData = await getChartTracks();

        const formattedSongs = Array.isArray(tracksData)
          ? tracksData.slice(0, 6).map(formatTrackToSong)
          : [];

        // Save to local storage
        saveToStorage(STORAGE_KEYS.FEATURED_SONGS, formattedSongs, 60); // 1 hour expiry

        return formattedSongs;
      } catch (error) {
        console.error("Error fetching featured songs:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage<Song[]>(STORAGE_KEYS.FEATURED_SONGS);
        if (data) return data;

        // Fallback to random tracks
        const randomTracks = await getRandomTracks(6);
        const formattedSongs = randomTracks.map(formatTrackToSong);

        // Save fallback to local storage
        saveToStorage(STORAGE_KEYS.FEATURED_SONGS, formattedSongs, 30); // 30 min expiry for fallback

        return formattedSongs;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Custom hook for new releases
export function useNewReleases() {
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage(STORAGE_KEYS.NEW_RELEASES);
    if (data && !expired) {
      queryClient.setQueryData(["newReleases"], data);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ["newReleases"],
    queryFn: async () => {
      try {
        const albumsData = await getNewReleases();

        const formattedAlbums = Array.isArray(albumsData)
          ? albumsData.slice(0, 6).map(formatAlbum)
          : [];

        // Save to local storage
        saveToStorage(STORAGE_KEYS.NEW_RELEASES, formattedAlbums, 120); // 2 hours expiry

        return formattedAlbums;
      } catch (error) {
        console.error("Error fetching new releases:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(STORAGE_KEYS.NEW_RELEASES);
        if (data) return data;

        // Fallback to random albums
        const randomAlbums = await getRandomAlbums(6);
        const formattedAlbums = randomAlbums.map(formatAlbum);

        // Save fallback to local storage
        saveToStorage(STORAGE_KEYS.NEW_RELEASES, formattedAlbums, 30);

        return formattedAlbums;
      }
    },
    staleTime: 1000 * 60 * 120, // 2 hours
  });
}

// Custom hook for popular artists
export function usePopularArtists() {
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage(STORAGE_KEYS.TOP_ARTISTS);
    if (data && !expired) {
      queryClient.setQueryData(["popularArtists"], data);
    }
  }, [queryClient]);

  return useQuery({
    queryKey: ["popularArtists"],
    queryFn: async () => {
      try {
        const artistsData = await getPopularArtists();

        const formattedArtists = artistsData.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          image: artist.picture_medium,
        }));

        // Save to local storage
        saveToStorage(STORAGE_KEYS.TOP_ARTISTS, formattedArtists, 180); // 3 hours expiry

        return formattedArtists;
      } catch (error) {
        console.error("Error fetching popular artists:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(STORAGE_KEYS.TOP_ARTISTS);
        if (data) return data;

        // Return empty array as fallback
        return [];
      }
    },
    staleTime: 1000 * 60 * 180, // 3 hours
  });
}

// Custom hook for search results
export function useSearchResults(
  query: string,
  type: "track" | "album" | "artist" = "track"
) {
  const storageKey = `${STORAGE_KEYS.SEARCH_RESULTS}_${type}_${query}`;
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    if (!query) return;

    const { data, expired } = getFromStorage(storageKey);
    if (data && !expired) {
      queryClient.setQueryData(["search", type, query], data);
    }
  }, [query, type, storageKey, queryClient]);

  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      if (!query) return [];

      try {
        const searchData = await searchMusic(query, type);

        let formattedData = [];

        if (type === "track") {
          formattedData = Array.isArray(searchData)
            ? searchData.slice(0, 12).map(formatTrackToSong)
            : [];
        } else if (type === "album") {
          formattedData = Array.isArray(searchData)
            ? searchData.slice(0, 12).map(formatAlbum)
            : [];
        } else if (type === "artist") {
          formattedData = Array.isArray(searchData)
            ? searchData.slice(0, 12).map(formatArtist)
            : [];
        }

        // Save to local storage
        saveToStorage(storageKey, formattedData, 60); // 1 hour expiry

        return formattedData;
      } catch (error) {
        console.error(`Error searching for ${type}:`, error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(storageKey);
        if (data) return data;

        // Fallback to random data
        let fallbackData = [];

        if (type === "track") {
          const randomTracks = await getRandomTracks(6);
          fallbackData = randomTracks.map(formatTrackToSong);
        } else if (type === "album") {
          const randomAlbums = await getRandomAlbums(6);
          fallbackData = randomAlbums.map(formatAlbum);
        } else if (type === "artist") {
          const artists = await getPopularArtists();
          fallbackData = artists.slice(0, 6).map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            image: artist.picture_medium,
          }));
        }

        return fallbackData;
      }
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Custom hook for track details
export function useTrackDetails(trackId: string) {
  const storageKey = `${STORAGE_KEYS.TRACK_DETAILS}${trackId}`;
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage(storageKey);
    if (data && !expired) {
      queryClient.setQueryData(["track", trackId], data);
    }
  }, [trackId, storageKey, queryClient]);

  return useQuery({
    queryKey: ["track", trackId],
    queryFn: async () => {
      try {
        const trackData = await getTrack(trackId);

        if (!trackData) throw new Error("Track not found");

        const formattedTrack = formatTrackToSong(trackData);

        // Save to local storage
        saveToStorage(storageKey, formattedTrack, 1440); // 24 hours expiry

        return formattedTrack;
      } catch (error) {
        console.error("Error fetching track details:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(storageKey);
        if (data) return data;

        // Fallback to random track
        const randomTrack = await getRandomTrack();
        return formatTrackToSong(randomTrack);
      }
    },
    staleTime: 1000 * 60 * 1440, // 24 hours
  });
}

// Custom hook for album details
export function useAlbumDetails(albumId: string) {
  const storageKey = `${STORAGE_KEYS.ALBUM_DETAILS}${albumId}`;
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage(storageKey);
    if (data && !expired) {
      queryClient.setQueryData(["album", albumId], data);
    }
  }, [albumId, storageKey, queryClient]);

  return useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      try {
        const albumData = await getAlbum(albumId);

        if (!albumData) throw new Error("Album not found");

        const formattedAlbum = {
          id: albumData.id || albumId,
          title: albumData.title || "Unknown Album",
          artist: albumData.artist?.name || "Unknown Artist",
          artistId: albumData.artist?.id || "unknown",
          cover:
            albumData.cover_medium || "/placeholder.svg?height=300&width=300",
          releaseDate: albumData.release_date || "2023",
          trackCount: albumData.nb_tracks || 10,
          tracks: Array.isArray(albumData.tracks?.data)
            ? albumData.tracks.data.map((track: any, index: number) => ({
                id: track.id || `track-${index}`,
                title: track.title || `Track ${index + 1}`,
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

        // Save to local storage
        saveToStorage(storageKey, formattedAlbum, 1440); // 24 hours expiry

        return formattedAlbum;
      } catch (error) {
        console.error("Error fetching album details:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(storageKey);
        if (data) return data;

        // Fallback to random album
        const randomAlbum = await getRandomAlbum();
        return {
          id: randomAlbum.id || albumId,
          title: randomAlbum.title || "Unknown Album",
          artist: randomAlbum.artist?.name || "Unknown Artist",
          artistId: randomAlbum.artist?.id || "unknown",
          cover:
            randomAlbum.cover_medium || "/placeholder.svg?height=300&width=300",
          releaseDate: randomAlbum.release_date || "2023",
          trackCount: randomAlbum.nb_tracks || 10,
          tracks: [],
        };
      }
    },
    staleTime: 1000 * 60 * 1440, // 24 hours
  });
}

// Custom hook for artist details
export function useArtistDetails(artistNameOrId: string) {
  const storageKey = `${STORAGE_KEYS.ARTIST_DETAILS}${artistNameOrId}`;
  const queryClient = useQueryClient();

  // Check local storage first
  useEffect(() => {
    const { data, expired } = getFromStorage(storageKey);
    if (data && !expired) {
      queryClient.setQueryData(["artist", artistNameOrId], data);
    }
  }, [artistNameOrId, storageKey, queryClient]);

  return useQuery({
    queryKey: ["artist", artistNameOrId],
    queryFn: async () => {
      try {
        const artistData = await getArtist(artistNameOrId);

        if (!artistData) throw new Error("Artist not found");

        // Get artist tracks using the tracklist URL
        const tracks = await getArtistTracks(artistData);

        // Get artist albums
        const albums = await getArtistAlbums(artistData.id);

        const formattedArtist = {
          id: artistData.id || artistNameOrId,
          name: artistData.name || "Unknown Artist",
          image:
            artistData.picture_medium ||
            "/placeholder.svg?height=300&width=300",
          followers: artistData.nb_fan || 10000,
          genres: artistData.genres || ["Pop", "Rock"],
          topTracks: Array.isArray(tracks)
            ? tracks.slice(0, 10).map(formatTrackToSong)
            : [],
          albums: Array.isArray(albums)
            ? albums.slice(0, 6).map(formatAlbum)
            : [],
        };

        // Save to local storage
        saveToStorage(storageKey, formattedArtist, 1440); // 24 hours expiry

        return formattedArtist;
      } catch (error) {
        console.error("Error fetching artist details:", error);

        // Try to get from local storage even if expired
        const { data } = getFromStorage(storageKey);
        if (data) return data;

        // Fallback to random artist
        const randomArtist = await getRandomArtist();
        return {
          id: randomArtist.id || artistNameOrId,
          name: randomArtist.name || "Unknown Artist",
          image:
            randomArtist.picture_medium ||
            "/placeholder.svg?height=300&width=300",
          followers: randomArtist.nb_fan || 10000,
          genres: ["Pop", "Rock"],
          topTracks: [],
          albums: [],
        };
      }
    },
    staleTime: 1000 * 60 * 1440, // 24 hours
  });
}

// Custom hook for random track
export function useRandomTrack() {
  return useMutation({
    mutationFn: async () => {
      try {
        const randomTrack = await getRandomTrack();
        return formatTrackToSong(randomTrack);
      } catch (error) {
        console.error("Error getting random track:", error);
        throw error;
      }
    },
  });
}
