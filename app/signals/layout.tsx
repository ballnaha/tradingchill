import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
    title: "My Signals | TradingChill",
};

export default function SignalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
