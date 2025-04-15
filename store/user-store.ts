import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"
type Language = "en" | "ru" | "uz"

type UserState = {
  theme: Theme
  language: Language
  username: string
  profilePicture: string | null

  // Actions
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setUsername: (username: string) => void
  setProfilePicture: (url: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      username: "Music Lover",
      profilePicture: null,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setUsername: (username) => set({ username }),
      setProfilePicture: (url) => set({ profilePicture: url }),
    }),
    {
      name: "user-preferences",
    },
  ),
)
