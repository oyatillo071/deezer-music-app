import axios from "axios";

// Base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://deezerdevs-deezer.p.rapidapi.com";

// Helper function to get API key
const getApiKey = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("music_api_key") ||
    process.env.NEXT_PUBLIC_MUSIC_API_KEY
  );
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
  },
});

// Add request interceptor to add API key to each request
apiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers["x-rapidapi-key"] = apiKey;
  } else {
    console.warn(
      "API key is missing. Requests will likely fail with 401 errors."
    );
  }
  return config;
});

// Generate a random ID within a range
const getRandomId = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Search for tracks, artists, or albums
export const searchMusic = async (
  query: string,
  type: "track" | "artist" | "album" = "track"
) => {
  try {
    const response = await apiClient.get(`/search`, {
      params: { q: query },
    });

    // Filter results based on type if needed
    if (response.data && response.data.data) {
      if (type === "track") {
        return response.data.data.filter((item: any) => item.type === "track");
      } else if (type === "album") {
        return response.data.data.filter(
          (item: any) => item.album && item.album.id
        );
      } else if (type === "artist") {
        return response.data.data.filter(
          (item: any) => item.artist && item.artist.id
        );
      }
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Error searching music:", error);
    return [];
  }
};

// Get track details
export const getTrack = async (id: string) => {
  try {
    const response = await apiClient.get(`/track/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting track:", error);
    // If specific track fails, try to get a random track
    return getRandomTrack();
  }
};

// Get a random track
export const getRandomTrack = async () => {
  try {
    // Generate a random track ID between 1 and 10000000
    const randomId = getRandomId(1, 10000000);
    const response = await apiClient.get(`/track/${randomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting random track:", error);
    // Try another random ID if this one fails
    const newRandomId = getRandomId(1, 10000000);
    try {
      const retryResponse = await apiClient.get(`/track/${newRandomId}`);
      return retryResponse.data;
    } catch (retryError) {
      console.error("Error on retry for random track:", retryError);
      return getMockTracks()[0];
    }
  }
};

// Get album details
export const getAlbum = async (id: string) => {
  try {
    const response = await apiClient.get(`/album/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting album:", error);
    // If specific album fails, try to get a random album
    return getRandomAlbum();
  }
};

// Get a random album
export const getRandomAlbum = async () => {
  try {
    // Generate a random album ID between 1 and 1000000
    const randomId = getRandomId(1, 1000000);
    const response = await apiClient.get(`/album/${randomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting random album:", error);
    // Try another random ID if this one fails
    const newRandomId = getRandomId(1, 1000000);
    try {
      const retryResponse = await apiClient.get(`/album/${newRandomId}`);
      return retryResponse.data;
    } catch (retryError) {
      console.error("Error on retry for random album:", retryError);
      return getMockAlbums()[0];
    }
  }
};

// Get artist details
export const getArtist = async (artistNameOrId: string) => {
  try {
    // If the input is a name, use it directly, otherwise use the ID
    const endpoint = isNaN(Number(artistNameOrId))
      ? `/search?q=${encodeURIComponent(artistNameOrId)}`
      : `/artist/${artistNameOrId}`;

    const response = await apiClient.get(endpoint);

    // If we searched by name, get the first artist from results
    if (isNaN(Number(artistNameOrId)) && response.data && response.data.data) {
      const artists = response.data.data.filter(
        (item: any) =>
          item.artist &&
          item.artist.name.toLowerCase().includes(artistNameOrId.toLowerCase())
      );

      if (artists.length > 0) {
        // Get the artist details using the ID
        const artistId = artists[0].artist.id;
        const artistResponse = await apiClient.get(`/artist/${artistId}`);
        return artistResponse.data;
      }
    } else {
      return response.data;
    }

    throw new Error("Artist not found");
  } catch (error) {
    console.error("Error getting artist:", error);
    // If specific artist fails, try to get a random artist
    return getRandomArtist();
  }
};

// Get artist tracks using the tracklist URL
export const getArtistTracks = async (artistData: any) => {
  try {
    if (!artistData || !artistData.tracklist) {
      throw new Error("Artist tracklist URL not found");
    }

    // Extract the tracklist URL from the artist data
    const tracklistUrl = artistData.tracklist;

    // Make a direct request to the tracklist URL
    // We need to extract just the endpoint part from the full URL
    const tracklistEndpoint = tracklistUrl.replace(
      "https://api.deezer.com",
      ""
    );

    const response = await apiClient.get(tracklistEndpoint);
    return response.data.data || [];
  } catch (error) {
    console.error("Error getting artist tracks:", error);
    return [];
  }
};

// Get artist albums
export const getArtistAlbums = async (artistId: string) => {
  try {
    // Search for albums by this artist
    const response = await apiClient.get(`/search`, {
      params: { q: `artist:"${artistId}"`, type: "album" },
    });

    if (response.data && response.data.data) {
      // Filter unique albums
      const uniqueAlbums = new Map();
      response.data.data.forEach((item: any) => {
        if (item.album && !uniqueAlbums.has(item.album.id)) {
          uniqueAlbums.set(item.album.id, item.album);
        }
      });

      return Array.from(uniqueAlbums.values());
    }

    return [];
  } catch (error) {
    console.error("Error getting artist albums:", error);
    return [];
  }
};

// Get playlist details
export const getPlaylist = async (id: string) => {
  try {
    const response = await apiClient.get(`/playlist/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting playlist:", error);
    // If specific playlist fails, try to get a random playlist
    return getRandomPlaylist();
  }
};

// Get a random playlist
export const getRandomPlaylist = async () => {
  try {
    // Generate a random playlist ID between 1 and 10000
    // Using a smaller range for playlists as they might be fewer
    const randomId = getRandomId(1, 10000);
    const response = await apiClient.get(`/playlist/${randomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting random playlist:", error);
    // Try another random ID if this one fails
    const newRandomId = getRandomId(1, 10000);
    try {
      const retryResponse = await apiClient.get(`/playlist/${newRandomId}`);
      return retryResponse.data;
    } catch (retryError) {
      console.error("Error on retry for random playlist:", retryError);
      return null;
    }
  }
};

// Get featured playlists
export const getFeaturedPlaylists = async () => {
  try {
    // Since there's no direct "featured playlists" endpoint,
    // we'll get several random playlists
    const playlists = [];
    for (let i = 0; i < 6; i++) {
      const randomId = getRandomId(1, 10000);
      try {
        const response = await apiClient.get(`/playlist/${randomId}`);
        if (response.data) {
          playlists.push(response.data);
        }
      } catch (error) {
        console.error(`Error getting random playlist ${randomId}:`, error);
      }
    }
    return playlists;
  } catch (error) {
    console.error("Error getting featured playlists:", error);
    return [];
  }
};

// Get new releases
export const getNewReleases = async () => {
  try {
    // Try to get popular albums by searching for popular artists
    const popularArtists = [
      "eminem",
      "rihanna",
      "drake",
      "beyonce",
      "taylor swift",
      "ed sheeran",
    ];
    const randomArtist =
      popularArtists[Math.floor(Math.random() * popularArtists.length)];

    const response = await apiClient.get(`/search`, {
      params: { q: randomArtist },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      // Extract unique albums
      const uniqueAlbums = new Map();
      response.data.data.forEach((item: any) => {
        if (item.album && !uniqueAlbums.has(item.album.id)) {
          uniqueAlbums.set(item.album.id, {
            id: item.album.id,
            title: item.album.title,
            artist: item.artist.name,
            artistId: item.artist.id,
            cover: item.album.cover_medium,
          });
        }
      });

      return Array.from(uniqueAlbums.values()).slice(0, 6);
    }

    // If search fails, get mock albums
    return getMockAlbums();
  } catch (error) {
    console.error("Error getting new releases:", error);
    return getMockAlbums();
  }
};

// Get random albums
export const getRandomAlbums = async (count = 6) => {
  try {
    const albums = [];
    for (let i = 0; i < count; i++) {
      const randomId = getRandomId(1, 1000000);
      try {
        const response = await apiClient.get(`/album/${randomId}`);
        if (response.data) {
          albums.push(response.data);
        }
      } catch (error) {
        console.error(`Error getting random album ${randomId}:`, error);
      }
    }

    if (albums.length < count) {
      // Fill with mock albums if we couldn't get enough
      const mockAlbums = getMockAlbums();
      albums.push(...mockAlbums.slice(0, count - albums.length));
    }

    return albums;
  } catch (error) {
    console.error("Error getting random albums:", error);
    return getMockAlbums();
  }
};

// Get random tracks
export const getRandomTracks = async (count = 6) => {
  try {
    const tracks = [];
    for (let i = 0; i < count; i++) {
      const randomId = getRandomId(1, 10000000);
      try {
        const response = await apiClient.get(`/track/${randomId}`);
        if (response.data) {
          tracks.push(response.data);
        }
      } catch (error) {
        console.error(`Error getting random track ${randomId}:`, error);
      }
    }

    // If we couldn't get enough tracks, try searching for popular songs
    if (tracks.length < count / 2) {
      const popularSongs = ["love", "dance", "happy", "sad", "life", "dream"];
      const randomTerm =
        popularSongs[Math.floor(Math.random() * popularSongs.length)];

      try {
        const response = await apiClient.get(`/search`, {
          params: { q: randomTerm },
        });

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const searchTracks = response.data.data.slice(
            0,
            count - tracks.length
          );
          tracks.push(...searchTracks);
        }
      } catch (searchError) {
        console.error("Error searching for tracks:", searchError);
      }
    }

    if (tracks.length < count) {
      // Fill with mock tracks if we couldn't get enough
      const mockTracks = getMockTracks();
      tracks.push(...mockTracks.slice(0, count - tracks.length));
    }

    return tracks;
  } catch (error) {
    console.error("Error getting random tracks:", error);
    return getMockTracks();
  }
};

// Get chart tracks - MODIFIED to handle 404 error
export const getChartTracks = async () => {
  try {
    // First try to search for popular songs instead of using chart endpoint
    const popularSongs = ["love", "dance", "happy", "sad", "life", "dream"];
    const randomTerm =
      popularSongs[Math.floor(Math.random() * popularSongs.length)];

    const response = await apiClient.get(`/search`, {
      params: { q: randomTerm },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }

    // If search fails, fall back to random tracks
    return getRandomTracks(10);
  } catch (error) {
    console.error("Error getting chart tracks:", error);
    return getRandomTracks(10);
  }
};

// Get popular artists (local implementation)
export const getPopularArtists = async () => {
  // List of popular artists with their details
  const popularArtists = [
    {
      id: "13",
      name: "Eminem",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/19cc38f9d69b352f718782e7a22f9c32/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/19cc38f9d69b352f718782e7a22f9c32/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/19cc38f9d69b352f718782e7a22f9c32/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/19cc38f9d69b352f718782e7a22f9c32/1000x1000-000000-80-0-0.jpg",
      nb_fan: 18156573,
    },
    {
      id: "564",
      name: "Rihanna",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/3461e9ba41f8a0e6b9c120e144a1f109/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/3461e9ba41f8a0e6b9c120e144a1f109/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/3461e9ba41f8a0e6b9c120e144a1f109/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/3461e9ba41f8a0e6b9c120e144a1f109/1000x1000-000000-80-0-0.jpg",
      nb_fan: 15000000,
    },
    {
      id: "246791",
      name: "Drake",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/5d2fa7f140a6bdc2c864c3465a61fc71/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/5d2fa7f140a6bdc2c864c3465a61fc71/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/5d2fa7f140a6bdc2c864c3465a61fc71/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/5d2fa7f140a6bdc2c864c3465a61fc71/1000x1000-000000-80-0-0.jpg",
      nb_fan: 14000000,
    },
    {
      id: "145",
      name: "Beyoncé",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/c87e18302d3e64b7b71d2e90e2a88af0/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/c87e18302d3e64b7b71d2e90e2a88af0/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/c87e18302d3e64b7b71d2e90e2a88af0/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/c87e18302d3e64b7b71d2e90e2a88af0/1000x1000-000000-80-0-0.jpg",
      nb_fan: 13000000,
    },
    {
      id: "4050205",
      name: "The Weeknd",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/033c9b5f5a42d5bd21fb8c1a44eea056/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/033c9b5f5a42d5bd21fb8c1a44eea056/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/033c9b5f5a42d5bd21fb8c1a44eea056/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/033c9b5f5a42d5bd21fb8c1a44eea056/1000x1000-000000-80-0-0.jpg",
      nb_fan: 12000000,
    },
    {
      id: "384236",
      name: "Ed Sheeran",
      picture_small:
        "https://cdn-images.dzcdn.net/images/artist/2a03fcb8c262ee280b7d5e90ef5066c8/56x56-000000-80-0-0.jpg",
      picture_medium:
        "https://cdn-images.dzcdn.net/images/artist/2a03fcb8c262ee280b7d5e90ef5066c8/250x250-000000-80-0-0.jpg",
      picture_big:
        "https://cdn-images.dzcdn.net/images/artist/2a03fcb8c262ee280b7d5e90ef5066c8/500x500-000000-80-0-0.jpg",
      picture_xl:
        "https://cdn-images.dzcdn.net/images/artist/2a03fcb8c262ee280b7d5e90ef5066c8/1000x1000-000000-80-0-0.jpg",
      nb_fan: 11000000,
    },
  ];

  return popularArtists;
};

// Get a random artist
export const getRandomArtist = async () => {
  try {
    // Generate a random artist ID between 1 and 1000000
    const randomId = getRandomId(1, 1000000);
    const response = await apiClient.get(`/artist/${randomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting random artist:", error);
    // Try another random ID if this one fails
    const newRandomId = getRandomId(1, 1000000);
    try {
      const retryResponse = await apiClient.get(`/artist/${newRandomId}`);
      return retryResponse.data;
    } catch (retryError) {
      console.error("Error on retry for random artist:", retryError);
      // Return a popular artist as fallback
      const popularArtists = await getPopularArtists();
      return popularArtists[Math.floor(Math.random() * popularArtists.length)];
    }
  }
};

// Add a function to generate mock tracks when API fails
function getMockTracks() {
  return [
    {
      id: "mock-1",
      title: "Blinding Lights",
      artist: { name: "The Weeknd", id: "artist-1" },
      album: {
        title: "After Hours",
        id: "album-1",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 200,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "mock-2",
      title: "Bad Guy",
      artist: { name: "Billie Eilish", id: "artist-2" },
      album: {
        title: "When We All Fall Asleep",
        id: "album-2",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 194,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "mock-3",
      title: "Levitating",
      artist: { name: "Dua Lipa", id: "artist-3" },
      album: {
        title: "Future Nostalgia",
        id: "album-3",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 203,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "mock-4",
      title: "Stay",
      artist: { name: "The Kid LAROI", id: "artist-4" },
      album: {
        title: "F*CK LOVE",
        id: "album-4",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 141,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
      id: "mock-5",
      title: "Montero",
      artist: { name: "Lil Nas X", id: "artist-5" },
      album: {
        title: "Montero",
        id: "album-5",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 137,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
    {
      id: "mock-6",
      title: "Save Your Tears",
      artist: { name: "The Weeknd", id: "artist-1" },
      album: {
        title: "After Hours",
        id: "album-1",
        cover_medium: "/placeholder.svg?height=300&width=300",
      },
      duration: 215,
      preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    },
  ];
}

function getMockAlbums() {
  return [
    {
      id: "album-1",
      title: "After Hours",
      artist: { name: "The Weeknd", id: "artist-1" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "album-2",
      title: "When We All Fall Asleep",
      artist: { name: "Billie Eilish", id: "artist-2" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "album-3",
      title: "Future Nostalgia",
      artist: { name: "Dua Lipa", id: "artist-3" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "album-4",
      title: "F*CK LOVE",
      artist: { name: "The Kid LAROI", id: "artist-4" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "album-5",
      title: "Montero",
      artist: { name: "Lil Nas X", id: "artist-5" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "album-6",
      title: "Planet Her",
      artist: { name: "Doja Cat", id: "artist-6" },
      cover_medium: "/placeholder.svg?height=300&width=300",
    },
  ];
}
