import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { analyzeStock } from '@/lib/analysis';

export const dynamic = 'force-dynamic';

// GET: Return analyzed signals for user's watchlist stocks
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const watchlist = await prisma.watchlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        if (watchlist.length === 0) {
            return NextResponse.json([]);
        }

        return NextResponse.json(watchlist.map(w => ({ symbol: w.symbol, name: w.name })));
    } catch (error: any) {
        console.error('Signals GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Analyze a specific stock from user's watchlist (on-demand)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is suspended (read-only mode)
        const userStatus = (session.user as any).status;
        if (userStatus === 'suspended') {
            return NextResponse.json({ error: 'บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถวิเคราะห์หุ้นได้' }, { status: 403 });
        }

        const { symbol } = await request.json();
        if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

        const analysis = await analyzeStock(symbol);
        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('Signals POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
