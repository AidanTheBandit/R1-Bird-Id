'use client';

import { useState, useCallback } from 'react';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { addToJournal, isInJournal } from '@/lib/birdStore';
import { BirdSpecies } from '@/lib/birds';
import { BookOpen, CheckCircle, Star, ChevronRight, Bird, Mic, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface IdentifyResult {
  bird: BirdSpecies;
  confidence: number;
  alternates: Array<{ bird: BirdSpecies; confidence: number }>;
}

export default function HomePage() {
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleIdentified = useCallback((res: IdentifyResult) => {
    setResult(res);
    setAdded(isInJournal(res.bird.speciesCode));
    setImgError(false);
  }, []);

  const handleAddToJournal = useCallback(() => {
    if (!result) return;
    addToJournal({
      speciesCode: result.bird.speciesCode,
      commonName: result.bird.commonName,
      scientificName: result.bird.scientificName,
      family: result.bird.family,
      imageUrl: result.bird.imageUrl,
      dateIdentified: new Date().toISOString(),
      confidence: result.confidence,
      description: result.bird.description,
      soundDescription: result.bird.soundDescription,
      habitat: result.bird.habitat,
      range: result.bird.range,
      size: result.bird.size,
      color: result.bird.color,
      wikiUrl: result.bird.wikiUrl,
    });
    setAdded(true);
  }, [result]);

  const confidenceColor =
    result && result.confidence >= 80 ? 'text-green-400' :
    result && result.confidence >= 60 ? 'text-yellow-400' : 'text-orange-400';

  return (
    <div className="min-h-screen bg-[#080f08]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/30 border border-green-800/40 text-green-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Bird Identification
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-50 mb-4 leading-tight">
            Identify Birds<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              by Their Song
            </span>
          </h1>
          <p className="text-green-400 text-lg max-w-xl mx-auto">
            Record bird sounds or upload an audio clip. Our AI analyzes the audio patterns to identify the species.
          </p>
        </div>
      </section>

      {/* Recorder Section */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <Card className="bg-[#0f1a0f]/80 border-green-900/40 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-700/20 border border-green-700/40 flex items-center justify-center">
                <Mic className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-bold text-green-100">Record or Upload</h2>
                <p className="text-green-600 text-xs">Hold near a bird and press record, or upload an audio file</p>
              </div>
            </div>
            <AudioRecorder onIdentified={handleIdentified} />
          </CardContent>
        </Card>
      </section>

      {/* Result Section */}
      {result && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <Card className="bg-[#0f1a0f]/80 border-green-500/30 backdrop-blur-sm shadow-2xl shadow-green-900/20 overflow-hidden">
            {/* Result header */}
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 px-6 py-4 border-b border-green-900/30">
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <Bird className="w-4 h-4" />
                Bird Identified!
              </div>
            </div>

            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Bird image */}
                <div className="flex-shrink-0">
                  <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-green-950/30 border border-green-900/30">
                    {!imgError ? (
                      <img
                        src={result.bird.imageUrl}
                        alt={result.bird.commonName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🐦</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bird info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-green-50">{result.bird.commonName}</h2>
                    <p className="text-green-500 italic">{result.bird.scientificName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`flex items-center gap-1 text-base font-bold ${confidenceColor}`}>
                      <Star className="w-4 h-4" />
                      {result.confidence}% confidence
                    </span>
                    <Badge variant="outline" className="border-green-800 text-green-400 text-xs">
                      {result.bird.family}
                    </Badge>
                  </div>

                  <p className="text-green-300 text-sm leading-relaxed">{result.bird.description}</p>

                  <div className="flex items-center gap-2 text-green-500 text-sm italic">
                    <span>🎵</span>
                    <span>&quot;{result.bird.soundDescription}&quot;</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {!added ? (
                      <Button
                        onClick={handleAddToJournal}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-full"
                      >
                        <BookOpen className="w-4 h-4" />
                        Add to Journal
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-green-700 text-green-400 gap-2 rounded-full cursor-default"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4" />
                        In Your Journal
                      </Button>
                    )}

                    <a
                      href={result.bird.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" className="text-green-500 hover:text-green-300 gap-2 rounded-full">
                        <ExternalLink className="w-4 h-4" />
                        Learn More
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Alternates */}
              {result.alternates && result.alternates.length > 0 && (
                <>
                  <Separator className="border-green-900/30 my-5" />
                  <div>
                    <p className="text-green-500 text-xs uppercase tracking-wider mb-3 font-semibold">Other possibilities</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {result.alternates.map(({ bird, confidence }) => (
                        <div
                          key={bird.speciesCode}
                          className="flex items-center gap-2 bg-green-950/20 rounded-lg px-3 py-2 border border-green-900/20"
                        >
                          <span className="text-lg">🐦</span>
                          <div className="min-w-0">
                            <p className="text-green-300 text-xs font-medium truncate">{bird.commonName}</p>
                            <p className="text-green-600 text-xs">{confidence}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {added && (
            <div className="mt-4 text-center">
              <Link href="/journal">
                <Button variant="ghost" className="text-green-400 hover:text-green-300 gap-2">
                  View My Journal
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Tips section (shown when no result yet) */}
      {!result && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🎙️', title: 'Get Close', desc: 'Hold your device near the bird for best results' },
              { icon: '🌿', title: 'Reduce Noise', desc: 'Record in a quiet spot away from traffic' },
              { icon: '⏱️', title: '5-10 Seconds', desc: 'Record at least 5 seconds of bird song' },
            ].map(tip => (
              <div key={tip.title} className="bg-green-950/20 rounded-xl p-4 border border-green-900/20 text-center">
                <div className="text-3xl mb-2">{tip.icon}</div>
                <h3 className="font-semibold text-green-300 text-sm mb-1">{tip.title}</h3>
                <p className="text-green-600 text-xs">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
