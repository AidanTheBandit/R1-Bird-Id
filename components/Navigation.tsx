'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bird, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0d1a0d]/95 backdrop-blur-sm border-b border-green-900/40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-green-700/30 border border-green-700/50 flex items-center justify-center group-hover:bg-green-700/50 transition-colors">
            <Bird className="w-5 h-5 text-green-400" />
          </div>
          <span className="font-bold text-green-100 text-lg tracking-tight">BirdID</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === '/'
                ? "bg-green-700/30 text-green-300 border border-green-700/40"
                : "text-green-500 hover:text-green-300 hover:bg-green-900/30"
            )}
          >
            <Bird className="w-4 h-4" />
            Identify
          </Link>
          <Link
            href="/journal"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === '/journal'
                ? "bg-green-700/30 text-green-300 border border-green-700/40"
                : "text-green-500 hover:text-green-300 hover:bg-green-900/30"
            )}
          >
            <BookOpen className="w-4 h-4" />
            My Journal
          </Link>
        </nav>
      </div>
    </header>
  );
}
