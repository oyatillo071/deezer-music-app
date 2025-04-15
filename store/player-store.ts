import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Song = {
  id: string
  title: string
  artist: string
  artistId: string
  album: string
  albumId: string
  duration: number
  cover: string
  audioUrl: string
}

export type Playlist = {
  id: string
  name: string
  songs: Song[]
  cover?: string
}

type PlayerState = {
  currentSong: Song | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  queue: Song[]
  history: Song[]
  repeat: "off" | "all" | "one"
  shuffle: boolean
  apiKey: string | null
  favorites: Song[]
  playlists: Playlist[]
  currentTime: number
  duration: number

  // Actions
  setCurrentSong: (song: Song | null) => void
  togglePlay: () => void
  setIsPlaying: (isPlaying: boolean) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  nextSong: () => void
  previousSong: () => void
  addToQueue: (song: Song) => void
  clearQueue: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  setApiKey: (apiKey: string) => void
  toggleFavorite: (song: Song) => void
  createPlaylist: (name: string) => void
  addToPlaylist: (playlistId: string, song: Song) => void
  removeFromPlaylist: (playlistId: string, songId: string) => void
  updateCurrentTime: (time: number) => void
  updateDuration: (duration: number) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      isMuted: false,
      queue: [],
      history: [],
      repeat: "off",
      shuffle: false,
      apiKey: null,
      favorites: [],
      playlists: [{ id: "favorites", name: "Liked Songs", songs: [] }],
      currentTime: 0,
      duration: 0,

      setCurrentSong: (song) => set({ currentSong: song, isPlaying: !!song }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

      toggleMute: () =>
        set((state) => ({
          isMuted: !state.isMuted,
        })),

      nextSong: () => {
        const { queue, currentSong, history, repeat, shuffle } = get()

        if (queue.length === 0) {
          if (repeat === "all" && history.length > 0) {
            // If repeat all is on and we have history, play from beginning
            const nextSong = shuffle ? history[Math.floor(Math.random() * history.length)] : history[0]
            set({
              currentSong: nextSong,
              history: shuffle ? history : [nextSong, ...history.filter((s) => s.id !== nextSong.id)],
            })
          }
          return
        }

        // Add current song to history
        if (currentSong) {
          set({ history: [currentSong, ...get().history.slice(0, 49)] })
        }

        // Get next song from queue
        const nextSong = shuffle ? queue[Math.floor(Math.random() * queue.length)] : queue[0]

        set({
          currentSong: nextSong,
          queue: queue.filter((song) => song.id !== nextSong.id),
        })
      },

      previousSong: () => {
        const { history, currentSong } = get()

        if (history.length === 0) return

        const prevSong = history[0]

        // Add current song to queue if it exists
        if (currentSong) {
          set({ queue: [currentSong, ...get().queue] })
        }

        set({
          currentSong: prevSong,
          history: history.slice(1),
        })
      },

      addToQueue: (song) =>
        set((state) => ({
          queue: [...state.queue, song],
        })),

      clearQueue: () => set({ queue: [] }),

      toggleRepeat: () =>
        set((state) => ({
          repeat: state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off",
        })),

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

      setApiKey: (apiKey) => set({ apiKey }),

      toggleFavorite: (song) => {
        const { favorites, playlists } = get()
        const isFavorite = favorites.some((s) => s.id === song.id)

        const updatedFavorites = isFavorite ? favorites.filter((s) => s.id !== song.id) : [...favorites, song]

        // Also update the favorites playlist
        const updatedPlaylists = playlists.map((playlist) =>
          playlist.id === "favorites" ? { ...playlist, songs: updatedFavorites } : playlist,
        )

        set({
          favorites: updatedFavorites,
          playlists: updatedPlaylists,
        })
      },

      createPlaylist: (name) =>
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              id: `playlist-${Date.now()}`,
              name,
              songs: [],
            },
          ],
        })),

      addToPlaylist: (playlistId, song) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  songs: playlist.songs.some((s) => s.id === song.id) ? playlist.songs : [...playlist.songs, song],
                }
              : playlist,
          ),
        })),

      removeFromPlaylist: (playlistId, songId) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  songs: playlist.songs.filter((song) => song.id !== songId),
                }
              : playlist,
          ),
        })),

      updateCurrentTime: (time) => set({ currentTime: time }),

      updateDuration: (duration) => set({ duration }),
    }),
    {
      name: "music-player-storage",
      partialize: (state) => ({
        volume: state.volume,
        favorites: state.favorites,
        playlists: state.playlists,
      }),
    },
  ),
)
