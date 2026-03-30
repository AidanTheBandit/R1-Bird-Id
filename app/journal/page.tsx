'use client';

import { useState, useEffect, useCallback } from 'react';
import { BirdCard } from '@/components/BirdCard';
import { Button } from '@/components/ui/button';
import { getJournal, removeFromJournal, JournalEntry } from '@/lib/birdStore';
import { BookOpen, Bird, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEntries(getJournal());
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeFromJournal(id);
    setEntries(getJournal());
  }, []);

  const filtered = entries.filter(e =>
    e.commonName.toLowerCase().includes(search.toLowerCase()) ||
    e.scientificName.toLowerCase().includes(search.toLowerCase()) ||
    e.family.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1d2021]">
      {/* Header — compact on R1 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#504945]/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-12 pb-3 sm:pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#504945]/50 border border-[#665c54]/60 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#a89984]" />
                </div>
                <h1 className="text-lg sm:text-3xl font-extrabold text-[#fbf1c7]">My Bird Journal</h1>
              </div>
              <p className="text-[#928374] text-xs sm:text-sm pl-9 sm:pl-[52px]">
                {entries.length === 0
                  ? 'No birds yet — start recording!'
                  : `${entries.length} species identified`}
              </p>
            </div>

            {entries.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7c6f64]" />
                <input
                  type="text"
                  placeholder="Search birds..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 sm:py-2 bg-[#3c3836]/80 border border-[#504945]/60 rounded-lg text-[#d5c4a1] text-xs sm:text-sm placeholder-[#665c54] focus:outline-none focus:border-[#fabd2f] focus:ring-1 focus:ring-[#fabd2f] w-full sm:w-52"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-16">
        {entries.length === 0 ? (
          <div className="text-center py-10 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#504945]/40 border border-[#504945]/50 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Bird className="w-8 h-8 sm:w-12 sm:h-12 text-[#665c54]" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-[#d5c4a1] mb-2">Your journal is empty</h2>
            <p className="text-[#7c6f64] mb-5 sm:mb-8 max-w-sm mx-auto text-xs sm:text-base">
              Go identify some birds! Record audio or upload a file on the Identify page.
            </p>
            <Link href="/">
              <Button className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-2 rounded-full text-sm">
                Start Identifying
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 sm:py-16">
            <p className="text-[#7c6f64] text-sm sm:text-lg">No birds match &quot;{search}&quot;</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-3 sm:mb-6 text-xs sm:text-sm text-[#928374]">
              <span className="flex items-center gap-1.5">
                <Bird className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {filtered.length} of {entries.length} birds
              </span>
            </div>

            {/* Grid — 2 cols on R1, up to 5 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
              {filtered.map(entry => (
                <BirdCard key={entry.id} entry={entry} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
