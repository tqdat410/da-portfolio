import type { Metadata, Viewport } from "next";
import React from "react";
import { Geist_Mono, Ubuntu } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0c0c0c",
};

export const metadata: Metadata = {
  title: {
    default: content.hero.name,
    template: `%s | ${content.hero.name}`,
  },
  description: content.hero.description,
  keywords: [
    "software engineer",
    "portfolio",
    "SAP consultant",
    "web developer",
    "React",
    "Next.js",
    "TypeScript",
    "Tran Quoc Dat",
  ],
  authors: [{ name: content.hero.name }],
  creator: content.hero.name,
  metadataBase: new URL("https://tranquocdat.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${content.hero.name} | ${content.hero.role}`,
    description: content.hero.description,
    siteName: content.hero.name,
    images: [
      {
        url: "/hero-section.png",
        width: 1385,
        height: 779,
        alt: `${content.hero.name} | ${content.hero.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${content.hero.name} | ${content.hero.role}`,
    description: content.hero.description,
    creator: "@trandat40",
    images: ["/hero-section.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} ${geistMono.variable}`}>
      <body className="bg-midnight text-light-mint antialiased">{children}</body>
    </html>
  );
}
