import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/watchlist/cache
// Returns the latest cached StockData for each symbol in the user's watchlist
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user ? (session.user as any).id : null;

        // Get all watchlist symbols for this user
        const watchlist = await prisma.watchlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        if (watchlist.length === 0) {
            return NextResponse.json([]);
        }

        const symbols = watchlist.map(w => w.symbol);

        // For each symbol, get the most recent StockData entry
        const cacheResults = await Promise.all(
            symbols.map(async (symbol) => {
                const latest = await prisma.stockData.findFirst({
                    where: { symbol },
                    orderBy: { date: 'desc' }
                });
                return latest;
            })
        );

        // Filter out nulls (symbols that have never been scanned)
        const filtered = cacheResults.filter(Boolean);

        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Watchlist cache GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlist cache' }, { status: 500 });
    }
}
