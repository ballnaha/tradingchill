import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateGlobalStockData } from '@/lib/analysis';

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    // 1. Check for valid CRON_SECRET in headers
    const authHeader = req.headers.get('authorization');
    const isCronTokenValid = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    // 2. Check for valid Admin session (if called from UI)
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

    if (!isCronTokenValid && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get ALL symbols from StockData table
        // These are the stocks being tracked for Global Recommendations
        const trackedStocks = await prisma.stockData.findMany({
            select: { symbol: true }
        });

        const uniqueSymbols = trackedStocks.map(s => s.symbol);

        if (uniqueSymbols.length === 0) {
            return NextResponse.json({ message: 'No stocks found to sync. Add some in the Admin panel.' });
        }

        console.log(`[Cron] Starting auto-sync for ${uniqueSymbols.length} tracked stocks...`);

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
