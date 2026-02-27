import { RSI, SMA, BollingerBands, MACD } from 'technicalindicators';
import { StockQuote, getPrediction } from '@/app/utils/prediction';
import { prisma } from './prisma';

const FINNHUB_KEY = process.env.FINNHUB_KEY || process.env.NEXT_PUBLIC_FINNHUB_KEY;

export async function analyzeStock(symbol: string) {
    const sym = symbol.toUpperCase();

    // 1. Fetch Data
    const period2 = Math.floor(Date.now() / 1000);
    const period1 = period2 - (250 * 24 * 60 * 60);

    // We need both the bundle (quote, metrics) and candles
    // Using Yahoo for candles as it's more reliable/free in this app
    const [bundleRes, candleRes] = await Promise.all([
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:4001'}/api/stock-bundle?symbol=${sym}`),
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:4001'}/api/candles?symbol=${sym}&days=250`)
    ]);

    const bundle = await bundleRes.json();
    const candleData = await candleRes.json();

    if (bundle.error) throw new Error(bundle.error);

    const { quote: data, metrics: metricData, profile: profileData, recommendations: recData, spy: spyData, earnings: epsData } = bundle;

    if (!data || (data.c === 0 && data.pc === 0)) {
        throw new Error('Symbol not found or API limit reached');
    }

    // 2. Process Technical Indicators
    let rsiValue, smaValue, sma50Value, sma200Value, lowerBB, upperBB, volumeValue, avgVolume10d;
    let macdHistogram: number | undefined, macdPrevHistogram: number | undefined;
    let recentOpens: number[] | undefined, recentHighs: number[] | undefined, recentLows: number[] | undefined, recentCloses: number[] | undefined;

    if (candleData.s === 'ok' && candleData.c) {
        const closes = candleData.c;
        const volumes = candleData.v || [];

        if (volumes.length > 0) {
            volumeValue = volumes[volumes.length - 1];
            const recent10 = volumes.slice(-11, -1);
            avgVolume10d = recent10.length > 0 ? recent10.reduce((a: number, b: number) => a + b, 0) / recent10.length : undefined;
        }

        const sliceLen = Math.min(5, closes.length);
        recentOpens = (candleData.o || []).slice(-sliceLen);
        recentHighs = (candleData.h || []).slice(-sliceLen);
        recentLows = (candleData.l || []).slice(-sliceLen);
        recentCloses = closes.slice(-sliceLen);

        if (closes.length >= 14) rsiValue = RSI.calculate({ values: closes, period: 14 }).slice(-1)[0];
        if (closes.length >= 20) {
            smaValue = SMA.calculate({ values: closes, period: 20 }).slice(-1)[0];
            const bb = BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 }).slice(-1)[0];
            lowerBB = bb?.lower; upperBB = bb?.upper;
        }
        if (closes.length >= 50) sma50Value = SMA.calculate({ values: closes, period: 50 }).slice(-1)[0];
        if (closes.length >= 200) sma200Value = SMA.calculate({ values: closes, period: 200 }).slice(-1)[0];
        if (closes.length >= 35) {
            const macd = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
            if (macd.length >= 2) {
                macdHistogram = macd[macd.length - 1].histogram;
                macdPrevHistogram = macd[macd.length - 2].histogram;
            }
        }
    }

    const latestRec = Array.isArray(recData) ? recData[0] : null;
    let earningsSurprise: number | undefined;
    if (epsData?.[0]?.estimate) {
        earningsSurprise = ((epsData[0].actual - epsData[0].estimate) / Math.abs(epsData[0].estimate)) * 100;
    }

    const newQuote: StockQuote = {
        symbol: sym,
        price: data.c, change: data.d, changePercent: data.dp,
        high: data.h, low: data.l, open: data.o, previousClose: data.pc,
        name: profileData?.name || sym,
        rsi: rsiValue, sma20: smaValue, sma50: sma50Value, sma200: sma200Value,
        lowerBB, upperBB,
        macdHistogram, macdPrevHistogram,
        recentOpens, recentHighs, recentLows, recentCloses,
        volume: volumeValue, avgVolume10d,
        pe: metricData?.metric?.peExclExtraTTM,
        yearHigh: metricData?.metric?.['52WeekHigh'],
        yearLow: metricData?.metric?.['52WeekLow'],
        beta: metricData?.metric?.beta,
        revenueGrowth: metricData?.metric?.revenueGrowthTTMYoy,
        netMargin: metricData?.metric?.netProfitMarginTTM,
        analystBuy: latestRec ? (latestRec.strongBuy || 0) + (latestRec.buy || 0) : undefined,
        analystHold: latestRec?.hold,
        analystSell: latestRec ? (latestRec.sell || 0) + (latestRec.strongSell || 0) : undefined,
        earningsSurprise,
        spyChangePercent: spyData?.dp
    };

    const pred = getPrediction(newQuote);
    return { ...newQuote, ...pred };
}

export async function updateGlobalStockData(symbol: string) {
    const analysis = await analyzeStock(symbol);

    const stockDataPayload = {
        price: analysis.price || 0,
        change: analysis.change || 0,
        changePercent: analysis.changePercent || 0,
        rsi: analysis.rsi,
        sma20: analysis.sma20,
        sma50: analysis.sma50,
        sma200: analysis.sma200,
        lowerBB: analysis.lowerBB,
        upperBB: analysis.upperBB,
        pe: analysis.pe,
        predictionTrend: analysis.trend,
        predictionConfidence: parseFloat(analysis.confidence) || 0,
        predictionTarget: parseFloat(analysis.targetNextDay),
        predictionReasoning: analysis.reasoning,
        date: new Date()
    };

    return await prisma.stockData.upsert({
        where: { symbol: symbol.toUpperCase() },
        update: stockDataPayload,
        create: { symbol: symbol.toUpperCase(), ...stockDataPayload }
    });
}
