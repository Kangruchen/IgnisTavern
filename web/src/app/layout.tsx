import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "伊格尼斯酒馆 | Ignis Tavern",
  description: "一款以烹饪之都为背景的叙事 RPG 游戏 - A narrative RPG set in a culinary metropolis",
  keywords: ["RPG", "游戏", "叙事", "Game", "Narrative", "Tavern"],
  authors: [{ name: "Ignis Tavern" }],
  openGraph: {
    title: "伊格尼斯酒馆 | Ignis Tavern",
    description: "揭开美食之城的秘密",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-amber-50">
        {children}
      </body>
    </html>
  );
}
