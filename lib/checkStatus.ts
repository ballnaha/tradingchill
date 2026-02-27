import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user's account is suspended.
 * Suspended users can read data but cannot create/modify data.
 * Returns the user's status or null if not authenticated.
 */
export async function checkUserStatus(): Promise<{ isSuspended: boolean; status: string } | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
    });

    if (!user) return null;

    return {
        isSuspended: user.status === 'suspended',
        status: user.status || 'active',
    };
}
