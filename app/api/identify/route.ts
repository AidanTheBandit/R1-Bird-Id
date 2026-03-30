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

export interface DetectedBird {
  bird: BirdSpecies;
  confidence: number;
}

export interface IdentifyResponse {
  /** All birds detected in this recording (1–3 typically). */
  detectedBirds: DetectedBird[];
}

function scoreAllBirds(
  features: IdentifyRequest['audioFeatures']
): Array<{ bird: BirdSpecies; confidence: number; score: number }> {
  return DEMO_BIRDS.map(bird => {
    let score = Math.random() * 40 + 30;

    if (features?.dominantFrequency) {
      const freq = features.dominantFrequency;
      if (freq > 6000 && ['rthhum', 'amegfi', 'bkcchi', 'cedwax'].includes(bird.speciesCode)) score += 25;
      if (freq >= 3000 && freq <= 6000 && ['amerob', 'norcar', 'easblu', 'sonspa'].includes(bird.speciesCode)) score += 25;
      if (freq < 2000 && ['grhowl', 'cangoo', 'amecro', 'comloo'].includes(bird.speciesCode)) score += 25;
    }

    if (features?.duration) {
      if (features.duration > 3 && ['comloo', 'norcar', 'amerob'].includes(bird.speciesCode)) score += 10;
      if (features.duration < 1 && ['bkcchi', 'dowwoo', 'houspa'].includes(bird.speciesCode)) score += 10;
    }

    return { bird, confidence: Math.min(Math.round(score), 98), score };
  }).sort((a, b) => b.score - a.score);
}

export async function POST(req: NextRequest) {
  try {
    const body: IdentifyRequest = await req.json();
    const ranked = scoreAllBirds(body.audioFeatures);

    // Primary bird is always included.
    const primary = ranked[0];
    const detectedBirds: DetectedBird[] = [
      { bird: primary.bird, confidence: primary.confidence }
    ];

    // For recordings longer than 3 seconds, simulate a chance of detecting
    // additional birds. Add up to 2 more if their scores are close to the top.
    const duration = body.audioFeatures?.duration ?? 0;
    if (duration >= 3) {
      const scoreThreshold = primary.score * 0.72; // within 28% of top score
      for (let i = 1; i < ranked.length && detectedBirds.length < 3; i++) {
        if (ranked[i].score >= scoreThreshold && Math.random() > 0.45) {
          detectedBirds.push({ bird: ranked[i].bird, confidence: ranked[i].confidence });
        }
      }
    }

    const response: IdentifyResponse = { detectedBirds };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Failed to identify bird' }, { status: 500 });
  }
}
