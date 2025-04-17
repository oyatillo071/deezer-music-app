import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

type UserState = {
  theme: Theme
  username: string
  profilePicture: string | null

  // Actions
  setTheme: (theme: Theme) => void
  setUsername: (username: string) => void
  setProfilePicture: (url: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      theme: "system",
      username: "Music Lover",
      profilePicture: null,

      setTheme: (theme) => set({ theme }),
      setUsername: (username) => set({ username }),
      setProfilePicture: (url) => set({ profilePicture: url }),
    }),
    {
      name: "user-preferences",
    },
  ),
)
