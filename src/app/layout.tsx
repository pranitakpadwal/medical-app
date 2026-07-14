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
  themeColor: "#92400e",
  width: "device-width",
  initialScale: 1,
};

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-ink font-serif text-base font-bold"
        aria-hidden
      >
        स
      </span>
      <span className="font-serif text-lg font-bold tracking-tight">Sakshya</span>
    </span>
  );
}

function TopNav() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <nav className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Sakshya home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-1.5 rounded hover:text-accent transition-colors"
          >
            Ask
          </Link>
          <Link
            href="/learn"
            className="px-3 py-1.5 rounded hover:text-accent transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/explore"
            className="px-3 py-1.5 rounded hover:text-accent transition-colors"
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
        <main className="flex-1 w-full mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-border text-xs text-muted">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-2">
            <span>
              Educational reference only — not medical advice. Always verify
              against your institution&apos;s guidelines and your seniors
              before any patient-specific decision.
            </span>
            <span className="font-serif italic">साक्ष्य</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
