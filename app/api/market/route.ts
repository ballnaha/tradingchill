import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_KEY;

// Cache for market data (10 minutes)
let marketCache: any = null;
let lastFetch = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
    const now = Date.now();

    if (marketCache && (now - lastFetch < CACHE_TTL)) {
        return NextResponse.json(marketCache);
    }

    if (!FINNHUB_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const symbols = [
            'SPY', 'QQQ', 'DIA', // Indices
            'TSLA', 'NVDA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'BRK.B', 'V', 'JPM', // Movers
            'XLK', 'XLF', 'XLE', 'XLV', 'XLY', 'XLP', 'XLI', 'XLRE', 'XLU', 'XLB', 'XLC' // Sectors
        ];

        // Fetch prices only (quotes) for speed
        const results = await Promise.all(symbols.map(async sym => {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`);
            const data = await res.json();
            return { symbol: sym, data };
        }));

        marketCache = results;
        lastFetch = now;

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Market API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
