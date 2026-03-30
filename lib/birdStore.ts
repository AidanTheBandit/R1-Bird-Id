'use client';

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

const STORAGE_KEY = 'bird-journal';

export function getJournal(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToJournal(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const journal = getJournal();
  const newEntry: JournalEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  };
  journal.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
  return newEntry;
}

export function removeFromJournal(id: string): void {
  const journal = getJournal().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
}

export function isInJournal(speciesCode: string): boolean {
  return getJournal().some(e => e.speciesCode === speciesCode);
}

export function clearJournal(): void {
  localStorage.removeItem(STORAGE_KEY);
}
