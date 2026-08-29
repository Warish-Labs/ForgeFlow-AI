import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
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
  process.env.NEXT_PUBLIC_APP_URL ?? "https://forgeflow.warishlabs.in";

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
  icons: {
    icon: "/Logo/forgeflow-favicon-256.png",
    shortcut: "/Logo/forgeflow-favicon-256.png",
    apple: "/Logo/forgeflow-favicon-256.png",
  },
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

function isClerkKeyValid(key?: string): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed === "" || trimmed.includes("placeholder")) return false;
  return trimmed.startsWith("pk_test_") || trimmed.startsWith("pk_live_");
}

import { dark } from "@clerk/themes";

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#1060ee",
    colorBackground: "#0d1220",
    colorInputBackground: "#070a14",
    colorText: "#f3f6fc",
    colorTextSecondary: "#9aa4b8",
    colorInputText: "#f3f6fc",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-[#0d1220] border border-[#1b2338] shadow-2xl text-[#f3f6fc]",
    headerTitle: "text-[#f3f6fc]",
    headerSubtitle: "text-[#9aa4b8]",
    socialButtonsBlockButton:
      "border border-[#1b2338] bg-[#070a14] text-[#f3f6fc] hover:bg-[#131a2c]",
    formFieldInput:
      "bg-[#070a14] border-[#1b2338] text-[#f3f6fc] focus:border-[#1060ee]",
    formButtonPrimary:
      "bg-[#1060ee] hover:bg-[#0a2a9c] text-white font-semibold transition-all",
    footerActionLink: "text-[#38b6ff] hover:text-[#1060ee]",
    modalBackdrop: "bg-black/80 backdrop-blur-sm",
    popoverBox: "bg-[#0d1220] border border-[#1b2338] shadow-2xl",
    userButtonPopoverCard: "bg-[#0d1220] border border-[#1b2338]",
    userButtonPopoverActionButton: "hover:bg-[#131a2c] text-[#f3f6fc]",
    userButtonPopoverActionButtonText: "text-[#f3f6fc]",
    userButtonPopoverFooter: "border-t border-[#1b2338]",
  },
};

function AppClerkProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!isClerkKeyValid(key)) {
    return <>{children}</>;
  }
  return <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-L3JWD2XQ8Y"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-L3JWD2XQ8Y');
            `}
          </Script>
        </head>
        <body className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] flex flex-col">
          {children}
        </body>
      </html>
    </AppClerkProvider>
  );
}

