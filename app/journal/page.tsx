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
    <div className="min-h-screen bg-[#080f08]">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-700/20 border border-green-700/40 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-green-50">My Bird Journal</h1>
              </div>
              <p className="text-green-500 text-sm pl-[52px]">
                {entries.length === 0
                  ? "No birds identified yet — start recording!"
                  : `${entries.length} species identified`}
              </p>
            </div>

            {entries.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                <input
                  type="text"
                  placeholder="Search birds..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-green-950/30 border border-green-900/40 rounded-lg text-green-200 text-sm placeholder-green-700 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 w-56"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {entries.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-green-900/20 border border-green-900/30 flex items-center justify-center mx-auto mb-6">
              <Bird className="w-12 h-12 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-green-300 mb-2">Your journal is empty</h2>
            <p className="text-green-600 mb-8 max-w-sm mx-auto">
              Go identify some birds! Record audio or upload a file on the Identify page.
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-full">
                Start Identifying
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-green-600 text-lg">No birds match &quot;{search}&quot;</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-green-500">
              <span className="flex items-center gap-1.5">
                <Bird className="w-4 h-4" />
                {filtered.length} of {entries.length} birds
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
