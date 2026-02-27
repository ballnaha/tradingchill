import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Unauthorized');
    }
}

export async function GET() {
    try {
        await checkAdmin();

        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        predictionhistory: true,
                        watchlist: true,
                        portfolio: true,
                    }
                }
            }
        });

        const usersWithActivity = await Promise.all(
            users.map(async (user) => {
                const lastSession = await prisma.session.findFirst({
                    where: { userId: user.id },
                    orderBy: { expires: 'desc' },
                    select: { expires: true }
                });

                const lastPrediction = await prisma.predictionHistory.findFirst({
                    where: { userId: user.id },
                    orderBy: { date: 'desc' },
                    select: { date: true }
                });

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    status: (user as any).status || 'active',
                    emailVerified: user.emailVerified,
                    predictions: user._count.predictionhistory,
                    watchlistCount: user._count.watchlist,
                    portfolioCount: user._count.portfolio,
                    lastSession: lastSession?.expires || null,
                    lastPrediction: lastPrediction?.date || null,
                };
            })
        );

        return NextResponse.json(usersWithActivity);
    } catch (err) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await checkAdmin();
        const body = await req.json();
        const { id, name, status } = body;

        if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (status !== undefined) updateData.status = status;

        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, user: updated });
    } catch (err: any) {
        console.error('Admin PATCH user error:', err);
        return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await checkAdmin();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const session = await getServerSession(authOptions);
        const adminUser = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
        if (adminUser?.id === userId) {
            return NextResponse.json({ error: 'ไม่สามารถลบบัญชีตัวเองได้' }, { status: 400 });
        }

        await prisma.predictionHistory.deleteMany({ where: { userId } });
        await prisma.watchlist.deleteMany({ where: { userId } });
        await prisma.portfolio.deleteMany({ where: { userId } });
        await prisma.session.deleteMany({ where: { userId } });
        await prisma.account.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Admin DELETE user error:', err);
        return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
    }
}
