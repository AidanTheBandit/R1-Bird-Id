'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JournalEntry } from '@/lib/birdStore';
import { ExternalLink, Trash2, MapPin, Calendar, Star, Volume2, Info, Globe, Ruler, Palette } from 'lucide-react';

interface BirdDetailDialogProps {
  entry: JournalEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove?: (id: string) => void;
}

export function BirdDetailDialog({ entry, open, onOpenChange, onRemove }: BirdDetailDialogProps) {
  const [imgError, setImgError] = useState(false);

  const confidenceColor =
    entry.confidence >= 80 ? 'text-[#b8bb26]' :
    entry.confidence >= 60 ? 'text-[#fabd2f]' : 'text-[#fe8019]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#282828] border-[#504945]/60 text-[#ebdbb2] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Hero image */}
        <div className="relative h-56 bg-[#3c3836]/60 overflow-hidden">
          {!imgError ? (
            <img
              src={entry.imageUrl}
              alt={entry.commonName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#3c3836]/50">
              <span className="text-9xl">🐦</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#282828] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold text-[#fbf1c7] drop-shadow-lg">{entry.commonName}</h2>
            <p className="text-[#d5c4a1] italic text-sm">{entry.scientificName}</p>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-[#1d2021]/80 backdrop-blur-sm ${confidenceColor}`}>
              <Star className="w-4 h-4" />
              {entry.confidence}% match
            </span>
          </div>
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>{entry.commonName}</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-sm text-[#a89984]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(entry.dateIdentified).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {entry.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {entry.location}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-[#665c54] text-[#bdae93] text-xs">
              {entry.family}
            </Badge>
            <Badge variant="outline" className="border-[#665c54] text-[#bdae93] text-xs">
              {entry.speciesCode}
            </Badge>
          </div>

          <Separator className="border-[#504945]/60" />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#fabd2f] text-sm font-semibold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              About
            </div>
            <p className="text-[#d5c4a1] text-sm leading-relaxed">{entry.description}</p>
          </div>

          {/* Sound */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#fabd2f] text-sm font-semibold uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              Sound
            </div>
            <p className="text-[#d5c4a1] text-sm leading-relaxed italic">&quot;{entry.soundDescription}&quot;</p>
          </div>

          <Separator className="border-[#504945]/60" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#928374] text-xs uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Habitat
              </div>
              <p className="text-[#d5c4a1]">{entry.habitat}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#928374] text-xs uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Range
              </div>
              <p className="text-[#d5c4a1]">{entry.range}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#928374] text-xs uppercase tracking-wider">
                <Ruler className="w-3.5 h-3.5" />
                Size
              </div>
              <p className="text-[#d5c4a1]">{entry.size}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#928374] text-xs uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                Coloring
              </div>
              <p className="text-[#d5c4a1]">{entry.color}</p>
            </div>
          </div>

          <Separator className="border-[#504945]/60" />

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={entry.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#83a598] hover:text-[#8ec07c] transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
              Learn more on Wikipedia
            </a>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#fb4934] hover:text-[#cc241d] hover:bg-[#fb4934]/10 gap-2"
                onClick={() => {
                  onRemove(entry.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Remove from Journal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
