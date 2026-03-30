import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { R1Setup } from '@/components/R1Setup';

export const metadata: Metadata = {
  title: 'BirdID',
  description: 'Identify birds by sound. Optimized for Rabbit R1.',
};

export const viewport: Viewport = {
  // Covers the R1 screen (240×282px) as well as normal browsers
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#1d2021] min-h-screen text-[#ebdbb2]">
        {/* r1-create: viewport + PTT device controls + storage sync */}
        <R1Setup />
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
