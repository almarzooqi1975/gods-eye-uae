import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./hud.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GODS EYE // UAE — Middle East Signals Command",
  description:
    "Real-time open-source intelligence console for the Middle East: live UAE cameras, aircraft over the Gulf, seismic activity, ISS tracking, rain radar and news wires — all public, all live.",
  keywords: ["OSINT", "UAE", "Dubai", "Abu Dhabi", "live cameras", "ADS-B", "Middle East", "globe"],
  authors: [{ name: "GODS EYE // UAE" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GODS EYE // UAE — Middle East Signals Command",
    description: "Live open signals over the Arabian Gulf — cameras, flights, seismic, ISS.",
    siteName: "GODS EYE // UAE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
