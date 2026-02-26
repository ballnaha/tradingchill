import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Providers } from "./components/Providers";

export const metadata: Metadata = {
  title: "TradingChill - Smart Stock Analysis",
  description: "Chill out while our quant algorithms analyze the market for you",
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
      </body>
    </html>
  );
}
