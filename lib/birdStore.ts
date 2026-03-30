'use client';

import { findBirdByCode } from './birds';

export interface JournalEntry {
  id: string;
  speciesCode: string;
  commonName: string;
  scientificName: string;
  family: string;
  imageUrl: string;
  dateIdentified: string;
  location?: string;
  confidence: number;
  description: string;
  soundDescription: string;
  habitat: string;
  range: string;
  size: string;
  color: string;
  wikiUrl: string;
  notes?: string;
}

// Compact entry stored in the cookie (lean — full species data is looked up from DEMO_BIRDS)
interface StoredEntry {
  id: string;
  sc: string;   // speciesCode
  d: string;    // dateIdentified ISO string
  c: number;    // confidence
  l?: string;   // location
  n?: string;   // notes
}

const COOKIE_KEY = 'bird-journal';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// ─── Cookie helpers ────────────────────────────────────────────────────────────

function readCookie(): StoredEntry[] {
  if (typeof document === 'undefined') return [];
  try {
    const match = document.cookie.split('; ').find(r => r.startsWith(`${COOKIE_KEY}=`));
    if (!match) return [];
    const raw = decodeURIComponent(match.slice(COOKIE_KEY.length + 1));
    return JSON.parse(raw) as StoredEntry[];
  } catch {
    return [];
  }
}

function writeCookie(entries: StoredEntry[]): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(entries));
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// ─── r1-create plain storage (async, used when running on the R1 device) ──────

async function r1SetJournal(entries: StoredEntry[]): Promise<void> {
  try {
    // Dynamic import so the module is never evaluated server-side
    const { storage } = await import('r1-create');
    await storage.plain.setItem(COOKIE_KEY, entries);
  } catch {
    // Not on R1 device — silently ignore
  }
}

async function r1GetJournal(): Promise<StoredEntry[] | null> {
  try {
    const { storage } = await import('r1-create');
    const data = await storage.plain.getItem(COOKIE_KEY, true);
    if (Array.isArray(data)) return data as StoredEntry[];
  } catch {
    // Not on R1 device
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

function storedToJournalEntry(s: StoredEntry): JournalEntry | null {
  const species = findBirdByCode(s.sc);
  if (!species) return null;
  return {
    id: s.id,
    speciesCode: species.speciesCode,
    commonName: species.commonName,
    scientificName: species.scientificName,
    family: species.family,
    imageUrl: species.imageUrl,
    dateIdentified: s.d,
    location: s.l,
    confidence: s.c,
    description: species.description,
    soundDescription: species.soundDescription,
    habitat: species.habitat,
    range: species.range,
    size: species.size,
    color: species.color,
    wikiUrl: species.wikiUrl,
    notes: s.n,
  };
}

export function getJournal(): JournalEntry[] {
  return readCookie()
    .map(storedToJournalEntry)
    .filter((e): e is JournalEntry => e !== null);
}

export function addToJournal(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const stored = readCookie();
  const newStored: StoredEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    sc: entry.speciesCode,
    d: entry.dateIdentified,
    c: entry.confidence,
    ...(entry.location ? { l: entry.location } : {}),
    ...(entry.notes ? { n: entry.notes } : {}),
  };
  stored.unshift(newStored);
  writeCookie(stored);
  // Also persist to r1 device storage when available
  r1SetJournal(stored);

  const newEntry: JournalEntry = {
    ...entry,
    id: newStored.id,
  };
  return newEntry;
}

export function removeFromJournal(id: string): void {
  const updated = readCookie().filter(e => e.id !== id);
  writeCookie(updated);
  r1SetJournal(updated);
}

export function isInJournal(speciesCode: string): boolean {
  return readCookie().some(e => e.sc === speciesCode);
}

export function clearJournal(): void {
  writeCookie([]);
  r1SetJournal([]);
}

/**
 * Sync from r1 device storage → cookie on first load.
 * Call once on mount (client-only).
 */
let _syncStarted = false;
export async function syncFromR1Storage(): Promise<void> {
  if (_syncStarted) return;
  _syncStarted = true;
  const r1Data = await r1GetJournal();
  if (r1Data && r1Data.length > 0 && readCookie().length === 0) {
    writeCookie(r1Data);
  }
}
