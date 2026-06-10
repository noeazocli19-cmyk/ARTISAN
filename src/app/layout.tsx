import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Artisan Connecté — Trouvez l'artisan parfait pour chaque projet",
  description:
    "Plateforme premium connectant les clients avec les meilleurs artisans à travers l'Afrique. Plomberie, électricité, menuiserie, peinture et plus encore. Service vérifié, paiement sécurisé, satisfaction garantie.",
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
    "Artisan Connecté",
  ],
  authors: [{ name: "Artisan Connecté" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Artisan Connecté",
  },
  openGraph: {
    title: "Artisan Connecté — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans à travers l'Afrique.",
    siteName: "Artisan Connecté",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artisan Connecté — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans à travers l'Afrique.",
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
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Artisan Connecté" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
