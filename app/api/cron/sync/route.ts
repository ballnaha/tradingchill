import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateGlobalStockData } from '@/lib/analysis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Basic protection using a CRON_SECRET or similar
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get symbols to update:
        // - Existing recommended stocks
        // - Plus some core market leaders
        const existingStocks = await prisma.stockData.findMany({
            select: { symbol: true }
        });

        const coreStocks = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ', 'BTC-USD'];
        const uniqueSymbols = Array.from(new Set([
            ...existingStocks.map(s => s.symbol),
            ...coreStocks
        ]));

        console.log(`[Cron] Starting auto-sync for ${uniqueSymbols.length} stocks...`);

        const results = [];
        for (const symbol of uniqueSymbols) {
            try {
                console.log(`[Cron] Syncing ${symbol}...`);
                await updateGlobalStockData(symbol);
                results.push({ symbol, status: 'success' });
                // Rate limit protection
                await new Promise(r => setTimeout(r, 1000));
            } catch (err: any) {
                console.error(`[Cron] Failed to sync ${symbol}:`, err.message);
                results.push({ symbol, status: 'error', message: err.message });
            }
        }

        return NextResponse.json({
            message: 'Auto-update completed',
            count: results.length,
            results
        });
    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
