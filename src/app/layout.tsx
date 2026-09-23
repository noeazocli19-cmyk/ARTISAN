import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
// Page transition overlay removed to eliminate loading-artisan image
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { BottomNav } from "@/components/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#22C55E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
  description:
    "Plateforme premium connectant les clients avec les meilleurs artisans Ã  travers l'Afrique. Plomberie, électricité, menuiserie, peinture et plus encore. Service vérifié, paiement sécurisé, satisfaction garantie.",
  keywords: [
    "artisan",
    "Afrique",
    "plomberie",
    "électricité",
    "menuiserie",
    "peinture",
    "serrurerie",
    "maçonnerie",
    "climatisation",
    "nettoyage",
    "services",
    "FINDA",
  ],
  authors: [{ name: "FINDA" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/finda.png",
    apple: "/icons/finda.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FINDA",
  },
  openGraph: {
    title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans Ã  travers l'Afrique.",
    siteName: "FINDA",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans Ã  travers l'Afrique.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22C55E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FINDA" />
        <link rel="apple-touch-icon" href="/icons/finda.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Page transition overlay removed */}
        <PresenceHeartbeat />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
                    disableTransitionOnChange
        >
          {children}
          <Toaster />
          <PwaRegister />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}