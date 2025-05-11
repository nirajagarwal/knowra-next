import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import ThemeRegistry from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Knowra - Interactive Learning Platform',
  description: 'Explore topics through interactive cards and AI-generated content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
          <Analytics />
        </ThemeRegistry>
      </body>
    </html>
  );
} 