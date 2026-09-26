import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import profile from '@/data/profile.json';

const title = `${profile.name} — ${profile.title}`;

// Resolve the canonical origin from the host environment so Open Graph and
// Twitter images get absolute URLs. Falls back to localhost in development.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: profile.tagline,
  keywords: [
    'portfolio',
    'performance testing',
    'LoadRunner',
    'Next.js',
    'software developer',
    'QA engineer',
    profile.location,
  ],
  authors: [{ name: profile.name }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/og-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title,
    description: profile.tagline,
    type: 'website',
    siteName: profile.name,
    images: [{ url: '/og-icon.png', width: 512, height: 512, alt: profile.name }],
  },
  twitter: {
    card: 'summary',
    title,
    description: profile.tagline,
    images: ['/og-icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
