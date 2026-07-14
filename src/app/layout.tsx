import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sakshya — evidence-based answers for Indian medical students",
  description:
    "Ask clinical and lab questions and get answers grounded only in vetted sources, with citations — or an honest 'not covered yet'. Educational reference, not medical advice.",
  applicationName: "Sakshya",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Sakshya" },
};

export const viewport: Viewport = {
  themeColor: "#0d7d6b",
  width: "device-width",
  initialScale: 1,
};

function TopNav() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          <span className="text-accent">Saksh</span>ya
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md hover:bg-background transition-colors"
          >
            Ask
          </Link>
          <Link
            href="/learn"
            className="px-3 py-1.5 rounded-md hover:bg-background transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/explore"
            className="px-3 py-1.5 rounded-md hover:bg-background transition-colors"
          >
            Explore
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TopNav />
        <main className="flex-1 w-full mx-auto max-w-4xl px-4 py-6">{children}</main>
        <footer className="border-t border-border text-xs text-muted">
          <div className="mx-auto max-w-4xl px-4 py-4">
            Educational reference only — not medical advice. Always verify
            against your institution&apos;s guidelines and your seniors before
            any patient-specific decision.
          </div>
        </footer>
      </body>
    </html>
  );
}
