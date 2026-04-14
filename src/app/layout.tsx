import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import VercelAnalytics from "@/components/VercelAnalytics";

export const metadata: Metadata = {
  title: {
    default: "SpiceAtlas — Herb & Spice Encyclopedia",
    template: "%s | SpiceAtlas",
  },
  description: "Explore 600+ herbs and spices with flavor profiles, pairing guides, and culinary origins. Your interactive spice encyclopedia.",
  openGraph: {
    title: "SpiceAtlas — Herb & Spice Encyclopedia",
    description: "Explore 600+ herbs and spices with flavor profiles, pairing guides, and culinary origins.",
    url: "https://spiceatlas.starmap.quest",
    siteName: "SpiceAtlas",
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://spiceatlas.starmap.quest",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="forest">
      <head>
        <GoogleAnalytics />
        <GoogleAdSense />
      </head>
      <body className="min-h-dvh bg-base-100 flex flex-col">
        <VercelAnalytics />
        <header className="navbar bg-gradient-to-r from-emerald-900 to-emerald-700 text-white shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <a className="text-xl font-bold flex items-center gap-2" href="/">
              <span className="text-2xl">🌿</span>
              <span>SpiceAtlas</span>
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:text-emerald-200 transition-colors">Home</a>
              <a href="/browse" className="hover:text-emerald-200 transition-colors">Browse All</a>
              <a href="/pairings" className="hover:text-emerald-200 transition-colors">Pairing Guide</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-base-200 border-t border-base-300">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold text-lg">🌿 SpiceAtlas</p>
                <p className="text-base-content/60 text-sm">Your interactive herb & spice encyclopedia</p>
              </div>
              <div className="text-sm text-base-content/60">
                <p>Data sourced from Wikipedia. © {new Date().getFullYear()} <a href="https://rollersoft.com.au" className="link link-hover">Rollersoft</a></p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
