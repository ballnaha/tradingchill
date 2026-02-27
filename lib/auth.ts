import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        signIn: async ({ user }: any) => {
            // Check user status before allowing sign-in
            const dbUser = await (prisma.user as any).findUnique({
                where: { email: user.email },
            });

            // New users (not in DB yet) are allowed — they'll get status 'active' by default
            if (!dbUser) return true;

            // Only banned users are completely blocked from login
            // Suspended users CAN login but with restricted access (read-only)
            if (dbUser.status === 'banned') {
                return '/auth/error?error=AccountBanned';
            }

            return true;
        },
        session: async ({ session, user }: any) => {
            if (session.user) {
                session.user.id = user.id;
                session.user.status = (user as any).status || 'active';
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
