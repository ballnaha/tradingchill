import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_KEY;

// Simple in-memory cache
// Key: Symbol, Value: { data: any, timestamp: number }
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    if (!FINNHUB_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Check Cache
    const cachedItem = cache.get(symbol);
    const now = Date.now();
    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL)) {
        console.log(`[Cache Hit] Serving ${symbol} from memory`);
        return NextResponse.json(cachedItem.data, {
            headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
        });
    }

    try {
        console.log(`[Cache Miss] Fetching ${symbol} from multiple sources`);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const fromDate = lastWeek.toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];

        // Fetch all data points in parallel on the server
        const promises = [
            fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r => r.json()),
            fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`).then(r => r.json()),
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r => r.json()),
            fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r => r.json()),
            fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${FINNHUB_KEY}`).then(r => r.json()),
            fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&limit=1&token=${FINNHUB_KEY}`).then(r => r.json()).catch(() => null),
            fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_KEY}`).then(r => r.json()).catch(() => []),
            // Yahoo Finance Fallback for better real-time price
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            }).then(r => r.json()).catch(() => null)
        ];

        const [quote, metrics, profile, recommendations, spy, earnings, news, yahooData] = await Promise.all(promises);

        // Try to enrich Finnhub quote with Yahoo Finance real-time data if available
        if (yahooData?.chart?.result?.[0]?.meta) {
            const meta = yahooData.chart.result[0].meta;
            const yahooPrice = meta.regularMarketPrice;
            const yahooPrevClose = meta.previousClose;
            
            // Log for debugging
            console.log(`[Price Comparison] ${symbol} - Finnhub: ${quote.c}, Yahoo: ${yahooPrice}`);

            // If Yahoo price exists and is different, we can prefer it or merge
            if (yahooPrice && Math.abs(quote.c - yahooPrice) > 0.01) {
                quote.c = yahooPrice;
                quote.pc = yahooPrevClose || quote.pc;
                quote.d = quote.c - quote.pc;
                quote.dp = (quote.d / quote.pc) * 100;
                console.log(`[Price Update] Using Yahoo Finance price for ${symbol}: ${yahooPrice}`);
            }
        }

        const responseData = {
            quote,
            metrics,
            profile,
            recommendations,
            spy,
            earnings,
            news,
            cachedAt: new Date().toISOString()
        };

        // Store in Cache
        cache.set(symbol, {
            data: responseData,
            timestamp: now
        });

        return NextResponse.json(responseData, {
            headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
        });
    } catch (error: any) {
        console.error('Stock Bundle API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
