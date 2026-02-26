import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Providers } from "./components/Providers";
import { GoogleAnalytics } from '@next/third-parties/google';


export const metadata: Metadata = {
  title: {
    default: "TradingChill - Smart Stock Analysis & AI Insights",
    template: "%s | TradingChill"
  },
  description: "Chill out while our quant algorithms and AI analyze the market for you. Real-time stock insights, technical indicators, and smart predictions for Thai and US markets.",
  keywords: ["Stock Analysis", "AI Stock Prediction", "TradingChill", "วิเคราะห์หุ้น", "หุ้นไทย", "หุ้นอเมริกา", "Technical Indicators", "Financial Insights"],
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
    title: "TradingChill - Smart Stock Analysis & AI Insights",
    description: "Chill out while our quant algorithms and AI analyze the market for you. Real-time stock insights and smart predictions.",
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
    title: "TradingChill - Smart Stock Analysis",
    description: "AI-powered stock analysis and market insights.",
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Comfortaa:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeRegistry>
          <Providers>
            <Header />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </Providers>
        </ThemeRegistry>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
