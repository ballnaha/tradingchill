import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
    title: "ประวัติการวิเคราะห์ | TradingChill",
};

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
