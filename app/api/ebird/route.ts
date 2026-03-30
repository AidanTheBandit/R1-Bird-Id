import { NextRequest, NextResponse } from 'next/server';

const EBIRD_BASE_URL = 'https://api.ebird.org/v2';
const API_KEY = process.env.NEXT_PUBLIC_EBIRD_API_KEY || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'eBird API key not configured' }, { status: 503 });
  }

  try {
    const params = new URLSearchParams(searchParams);
    params.delete('endpoint');

    const url = `${EBIRD_BASE_URL}/${endpoint}?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        'X-eBirdApiToken': API_KEY
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'eBird API error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from eBird' }, { status: 500 });
  }
}
