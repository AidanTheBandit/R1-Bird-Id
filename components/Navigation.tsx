'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#1d2021]/95 backdrop-blur-sm border-b border-[#3c3836]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-10 sm:h-12 flex items-center justify-between">
        {/* App name */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-base leading-none select-none">🐦</span>
          <span className="font-bold text-[#fabd2f] text-sm sm:text-base tracking-tight">BirdLog</span>
        </Link>

        {/* Journal tab */}
        <Link
          href="/journal"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150",
            pathname === '/journal'
              ? "text-[#fabd2f] bg-[#3c3836]"
              : "text-[#928374] hover:text-[#d5c4a1] hover:bg-[#3c3836]/60"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Journal</span>
        </Link>
      </div>
    </header>
  );
}
