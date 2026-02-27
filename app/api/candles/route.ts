import { NextResponse } from 'next/server';

// In-memory cache for candle data
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'NVDA').toUpperCase();
    const rangeDays = parseInt(searchParams.get('days') || '250');

    // Check cache
    const cacheKey = `${symbol}_${rangeDays}`;
    const cachedItem = cache.get(cacheKey);
    const now = Date.now();
    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL)) {
        return NextResponse.json(cachedItem.data, {
            headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
        });
    }

    try {
        const period2 = Math.floor(Date.now() / 1000);
        const period1 = period2 - (rangeDays * 24 * 60 * 60);

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!res.ok) {
            return NextResponse.json(
                { s: 'no_data', error: `Yahoo Finance returned ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();
        const result = json?.chart?.result?.[0];

        if (!result || !result.timestamp) {
            return NextResponse.json({ s: 'no_data', error: 'No data found' }, { status: 404 });
        }

        const quotes = result.indicators?.quote?.[0];
        if (!quotes) {
            return NextResponse.json({ s: 'no_data', error: 'No quote data' }, { status: 404 });
        }

        // Filter out null entries (holidays, etc.) and format like Finnhub
        const t: number[] = [];
        const o: number[] = [];
        const h: number[] = [];
        const l: number[] = [];
        const c: number[] = [];
        const v: number[] = [];

        for (let i = 0; i < result.timestamp.length; i++) {
            if (quotes.close[i] != null && quotes.open[i] != null) {
                t.push(result.timestamp[i]);
                o.push(quotes.open[i]);
                h.push(quotes.high[i]);
                l.push(quotes.low[i]);
                c.push(quotes.close[i]);
                v.push(quotes.volume[i] || 0);
            }
        }

        const responseData = { s: 'ok', t, o, h, l, c, v };

        // Store in cache
        cache.set(cacheKey, { data: responseData, timestamp: now });

        return NextResponse.json(responseData, {
            headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
        });
    } catch (e: any) {
        console.error('Candle API error:', e);
        return NextResponse.json({ s: 'no_data', error: e.message }, { status: 500 });
    }
}
