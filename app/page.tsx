'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioRecorder, IdentifyResult, DetectedBird } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { addToJournal, isInJournal } from '@/lib/birdStore';
import { BookOpen, CheckCircle, Star, ChevronRight, ExternalLink, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface BirdResultState extends DetectedBird {
  added: boolean;
  imgError: boolean;
}

export default function HomePage() {
  const [results, setResults] = useState<BirdResultState[] | null>(null);
  // Ref to expose the recorder's toggle function to the PTT side button
  const toggleRecordingRef = useRef<(() => void) | null>(null);

  const handleIdentified = useCallback((res: IdentifyResult) => {
    setResults(
      res.detectedBirds.map(d => ({
        ...d,
        added: isInJournal(d.bird.speciesCode),
        imgError: false,
      }))
    );
  }, []);

  const handleAddOne = useCallback((speciesCode: string) => {
    setResults(prev => {
      if (!prev) return prev;
      return prev.map(r => {
        if (r.bird.speciesCode !== speciesCode) return r;
        addToJournal({
          speciesCode: r.bird.speciesCode,
          commonName: r.bird.commonName,
          scientificName: r.bird.scientificName,
          family: r.bird.family,
          imageUrl: r.bird.imageUrl,
          dateIdentified: new Date().toISOString(),
          confidence: r.confidence,
          description: r.bird.description,
          soundDescription: r.bird.soundDescription,
          habitat: r.bird.habitat,
          range: r.bird.range,
          size: r.bird.size,
          color: r.bird.color,
          wikiUrl: r.bird.wikiUrl,
        });
        return { ...r, added: true };
      });
    });
  }, []);

  const handleAddAll = useCallback(() => {
    setResults(prev => {
      if (!prev) return prev;
      return prev.map(r => {
        if (r.added) return r;
        addToJournal({
          speciesCode: r.bird.speciesCode,
          commonName: r.bird.commonName,
          scientificName: r.bird.scientificName,
          family: r.bird.family,
          imageUrl: r.bird.imageUrl,
          dateIdentified: new Date().toISOString(),
          confidence: r.confidence,
          description: r.bird.description,
          soundDescription: r.bird.soundDescription,
          habitat: r.bird.habitat,
          range: r.bird.range,
          size: r.bird.size,
          color: r.bird.color,
          wikiUrl: r.bird.wikiUrl,
        });
        return { ...r, added: true };
      });
    });
  }, []);

  // PTT side button toggles recording.
  // deviceControls.init() was already called by R1Setup in the root layout.
  useEffect(() => {
    import('r1-create')
      .then(({ deviceControls }) => {
        deviceControls.on('sideButton', () => toggleRecordingRef.current?.());
      })
      .catch(() => {/* not on R1 device — silently skip */});
  }, []);

  const allAdded = results?.every(r => r.added) ?? false;

  const confidenceColor = (c: number) =>
    c >= 80 ? 'text-[#b8bb26]' : c >= 60 ? 'text-[#fabd2f]' : 'text-[#fe8019]';

  return (
    <div className="min-h-screen bg-[#1d2021]">
      {/* App header — cozy, compact on R1 */}
      <section className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-10 pb-3 sm:pb-6 text-center">
        {/* Desktop: warm title */}
        <div className="hidden sm:block mb-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#fbf1c7] leading-tight">
            🐦 Your Field Guide
          </h1>
          <p className="text-[#928374] text-base mt-2">
            Hold still, listen close — tap to identify a bird by its song.
          </p>
        </div>
        {/* R1: single compact line */}
        <p className="sm:hidden text-[#928374] text-xs">
          Press the side button (PTT) or tap the circle to listen
        </p>
      </section>

      {/* Recorder */}
      <section className="max-w-3xl mx-auto px-3 sm:px-4 pb-4 sm:pb-10">
        <div className="bg-[#282828] rounded-2xl border border-[#3c3836] shadow-lg">
          <div className="p-3 sm:p-8">
            <AudioRecorder
              onIdentified={handleIdentified}
              toggleRef={toggleRecordingRef}
            />
          </div>
        </div>
      </section>

      {/* Results */}
      {results && results.length > 0 && (
        <section className="max-w-3xl mx-auto px-3 sm:px-4 pb-10 sm:pb-16 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[#fabd2f] font-semibold text-sm sm:text-base">
              {results.length === 1 ? '🐦 You spotted one!' : `🐦 You spotted ${results.length} birds!`}
            </p>
            {results.length > 1 && !allAdded && (
              <Button
                size="sm"
                onClick={handleAddAll}
                className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1 sm:gap-1.5 rounded-full text-xs font-semibold h-7 px-3"
              >
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Save all
              </Button>
            )}
          </div>

          {results.map((r, idx) => (
            <div
              key={r.bird.speciesCode}
              className="bg-[#282828] rounded-2xl border border-[#3c3836] shadow-md overflow-hidden"
            >
              {/* Cozy card header */}
              <div className="px-3 sm:px-5 py-2 border-b border-[#3c3836] flex items-center justify-between">
                <span className="text-[#928374] text-xs">
                  {idx === 0 ? '🌟 Best match' : `#${idx + 1} also detected`}
                </span>
                <span className="text-[#665c54] text-xs italic">{r.bird.family}</span>
              </div>

              <div className="p-3 sm:p-5">
                <div className="flex gap-3 sm:gap-5">
                  {/* Bird image */}
                  <div className="flex-shrink-0 w-20 h-20 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[#3c3836]/60 border border-[#504945]/40">
                    {!r.imgError ? (
                      <img
                        src={r.bird.imageUrl}
                        alt={r.bird.commonName}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setResults(prev =>
                            prev?.map(x =>
                              x.bird.speciesCode === r.bird.speciesCode
                                ? { ...x, imgError: true }
                                : x
                            ) ?? null
                          )
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl sm:text-5xl">🐦</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                    <div>
                      <h2 className="text-sm sm:text-xl font-bold text-[#fbf1c7] leading-tight">{r.bird.commonName}</h2>
                      <p className="text-[#928374] italic text-xs">{r.bird.scientificName}</p>
                    </div>

                    <span className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${confidenceColor(r.confidence)}`}>
                      <Star className="w-3 h-3" />
                      {r.confidence}% match
                    </span>

                    <p className="text-[#d5c4a1] text-xs leading-snug hidden sm:block sm:line-clamp-none">
                      {r.bird.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                      {!r.added ? (
                        <Button
                          size="sm"
                          onClick={() => handleAddOne(r.bird.speciesCode)}
                          className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1 rounded-full text-xs font-semibold h-7 px-2.5 sm:px-3"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span className="hidden sm:inline">Add to Journal</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#504945] text-[#928374] gap-1 rounded-full cursor-default text-xs h-7 px-2.5 sm:px-3"
                          disabled
                        >
                          <CheckCircle className="w-3 h-3 text-[#b8bb26]" />
                          <span className="hidden sm:inline">In Journal</span>
                          <span className="sm:hidden">Saved ✓</span>
                        </Button>
                      )}
                      <a href={r.bird.wikiUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#83a598] hover:text-[#8ec07c] gap-1 rounded-full text-xs h-7 px-2 sm:px-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">Learn more</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {allAdded && (
            <div className="text-center pt-1">
              <Link href="/journal">
                <Button variant="ghost" className="text-[#fabd2f] hover:text-[#d79921] gap-2 text-xs sm:text-sm">
                  Open your journal
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Hint — only shown before first identification */}
      {!results && (
        <p className="max-w-3xl mx-auto px-3 sm:px-4 pb-8 sm:pb-16 text-center text-[#665c54] text-xs sm:text-sm">
          🎙️ Get close &nbsp;·&nbsp; 🌿 Find a quiet spot &nbsp;·&nbsp; ⏱️ Record 5–10 seconds
        </p>
      )}
    </div>
  );
}
