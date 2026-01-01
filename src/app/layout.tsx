import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Sora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ShortsAI - Faceless Video Generator | AI-Powered Content Creation",
  description: "Create stunning faceless videos in seconds with AI. Generate scripts, visuals, and voiceovers automatically. Perfect for YouTube Shorts, TikTok, and Reels.",
  keywords: ["faceless videos", "AI video generator", "YouTube Shorts", "TikTok", "content creation", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${sora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
