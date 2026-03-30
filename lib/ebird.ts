const EBIRD_BASE_URL = 'https://api.ebird.org/v2';
const API_KEY = process.env.NEXT_PUBLIC_EBIRD_API_KEY || '';

export interface EBirdObservation {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany?: number;
  lat: number;
  lng: number;
}

export interface EBirdTaxonomy {
  sciName: string;
  comName: string;
  speciesCode: string;
  category: string;
  taxonOrder: number;
  familyComName: string;
  familySciName: string;
  order: string;
}

export async function getNearbyObservations(lat: number, lng: number): Promise<EBirdObservation[]> {
  if (!API_KEY) {
    return getMockObservations();
  }
  try {
    const res = await fetch(
      `/api/ebird?endpoint=data/obs/geo/recent&lat=${lat}&lng=${lng}`
    );
    if (!res.ok) return getMockObservations();
    return res.json();
  } catch {
    return getMockObservations();
  }
}

export async function getSpeciesTaxonomy(speciesCode: string): Promise<EBirdTaxonomy | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `/api/ebird?endpoint=ref/taxonomy/ebird&species=${speciesCode}&fmt=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

function getMockObservations(): EBirdObservation[] {
  return [
    { speciesCode: 'amerob', comName: 'American Robin', sciName: 'Turdus migratorius', locName: 'Local Park', obsDt: new Date().toISOString(), howMany: 3, lat: 0, lng: 0 },
    { speciesCode: 'norcar', comName: 'Northern Cardinal', sciName: 'Cardinalis cardinalis', locName: 'Backyard', obsDt: new Date().toISOString(), howMany: 1, lat: 0, lng: 0 },
    { speciesCode: 'blujay', comName: 'Blue Jay', sciName: 'Cyanocitta cristata', locName: 'Forest Edge', obsDt: new Date().toISOString(), howMany: 2, lat: 0, lng: 0 },
  ];
}

// Suppress unused variable warning
void EBIRD_BASE_URL;
