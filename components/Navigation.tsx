'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bird, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#1d2021]/95 backdrop-blur-sm border-b border-[#504945]/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#504945]/60 border border-[#665c54]/60 flex items-center justify-center group-hover:bg-[#665c54]/70 transition-colors">
            <Bird className="w-5 h-5 text-[#fabd2f]" />
          </div>
          <span className="font-bold text-[#ebdbb2] text-lg tracking-tight">BirdID</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              pathname === '/'
                ? "bg-[#504945]/70 text-[#fabd2f] border border-[#665c54]/60"
                : "text-[#a89984] hover:text-[#ebdbb2] hover:bg-[#3c3836]/70"
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
                ? "bg-[#504945]/70 text-[#fabd2f] border border-[#665c54]/60"
                : "text-[#a89984] hover:text-[#ebdbb2] hover:bg-[#3c3836]/70"
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
