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
      params: { q: query, type },
    });
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
      return null;
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
      return null;
    }
  }
};

// Update the getArtist function to use the artist name instead of ID
export const getArtist = async (artistNameOrId: string) => {
  try {
    // If the input is a name, use it directly, otherwise use the ID
    const endpoint = isNaN(Number(artistNameOrId))
      ? `/artist/${encodeURIComponent(artistNameOrId)}`
      : `/artist/${artistNameOrId}`;

    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error getting artist:", error);
    // If specific artist fails, try to get a random artist
    return getRandomArtist();
  }
};

// Also update the getArtistTopTracks function to handle artist names
export const getArtistTopTracks = async (artistNameOrId: string) => {
  try {
    // First get the artist to ensure we have the correct ID
    const artist = await getArtist(artistNameOrId);
    if (!artist || !artist.id) throw new Error("Artist not found");

    // Then get the top tracks using the artist ID
    const response = await apiClient.get(`/artist/${artist.id}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error getting artist top tracks:", error);
    return [];
  }
};

// Update the getRelatedArtists function similarly
export const getRelatedArtists = async (artistNameOrId: string) => {
  try {
    // First get the artist to ensure we have the correct ID
    const artist = await getArtist(artistNameOrId);
    if (!artist || !artist.id) throw new Error("Artist not found");

    // Then get related artists using the artist ID
    const response = await apiClient.get(`/artist/${artist.id}/related`);
    return response.data.data || [];
  } catch (error) {
    console.error("Error getting related artists:", error);
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
      params: { q: randomArtist, type: "album" },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data.slice(0, 6);
    }

    // If search fails, get random albums
    return getRandomAlbums(6);
  } catch (error) {
    console.error("Error getting new releases:", error);
    return getRandomAlbums(6);
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
    return albums;
  } catch (error) {
    console.error("Error getting random albums:", error);
    return [];
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
          params: { q: randomTerm, type: "track" },
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

    return tracks;
  } catch (error) {
    console.error("Error getting random tracks:", error);
    return [];
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
      params: { q: randomTerm, type: "track" },
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

// Get chart albums
export const getChartAlbums = async () => {
  try {
    const response = await apiClient.get("/chart/0/albums");
    return response.data.data || [];
  } catch (error) {
    console.error("Error getting chart albums:", error);
    return getNewReleases();
  }
};

// Get chart artists - MODIFIED to handle 404 error
export const getChartArtists = async () => {
  try {
    // Try to search for popular artists instead of using chart endpoint
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
      params: { q: randomArtist, type: "artist" },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data;
    }

    // If search fails, get random artists
    return getRandomArtists(6);
  } catch (error) {
    console.error("Error getting chart artists:", error);
    return getRandomArtists(6);
  }
};

// Get random artists
export const getRandomArtists = async (count = 6) => {
  try {
    const artists = [];
    for (let i = 0; i < count; i++) {
      const randomId = getRandomId(1, 1000000);
      try {
        const response = await apiClient.get(`/artist/${randomId}`);
        if (response.data) {
          artists.push(response.data);
        }
      } catch (error) {
        console.error(`Error getting random artist ${randomId}:`, error);
      }
    }
    return artists;
  } catch (error) {
    console.error("Error getting random artists:", error);
    return [];
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
      return null;
    }
  }
};
