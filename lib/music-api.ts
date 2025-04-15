// Base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.deezer.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_MUSIC_API_KEY;

// Helper function to get API key
const getApiKey = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("music_api_key") ||
    process.env.NEXT_PUBLIC_MUSIC_API_KEY
  );
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred while fetching data");
  }
  return response.json();
};

// Date formatter without date-fns
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Search for tracks, artists, or albums
export const searchMusic = async (
  query: string,
  type: "track" | "artist" | "album" = "track"
) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(
    `${API_BASE_URL}/search?q=${encodeURIComponent(
      query
    )}&type=${type}&apikey=${apiKey}`
  );
  return handleResponse(response);
};

// Get track details
export const getTrack = async (id: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(`${API_BASE_URL}/track/${id}?apikey=${apiKey}`);
  return handleResponse(response);
};

// Get album details
export const getAlbum = async (id: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(`${API_BASE_URL}/album/${id}?apikey=${apiKey}`);
  const album = await handleResponse(response);

  if (album.release_date) {
    album.release_date = formatDate(album.release_date);
  }

  return album;
};

// Get artist details
export const getArtist = async (id: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(`${API_BASE_URL}/artist/${id}?apikey=${apiKey}`);
  return handleResponse(response);
};

// Get artist top tracks
export const getArtistTopTracks = async (id: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(
    `${API_BASE_URL}/artist/${id}/top?apikey=${apiKey}`
  );
  return handleResponse(response);
};

// Get related artists
export const getRelatedArtists = async (id: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(
    `${API_BASE_URL}/artist/${id}/related?apikey=${apiKey}`
  );
  return handleResponse(response);
};

// Get featured playlists
export const getFeaturedPlaylists = async () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(
    `${API_BASE_URL}/editorial/0/charts?apikey=${apiKey}`
  );
  return handleResponse(response);
};

// Get new releases
export const getNewReleases = async () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const response = await fetch(
    `${API_BASE_URL}/chart/0/albums?apikey=${apiKey}`
  );
  return handleResponse(response);
};

// Get random track
export const getRandomTracks = async () => {
  const randomWords = [
    "love",
    "summer",
    "dream",
    "night",
    "dance",
    "happy",
    "sky",
    "fire",
  ];
  const randomQuery =
    randomWords[Math.floor(Math.random() * randomWords.length)];

  const searchResult = await searchMusic(randomQuery, "track");
  if (searchResult.data && searchResult.data.length > 0) {
    const randomIndex = Math.floor(Math.random() * searchResult.data.length);
    return searchResult.data[randomIndex];
  } else {
    throw new Error("No tracks found");
  }
};
