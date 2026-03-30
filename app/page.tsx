'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioRecorder, IdentifyResult, DetectedBird } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { addToJournal, isInJournal } from '@/lib/birdStore';
import { BookOpen, CheckCircle, Star, ChevronRight, Bird, Sparkles, ExternalLink, PlusCircle } from 'lucide-react';
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
      {/* Hero — compact on R1, spacious on desktop */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#504945]/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-16 pb-3 sm:pb-10 text-center relative">
          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#504945]/50 border border-[#665c54]/50 text-[#fabd2f] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Bird Identification
          </div>
          {/* Compact title on R1, large on desktop */}
          <div className="flex sm:hidden items-center justify-center gap-2 mb-2">
            <Bird className="w-5 h-5 text-[#fabd2f]" />
            <h1 className="text-base font-bold text-[#fbf1c7]">BirdID</h1>
            <span className="text-[#928374] text-xs">— identify by sound</span>
          </div>
          <h1 className="hidden sm:block text-4xl sm:text-5xl font-extrabold text-[#fbf1c7] mb-4 leading-tight">
            Identify Birds<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fabd2f] to-[#fe8019]">
              by Their Song
            </span>
          </h1>
          <p className="hidden sm:block text-[#a89984] text-lg max-w-xl mx-auto">
            Hold your device near a bird and tap the button. Detects multiple species per recording.
          </p>
          {/* R1 hint about PTT button */}
          <p className="sm:hidden text-[#928374] text-xs">Press the side button (PTT) or tap to record</p>
        </div>
      </section>

      {/* Recorder */}
      <section className="max-w-3xl mx-auto px-3 sm:px-4 pb-4 sm:pb-10">
        <Card className="bg-[#282828] border-[#504945]/60 shadow-2xl">
          <CardContent className="p-3 sm:p-8">
            <div className="hidden sm:flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#504945]/50 border border-[#665c54]/60 flex items-center justify-center">
                <Bird className="w-5 h-5 text-[#fabd2f]" />
              </div>
              <div>
                <h2 className="font-bold text-[#ebdbb2]">Listen</h2>
                <p className="text-[#928374] text-xs">Hold near a bird and press the button to identify</p>
              </div>
            </div>
            <AudioRecorder
              onIdentified={handleIdentified}
              toggleRef={toggleRecordingRef}
            />
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      {results && results.length > 0 && (
        <section className="max-w-3xl mx-auto px-3 sm:px-4 pb-10 sm:pb-16 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#fabd2f] font-semibold text-sm sm:text-base">
              <Bird className="w-4 h-4 sm:w-5 sm:h-5" />
              {results.length === 1 ? 'Bird Identified!' : `${results.length} Birds Detected`}
            </div>
            {results.length > 1 && !allAdded && (
              <Button
                size="sm"
                onClick={handleAddAll}
                className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1 sm:gap-1.5 rounded-full text-xs font-semibold h-7 px-3"
              >
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Add All
              </Button>
            )}
          </div>

          {results.map((r, idx) => (
            <Card
              key={r.bird.speciesCode}
              className="bg-[#282828] border-[#fabd2f]/20 shadow-xl overflow-hidden"
            >
              <div className="bg-[#3c3836]/60 px-3 sm:px-6 py-2 sm:py-3 border-b border-[#504945]/60 flex items-center justify-between">
                <span className="text-[#a89984] text-xs font-medium">
                  {idx === 0 ? '🏆 Best match' : `#${idx + 1} detected`}
                </span>
                <Badge variant="outline" className="border-[#665c54] text-[#bdae93] text-xs">
                  {r.bird.family}
                </Badge>
              </div>

              <CardContent className="p-3 sm:p-6">
                <div className="flex gap-3 sm:gap-5">
                  {/* Bird image — smaller on R1 */}
                  <div className="flex-shrink-0 w-20 h-20 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-[#3c3836]/60 border border-[#504945]/60">
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

                    <span className={`flex items-center gap-1 text-xs sm:text-base font-bold ${confidenceColor(r.confidence)}`}>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      {r.confidence}%
                    </span>

                    {/* Description — truncated on R1 */}
                    <p className="text-[#d5c4a1] text-xs leading-snug line-clamp-2 hidden sm:block sm:line-clamp-none">
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
                          className="border-[#665c54] text-[#a89984] gap-1 rounded-full cursor-default text-xs h-7 px-2.5 sm:px-3"
                          disabled
                        >
                          <CheckCircle className="w-3 h-3 text-[#b8bb26]" />
                          <span className="hidden sm:inline">In Journal</span>
                          <span className="sm:hidden">Saved</span>
                        </Button>
                      )}
                      <a href={r.bird.wikiUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#83a598] hover:text-[#8ec07c] gap-1 rounded-full text-xs h-7 px-2 sm:px-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">Learn More</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {allAdded && (
            <div className="text-center pt-1">
              <Link href="/journal">
                <Button variant="ghost" className="text-[#fabd2f] hover:text-[#d79921] gap-2 text-xs sm:text-sm">
                  View My Journal
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Tips — only shown before first identification, condensed on R1 */}
      {!results && (
        <section className="max-w-3xl mx-auto px-3 sm:px-4 pb-8 sm:pb-16">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
            {[
              { icon: '🎙️', title: 'Get Close', desc: 'Hold near the bird' },
              { icon: '🌿', title: 'Quiet Spot', desc: 'Away from traffic' },
              { icon: '⏱️', title: '5–10 sec', desc: 'More time = more birds' },
            ].map(tip => (
              <div key={tip.title} className="bg-[#282828] rounded-xl p-2 sm:p-4 border border-[#504945]/50 text-center">
                <div className="text-xl sm:text-3xl mb-1 sm:mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-[#d5c4a1] text-xs sm:text-sm mb-0.5 sm:mb-1">{tip.title}</h3>
                <p className="text-[#928374] text-xs hidden sm:block">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
