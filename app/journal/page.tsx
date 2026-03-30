'use client';

import { useState, useEffect, useCallback } from 'react';
import { BirdCard } from '@/components/BirdCard';
import { Button } from '@/components/ui/button';
import { getJournal, removeFromJournal, JournalEntry } from '@/lib/birdStore';
import { Bird, Search, ChevronRight } from 'lucide-react';
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
      {/* Header */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-10 pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 justify-between">
          <div>
            <h1 className="text-lg sm:text-3xl font-extrabold text-[#fbf1c7]">
              📖 My Bird Journal
            </h1>
            <p className="text-[#928374] text-xs sm:text-sm mt-0.5">
              {entries.length === 0
                ? 'No birds yet — go find some!'
                : `${entries.length} species collected`}
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
                className="pl-8 pr-3 py-1.5 sm:py-2 bg-[#3c3836]/80 border border-[#3c3836] rounded-lg text-[#d5c4a1] text-xs sm:text-sm placeholder-[#665c54] focus:outline-none focus:border-[#fabd2f] focus:ring-1 focus:ring-[#fabd2f] w-full sm:w-52"
              />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-16">
        {entries.length === 0 ? (
          <div className="text-center py-10 sm:py-20">
            <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 select-none">🌿</div>
            <h2 className="text-base sm:text-xl font-bold text-[#d5c4a1] mb-2">Your journal is empty</h2>
            <p className="text-[#7c6f64] mb-5 sm:mb-8 max-w-sm mx-auto text-xs sm:text-base">
              Head outside and tap the listen button to identify a bird!
            </p>
            <Link href="/">
              <Button className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-2 rounded-full text-sm">
                Start listening
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
