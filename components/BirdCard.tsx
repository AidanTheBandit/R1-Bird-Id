'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JournalEntry } from '@/lib/birdStore';
import { BirdDetailDialog } from './BirdDetailDialog';
import { Calendar, MapPin, Star } from 'lucide-react';

interface BirdCardProps {
  entry: JournalEntry;
  onRemove?: (id: string) => void;
}

export function BirdCard({ entry, onRemove }: BirdCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const confidenceBadge =
    entry.confidence >= 80 ? 'bg-[#b8bb26] text-[#282828]' :
    entry.confidence >= 60 ? 'bg-[#fabd2f] text-[#282828]' : 'bg-[#fe8019] text-[#282828]';

  return (
    <>
      <Card
        className="cursor-pointer group overflow-hidden bg-[#282828] border-[#504945]/60 hover:border-[#fabd2f]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#1d2021]/80 hover:-translate-y-1"
        onClick={() => setDialogOpen(true)}
      >
        <div className="relative aspect-square overflow-hidden bg-[#3c3836]/60">
          {!imgError ? (
            <img
              src={entry.imageUrl}
              alt={entry.commonName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🐦</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${confidenceBadge}`}>
              <Star className="w-3 h-3" />
              {entry.confidence}%
            </span>
          </div>
        </div>

        <CardContent className="p-3 space-y-1">
          <h3 className="font-bold text-[#ebdbb2] text-sm leading-tight truncate">{entry.commonName}</h3>
          <p className="text-[#a89984] text-xs italic truncate">{entry.scientificName}</p>
          <div className="flex items-center gap-1 text-[#928374] text-xs">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{new Date(entry.dateIdentified).toLocaleDateString()}</span>
          </div>
          {entry.location && (
            <div className="flex items-center gap-1 text-[#928374] text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{entry.location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <BirdDetailDialog
        entry={entry}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRemove={onRemove}
      />
    </>
  );
}
