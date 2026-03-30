'use client';

import { useState, useCallback } from 'react';
import { AudioRecorder, IdentifyResult, DetectedBird } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { addToJournal, isInJournal } from '@/lib/birdStore';
import { BookOpen, CheckCircle, Star, ChevronRight, Bird, Mic, Sparkles, ExternalLink, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface BirdResultState extends DetectedBird {
  added: boolean;
  imgError: boolean;
}

export default function HomePage() {
  const [results, setResults] = useState<BirdResultState[] | null>(null);

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

  const allAdded = results?.every(r => r.added) ?? false;

  const confidenceColor = (c: number) =>
    c >= 80 ? 'text-[#b8bb26]' : c >= 60 ? 'text-[#fabd2f]' : 'text-[#fe8019]';

  return (
    <div className="min-h-screen bg-[#1d2021]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#504945]/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#504945]/50 border border-[#665c54]/50 text-[#fabd2f] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Bird Identification
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#fbf1c7] mb-4 leading-tight">
            Identify Birds<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fabd2f] to-[#fe8019]">
              by Their Song
            </span>
          </h1>
          <p className="text-[#a89984] text-lg max-w-xl mx-auto">
            Record bird sounds or upload an audio clip. Our AI analyzes the audio patterns to identify the species — even multiple birds at once.
          </p>
        </div>
      </section>

      {/* Recorder Section */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <Card className="bg-[#282828] border-[#504945]/60 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#504945]/50 border border-[#665c54]/60 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#fabd2f]" />
              </div>
              <div>
                <h2 className="font-bold text-[#ebdbb2]">Record or Upload</h2>
                <p className="text-[#928374] text-xs">Hold near a bird and press record, or upload an audio file</p>
              </div>
            </div>
            <AudioRecorder onIdentified={handleIdentified} />
          </CardContent>
        </Card>
      </section>

      {/* Results Section — one or more birds */}
      {results && results.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-16 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#fabd2f] font-semibold">
              <Bird className="w-5 h-5" />
              {results.length === 1
                ? 'Bird Identified!'
                : `${results.length} Birds Detected in Recording`}
            </div>
            {results.length > 1 && !allAdded && (
              <Button
                size="sm"
                onClick={handleAddAll}
                className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1.5 rounded-full text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add All to Journal
              </Button>
            )}
          </div>

          {/* Bird cards */}
          {results.map((r, idx) => (
            <Card
              key={r.bird.speciesCode}
              className="bg-[#282828] border-[#fabd2f]/20 shadow-xl overflow-hidden"
            >
              {/* Card header */}
              <div className="bg-[#3c3836]/60 px-6 py-3 border-b border-[#504945]/60 flex items-center justify-between">
                <span className="text-[#a89984] text-xs font-medium">
                  {idx === 0 ? '🏆 Best match' : `#${idx + 1} detected`}
                </span>
                <Badge variant="outline" className="border-[#665c54] text-[#bdae93] text-xs">
                  {r.bird.family}
                </Badge>
              </div>

              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Bird image */}
                  <div className="flex-shrink-0">
                    <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-[#3c3836]/60 border border-[#504945]/60">
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
                          <span className="text-5xl">🐦</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-xl font-bold text-[#fbf1c7]">{r.bird.commonName}</h2>
                      <p className="text-[#928374] italic text-sm">{r.bird.scientificName}</p>
                    </div>

                    <span className={`flex items-center gap-1 text-base font-bold ${confidenceColor(r.confidence)}`}>
                      <Star className="w-4 h-4" />
                      {r.confidence}% confidence
                    </span>

                    <p className="text-[#d5c4a1] text-sm leading-relaxed line-clamp-2">{r.bird.description}</p>

                    <div className="flex items-center gap-1.5 text-[#928374] text-sm italic">
                      <span>🎵</span>
                      <span className="line-clamp-1">&quot;{r.bird.soundDescription}&quot;</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!r.added ? (
                        <Button
                          size="sm"
                          onClick={() => handleAddOne(r.bird.speciesCode)}
                          className="bg-[#b8bb26] hover:bg-[#98971a] text-[#282828] gap-1.5 rounded-full text-xs font-semibold"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Add to Journal
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#665c54] text-[#a89984] gap-1.5 rounded-full cursor-default text-xs"
                          disabled
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-[#b8bb26]" />
                          In Journal
                        </Button>
                      )}
                      <a href={r.bird.wikiUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#83a598] hover:text-[#8ec07c] gap-1.5 rounded-full text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Learn More
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {allAdded && (
            <div className="text-center pt-2">
              <Link href="/journal">
                <Button variant="ghost" className="text-[#fabd2f] hover:text-[#d79921] gap-2">
                  View My Journal
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Tips section (shown before first identification) */}
      {!results && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🎙️', title: 'Get Close', desc: 'Hold your device near the bird for best results' },
              { icon: '🌿', title: 'Reduce Noise', desc: 'Record in a quiet spot away from traffic' },
              { icon: '⏱️', title: '5–10 Seconds', desc: 'Record at least 5 seconds to detect multiple birds' },
            ].map(tip => (
              <div key={tip.title} className="bg-[#282828] rounded-xl p-4 border border-[#504945]/50 text-center">
                <div className="text-3xl mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-[#d5c4a1] text-sm mb-1">{tip.title}</h3>
                <p className="text-[#928374] text-xs">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
