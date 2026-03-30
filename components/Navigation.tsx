'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bird, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#1d2021]/95 backdrop-blur-sm border-b border-[#504945]/60">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 h-11 sm:h-14 flex items-center justify-between">
        {/* Logo — hidden on very small screens to save horizontal space */}
        <Link href="/" className="flex items-center gap-1.5 group shrink-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#504945]/60 border border-[#665c54]/60 flex items-center justify-center">
            <Bird className="w-4 h-4 sm:w-5 sm:h-5 text-[#fabd2f]" />
          </div>
          <span className="hidden sm:inline font-bold text-[#ebdbb2] text-base tracking-tight">BirdID</span>
        </Link>

        {/* Nav links — icon + label on R1, full on desktop */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
              pathname === '/'
                ? "bg-[#504945]/70 text-[#fabd2f] border border-[#665c54]/60"
                : "text-[#a89984] hover:text-[#ebdbb2] hover:bg-[#3c3836]/70"
            )}
          >
            <Bird className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Identify</span>
          </Link>
          <Link
            href="/journal"
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
              pathname === '/journal'
                ? "bg-[#504945]/70 text-[#fabd2f] border border-[#665c54]/60"
                : "text-[#a89984] hover:text-[#ebdbb2] hover:bg-[#3c3836]/70"
            )}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Journal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
