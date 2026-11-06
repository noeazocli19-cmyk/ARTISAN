import type { Metadata, Viewport } from "next";
import { Albert_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
// Page transition overlay removed to eliminate loading-artisan image
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { BottomNav } from "@/components/bottom-nav";
import { Footer } from "@/components/footer";
import { IosInstallHint } from "@/components/ios-install-hint";

const albertSans = Albert_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#06110f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://finda.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
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
    "FINDA",
  ],
  authors: [{ name: "FINDA" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/finda.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FINDA",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans à travers l'Afrique.",
    url: "/",
    siteName: "FINDA",
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/images/hero-family.png", width: 1200, height: 630, alt: "FINDA, trouvez un artisan de confiance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FINDA — Trouvez l'artisan parfait pour chaque projet",
    description:
      "Plateforme premium connectant les clients avec les meilleurs artisans à travers l'Afrique.",
    images: ["/images/hero-family.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "FINDA",
                  url: siteUrl,
                  logo: `${siteUrl}/icons/finda.png`,
                  contactPoint: { "@type": "ContactPoint", email: "support@finda.com", contactType: "customer support" },
                },
                {
                  "@type": "WebSite",
                  name: "FINDA",
                  url: siteUrl,
                  inLanguage: "fr",
                  potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
                },
              ],
            }),
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FINDA" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${albertSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Page transition overlay removed */}
        <PresenceHeartbeat />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
                    disableTransitionOnChange
        >
          {children}
          <Footer />
          <Toaster />
          <PwaRegister />
          <BottomNav />
          <IosInstallHint />
        </ThemeProvider>
      </body>
    </html>
  );
}