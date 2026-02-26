import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_KEY;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
        return NextResponse.json([]);
    }

    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query.toUpperCase())}&token=${FINNHUB_KEY}`,
            { next: { revalidate: 60 } } // cache for 60 seconds
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'Upstream API error' }, { status: res.status });
        }

        const data = await res.json();

        const filtered = (data.result || [])
            .filter((item: any) => !item.symbol.includes('.'))
            .slice(0, 10);

        return NextResponse.json(filtered);
    } catch (e) {
        console.error('Search proxy error:', e);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
