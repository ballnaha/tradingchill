import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch live quotes from Yahoo Finance for multiple symbols at once
async function fetchLiveQuotes(symbols: string[]): Promise<Record<string, { price: number; change: number; changePercent: number }>> {
    if (symbols.length === 0) return {};
    try {
        const joined = symbols.join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            next: { revalidate: 60 } // cache 60s
        });
        if (!res.ok) return {};
        const json = await res.json();
        const quoteMap: Record<string, { price: number; change: number; changePercent: number }> = {};
        for (const q of json?.quoteResponse?.result ?? []) {
            quoteMap[q.symbol] = {
                price: q.regularMarketPrice ?? 0,
                change: q.regularMarketChange ?? 0,
                changePercent: q.regularMarketChangePercent ?? 0,
            };
        }
        return quoteMap;
    } catch {
        return {};
    }
}

export async function GET() {
    try {
        const stocks = await prisma.stockData.findMany({
            where: {
                predictionConfidence: { not: null }
            },
            orderBy: [
                { predictionConfidence: 'desc' },
                { symbol: 'asc' }
            ],
            take: 20
        });

        // Fetch live prices for all symbols in one batch
        const symbols = stocks.map(s => s.symbol);
        const liveQuotes = await fetchLiveQuotes(symbols);

        // Merge live prices into stock data (fallback to DB price if fetch fails)
        const enriched = stocks.map(s => {
            const live = liveQuotes[s.symbol];
            return {
                ...s,
                price: live?.price ?? s.price,
                change: live?.change ?? s.change,
                changePercent: live?.changePercent ?? s.changePercent,
            };
        });

        return NextResponse.json(enriched);
    } catch (error) {
        console.error('Stocks GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
