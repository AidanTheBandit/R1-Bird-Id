import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'BirdID - Identify Birds by Sound',
  description: 'Record or upload bird audio to identify species using AI. Build your life list journal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#1d2021] min-h-screen text-[#ebdbb2]">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
