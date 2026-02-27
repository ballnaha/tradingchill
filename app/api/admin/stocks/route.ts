import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateGlobalStockData } from '@/lib/analysis';

// Middleware-like check for admin
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Unauthorized');
    }
}

export async function GET() {
    try {
        await checkAdmin();
        const stocks = await prisma.stockData.findMany({
            orderBy: { symbol: 'asc' }
        });
        return NextResponse.json(stocks);
    } catch (err) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await checkAdmin();
        const { symbol } = await req.json();
        const sym = symbol.toUpperCase();

        if (!sym) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

        // 1. Check if exists
        const exists = await prisma.stockData.findUnique({ where: { symbol: sym } });
        if (exists) return NextResponse.json({ error: 'Stock already exists' }, { status: 400 });

        // 2. Initial analysis and database creation
        // This makes sure the stock is immediately ready for display
        const stock = await updateGlobalStockData(sym);

        return NextResponse.json(stock);
    } catch (err: any) {
        console.error('Admin POST error:', err);
        return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await checkAdmin();
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol');

        if (!symbol) return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });

        await prisma.stockData.delete({
            where: { symbol: symbol.toUpperCase() }
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
