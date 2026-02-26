import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Stocks GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}
