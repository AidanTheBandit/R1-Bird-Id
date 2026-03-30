import { NextRequest, NextResponse } from 'next/server';
import { DEMO_BIRDS, BirdSpecies } from '@/lib/birds';

export interface IdentifyRequest {
  audioFeatures?: {
    dominantFrequency?: number;
    frequencyRange?: [number, number];
    duration?: number;
    rhythmPattern?: string;
    amplitude?: number;
  };
  description?: string;
  location?: { lat: number; lng: number };
}

export interface IdentifyResponse {
  bird: BirdSpecies;
  confidence: number;
  alternates: Array<{ bird: BirdSpecies; confidence: number }>;
}

function selectBirdByAudioFeatures(features: IdentifyRequest['audioFeatures']): { bird: BirdSpecies; confidence: number }[] {
  const results: Array<{ bird: BirdSpecies; confidence: number; score: number }> = [];

  for (const bird of DEMO_BIRDS) {
    let score = Math.random() * 40 + 30;

    if (features?.dominantFrequency) {
      const freq = features.dominantFrequency;
      if (freq > 6000 && ['rthhum', 'amegfi', 'bkcchi', 'cedwax'].includes(bird.speciesCode)) {
        score += 25;
      }
      if (freq >= 3000 && freq <= 6000 && ['amerob', 'norcar', 'easblu', 'sonspa'].includes(bird.speciesCode)) {
        score += 25;
      }
      if (freq < 2000 && ['grhowl', 'cangoo', 'amecro', 'comloo'].includes(bird.speciesCode)) {
        score += 25;
      }
    }

    if (features?.duration) {
      if (features.duration > 3 && ['comloo', 'norcar', 'amerob'].includes(bird.speciesCode)) {
        score += 10;
      }
      if (features.duration < 1 && ['bkcchi', 'dowwoo', 'houspa'].includes(bird.speciesCode)) {
        score += 10;
      }
    }

    results.push({ bird, confidence: Math.min(Math.round(score), 98), score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5).map(r => ({ bird: r.bird, confidence: r.confidence }));
}

export async function POST(req: NextRequest) {
  try {
    const body: IdentifyRequest = await req.json();
    const ranked = selectBirdByAudioFeatures(body.audioFeatures);

    const top = ranked[0];
    const alternates = ranked.slice(1, 4);

    const response: IdentifyResponse = {
      bird: top.bird,
      confidence: top.confidence,
      alternates
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Failed to identify bird' }, { status: 500 });
  }
}
