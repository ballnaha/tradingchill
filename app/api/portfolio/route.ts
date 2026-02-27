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

        const portfolio = await prisma.portfolio.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { buyDate: 'desc' }
        });
        return NextResponse.json(portfolio);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is suspended (read-only mode)
        const userStatus = (session.user as any).status;
        if (userStatus === 'suspended') {
            return NextResponse.json({ error: 'บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถเพิ่ม Portfolio ได้' }, { status: 403 });
        }

        const { symbol, name, shares, buyPrice } = await req.json();
        const newItem = await prisma.portfolio.create({
            data: {
                symbol,
                name,
                shares: parseFloat(shares),
                buyPrice: parseFloat(buyPrice),
                buyDate: new Date(),
                userId: (session.user as any).id
            }
        });
        return NextResponse.json(newItem);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userStatus = (session.user as any).status;
        if (userStatus === 'suspended') {
            return NextResponse.json({ error: 'บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถจัดการ Portfolio ได้' }, { status: 403 });
        }

        const { id } = await req.json();
        await prisma.portfolio.delete({
            where: {
                id: parseInt(id),
                userId: (session.user as any).id
            }
        });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
