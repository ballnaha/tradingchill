import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import { Providers } from "./components/Providers";
import { GoogleAnalytics } from '@next/third-parties/google';


export const metadata: Metadata = {
  title: {
    default: "TradingChill - เครื่องมือวิเคราะห์หุ้นเชิงปริมาณ",
    template: "%s | TradingChill"
  },
  description: "เครื่องมือวิเคราะห์ข้อมูลหุ้นสหรัฐฯ เชิงปริมาณ (Quantitative Analysis) ด้วยตัวชี้วัดทางเทคนิค RSI, SMA, Bollinger Bands, MACD — ไม่ใช่คำแนะนำการลงทุน",
  keywords: ["Stock Analysis", "Quantitative Analysis", "TradingChill", "วิเคราะห์หุ้น", "Technical Indicators", "เครื่องมือวิเคราะห์หุ้น"],
  authors: [{ name: "TradingChill Team" }],
  creator: "TradingChill",
  publisher: "TradingChill",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://tradingchill.com",
    siteName: "TradingChill",
    title: "TradingChill - เครื่องมือวิเคราะห์หุ้นเชิงปริมาณ",
    description: "เครื่องมือวิเคราะห์ข้อมูลหุ้นด้วยตัวชี้วัดทางเทคนิค — ข้อมูลเพื่อประกอบการตัดสินใจเท่านั้น ไม่ใช่คำแนะนำการลงทุน",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "TradingChill Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradingChill - เครื่องมือวิเคราะห์หุ้นเชิงปริมาณ",
    description: "วิเคราะห์ข้อมูลหุ้นด้วยตัวชี้วัดทางเทคนิค — ไม่ใช่คำแนะนำการลงทุน",
    images: ["/images/logo.png"],
  },
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Comfortaa:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Sora:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeRegistry>
          <Providers>
            <Header />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </Providers>
        </ThemeRegistry>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
