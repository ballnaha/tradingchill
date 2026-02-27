import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json([]);
        }

        const userId = (session.user as any).id;

        const history = await prisma.predictionHistory.findMany({
            where: {
                ...(symbol ? { symbol: symbol.toUpperCase() } : {}),
                userId: userId
            },
            orderBy: { date: 'desc' },
            take: 20
        });

        return NextResponse.json(Array.isArray(history) ? history : []);
    } catch (error) {
        console.error('Predictions GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch prediction history' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is suspended (read-only mode)
        const userStatus = (session.user as any).status;
        if (userStatus === 'suspended') {
            return NextResponse.json({ error: 'บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถวิเคราะห์หุ้นได้' }, { status: 403 });
        }

        const userId = (session.user as any).id;
        const body = await request.json() as {
            symbol: string;
            trend: string;
            confidence: any;
            targetPrice?: any;
            target?: any;
            reasoning?: string;
            price?: any;
            change?: number;
            changePercent?: number;
            rsi?: number;
            sma20?: number;
            sma50?: number;
            sma200?: number;
            lowerBB?: number;
            upperBB?: number;
            pe?: number;
        };

        const {
            symbol,
            trend,
            confidence,
            targetPrice,
            target,
            reasoning,
            price
        } = body;

        const finalTarget = targetPrice || target;

        if (!symbol || !trend || !finalTarget) {
            return NextResponse.json({ error: 'Missing required fields: symbol, trend or target' }, { status: 400 });
        }

        // Upsert prediction — only 1 record per symbol per day per user
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const predictionPayload = {
            trend,
            confidence: parseFloat(confidence) || 0,
            targetPrice: parseFloat(finalTarget),
            actualPrice: parseFloat(price) || 0,
            reasoning,
            date: new Date(),
            userId: userId
        };

        const history = await prisma.predictionHistory.upsert({
            where: {
                symbol_dateKey_userId: {
                    symbol: symbol.toUpperCase(),
                    dateKey: today,
                    userId: userId
                },
            },
            update: predictionPayload,
            create: {
                symbol: symbol.toUpperCase(),
                dateKey: today,
                ...predictionPayload,
            },
        });

        // Admin Check: Only the admin can update the global StockData (Recommendations)
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

        if (isAdmin) {
            // Upsert StockData — only the latest snapshot per symbol for Top Picks
            const stockDataPayload = {
                price: parseFloat(price) || 0,
                change: body.change || 0,
                changePercent: body.changePercent || 0,
                rsi: body.rsi,
                sma20: body.sma20,
                sma50: body.sma50,
                sma200: body.sma200,
                lowerBB: body.lowerBB,
                upperBB: body.upperBB,
                pe: body.pe,
                predictionTrend: trend,
                predictionConfidence: parseFloat(confidence) || 0,
                predictionTarget: parseFloat(finalTarget),
                predictionReasoning: reasoning
            };

            await prisma.stockData.upsert({
                where: { symbol: symbol.toUpperCase() },
                update: stockDataPayload,
                create: { symbol: symbol.toUpperCase(), ...stockDataPayload }
            });
        }

        return NextResponse.json(history);
    } catch (error) {
        console.error('Predictions POST error:', error);
        return NextResponse.json({ error: 'Failed to save prediction' }, { status: 500 });
    }
}
