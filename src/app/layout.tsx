import { Metadata, Viewport } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://knowra.ai'),
  title: {
    default: 'KNOWRA - Interactive Learning Platform',
    template: '%s | KNOWRA'
  },
  description: 'Explore topics through interactive learning cards, AI-generated content, and comprehensive resources.',
  keywords: ['learning', 'education', 'knowledge', 'interactive learning', 'AI learning'],
  authors: [{ name: 'KNOWRA Team' }],
  creator: 'KNOWRA Team',
  publisher: 'KNOWRA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'KNOWRA',
    title: 'KNOWRA - Interactive Learning Platform',
    description: 'Explore topics through interactive learning cards, AI-generated content, and comprehensive resources.',
    url: 'https://knowra.ai',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KNOWRA - Interactive Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KNOWRA - Interactive Learning Platform',
    description: 'Explore topics through interactive learning cards, AI-generated content, and comprehensive resources.',
    creator: '@knowra_tweets',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-site-verification',
    other: {
      me: ['your-personal-site'],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  );
} 