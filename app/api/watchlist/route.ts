import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json([]);
        }

        const watchlist = await (prisma as any).watchlist.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(watchlist);
    } catch (error) {
        console.error('Watchlist GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { symbol, name } = await request.json();

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        const item = await (prisma as any).watchlist.upsert({
            where: {
                symbol_userId: {
                    symbol: symbol.toUpperCase(),
                    userId: userId
                }
            },
            update: { name },
            create: {
                symbol: symbol.toUpperCase(),
                name,
                userId: userId
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Watchlist POST error:', error);
        return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        await (prisma as any).watchlist.delete({
            where: {
                symbol_userId: {
                    symbol: symbol.toUpperCase(),
                    userId: userId
                }
            }
        });

        return NextResponse.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Watchlist DELETE error:', error);
        return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
    }
}
