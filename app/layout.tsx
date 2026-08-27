import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://forgeflow-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ForgeFlow AI — Idea to Implementation Blueprint",
    template: "%s | ForgeFlow AI",
  },
  description:
    "Turn a one-line software idea into a structured, reasoned, implementation-ready blueprint. Persistent project state, AI-powered architecture, and human-in-the-loop planning.",
  keywords: [
    "AI project planner",
    "software architecture AI",
    "implementation blueprint",
    "LangGraph",
    "project requirements generator",
  ],
  authors: [{ name: "MD Warish Ansari", url: "https://warishlabs.in" }],
  creator: "WarishLabs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "ForgeFlow AI",
    title: "ForgeFlow AI — Idea to Implementation Blueprint",
    description:
      "Turn a one-line software idea into a structured, reasoned, implementation-ready blueprint.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ForgeFlow AI — Why Project State Beats Chat History in Agentic AI Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ForgeFlow AI — Idea to Implementation Blueprint",
    description:
      "Turn a one-line software idea into a structured, reasoned, implementation-ready blueprint.",
    images: ["/og-image.png"],
    creator: "@warishlabs",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
