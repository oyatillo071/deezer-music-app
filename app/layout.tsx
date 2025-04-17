import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MusicPlayer } from "@/components/music-player";
import { ApiKeyModal } from "@/components/api-key-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicStream - Your Music Streaming App",
  description: "A modern music streaming application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ApiKeyModal />
          <div className="relative min-h-screen">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 md:ml-64">
                <div className="container py-6 md:py-8 px-2 md:px-4">
                  {children}
                </div>
              </main>
            </div>
            <div className="pb-24">{/* Space for the music player */}</div>
            <MusicPlayer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
