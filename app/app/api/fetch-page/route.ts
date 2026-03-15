import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const key = searchParams.get('key');

  if (key !== 'ghcc_rob_2026_persist') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!url || !url.startsWith('https://generationhealth.me')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: 502 });
    }

    const html = await response.text();

    if (!html || html.length < 500) {
      return NextResponse.json({ error: 'Empty response' }, { status: 502 });
    }

    return NextResponse.json({ html }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
