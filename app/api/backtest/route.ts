import { NextResponse } from 'next/server';
import { RSI, SMA, BollingerBands, MACD } from 'technicalindicators';
import { getPrediction, StockQuote } from '../../utils/prediction';

// Yahoo Finance historical data fetcher (free, no API key needed)
async function fetchYahooCandles(symbol: string, rangeDays: number) {
    // period1 = rangeDays ago, period2 = now
    const period2 = Math.floor(Date.now() / 1000);
    const period1 = period2 - (rangeDays * 24 * 60 * 60);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    if (!res.ok) {
        throw new Error(`Yahoo Finance API returned ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result || !result.timestamp) {
        throw new Error(`No data found for symbol "${symbol}". Please check the symbol.`);
    }

    const quotes = result.indicators?.quote?.[0];
    if (!quotes) {
        throw new Error('Yahoo Finance returned no quote data');
    }

    // Filter out null entries (holidays, etc.)
    const timestamps: number[] = [];
    const opens: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const closes: number[] = [];
    const volumes: number[] = [];

    for (let i = 0; i < result.timestamp.length; i++) {
        if (quotes.close[i] != null && quotes.open[i] != null) {
            timestamps.push(result.timestamp[i]);
            opens.push(quotes.open[i]);
            highs.push(quotes.high[i]);
            lows.push(quotes.low[i]);
            closes.push(quotes.close[i]);
            volumes.push(quotes.volume[i] || 0);
        }
    }

    return { timestamps, opens, highs, lows, closes, volumes };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'NVDA').toUpperCase();
    // Allow up to 180 days backtest
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 180);

    try {
        // ดึงข้อมูลย้อนหลังจาก Yahoo Finance (ฟรี ไม่ต้องใช้ API key)
        // ดึงข้อมูล 500 วัน เพื่อให้มี warmup period เพียงพอสำหรับ SMA200
        const data = await fetchYahooCandles(symbol, 500);

        if (data.closes.length < 30) {
            return NextResponse.json({
                error: `Not enough historical data (got ${data.closes.length} candles, need 30+).`
            }, { status: 400 });
        }

        const closes = data.closes;
        const opens = data.opens;
        const highs = data.highs;
        const lows = data.lows;
        const volumes = data.volumes;
        const timestamps = data.timestamps;

        const results: any[] = [];

        // Warmup: prefer 200+ candles for accurate SMA200, min 50
        const tradingDaysToTest = Math.floor(days * (252 / 365));
        const idealWarmup = 200; // for SMA200
        const warmup = Math.max(50, Math.min(idealWarmup, closes.length - tradingDaysToTest - 4));
        const startIdx = Math.max(warmup, closes.length - tradingDaysToTest);

        console.log(`[Backtest] ${symbol}: ${closes.length} candles, warmup=${warmup}, startIdx=${startIdx}, testRange=${closes.length - 3 - startIdx}`);

        for (let i = startIdx; i < closes.length - 3; i++) {
            const slicedCloses = closes.slice(0, i + 1);
            const slicedVols = volumes.slice(0, i + 1);

            // ─── Indicators ──────────────────────────────────
            let rsi: number | undefined, sma20: number | undefined, sma50: number | undefined, sma200: number | undefined;
            let lowerBB: number | undefined, upperBB: number | undefined;
            let macdHistogram: number | undefined, macdPrevHistogram: number | undefined;

            if (slicedCloses.length >= 14) {
                const r = RSI.calculate({ values: slicedCloses, period: 14 });
                rsi = r[r.length - 1];
            }
            if (slicedCloses.length >= 20) {
                const sm = SMA.calculate({ values: slicedCloses, period: 20 });
                sma20 = sm[sm.length - 1];
                const bb = BollingerBands.calculate({ values: slicedCloses, period: 20, stdDev: 2 });
                const lb = bb[bb.length - 1];
                lowerBB = lb?.lower;
                upperBB = lb?.upper;
            }
            if (slicedCloses.length >= 50) {
                const sm = SMA.calculate({ values: slicedCloses, period: 50 });
                sma50 = sm[sm.length - 1];
            }
            if (slicedCloses.length >= 200) {
                const sm = SMA.calculate({ values: slicedCloses, period: 200 });
                sma200 = sm[sm.length - 1];
            }
            if (slicedCloses.length >= 35) {
                const macdArr = MACD.calculate({ values: slicedCloses, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
                if (macdArr.length >= 2) {
                    macdHistogram = macdArr[macdArr.length - 1].histogram;
                    macdPrevHistogram = macdArr[macdArr.length - 2].histogram;
                }
            }

            const currentPrice = closes[i];
            const prevPrice = closes[i - 1];
            const avgVol10d = slicedVols.slice(-11, -1).reduce((a, b) => a + b, 0) / 10;

            // OHLC for candlestick
            const sliceLen = Math.min(5, i + 1);
            const recentOpens = opens.slice(i + 1 - sliceLen, i + 1);
            const recentHighs = highs.slice(i + 1 - sliceLen, i + 1);
            const recentLows = lows.slice(i + 1 - sliceLen, i + 1);
            const recentCloses = closes.slice(i + 1 - sliceLen, i + 1);

            const quote: StockQuote = {
                symbol,
                price: currentPrice,
                change: currentPrice - prevPrice,
                changePercent: ((currentPrice - prevPrice) / prevPrice) * 100,
                high: highs[i],
                low: lows[i],
                open: opens[i],
                previousClose: prevPrice,
                rsi, sma20, sma50, sma200, lowerBB, upperBB,
                macdHistogram, macdPrevHistogram,
                recentOpens, recentHighs, recentLows, recentCloses,
                volume: volumes[i],
                avgVolume10d: avgVol10d,
            };

            const pred = getPrediction(quote);

            // Actual price 3 trading days later
            const futureIdx = Math.min(i + 3, closes.length - 1);
            const actualPrice = closes[futureIdx];
            const actualChangePct = ((actualPrice - currentPrice) / currentPrice) * 100;

            // Direction-based correctness (fairer evaluation):
            // UP prediction is correct if price went up (>0%)
            // DOWN prediction is correct if price went down (<0%)
            // Neutral prediction is correct if price changed < 1% either way
            let correct = false;
            if (pred.trend === 'UP') {
                correct = actualChangePct > 0;
            } else if (pred.trend === 'DOWN') {
                correct = actualChangePct < 0;
            } else {
                // Neutral — correct if price stayed relatively flat
                correct = Math.abs(actualChangePct) < 1.0;
            }

            results.push({
                date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                price: currentPrice.toFixed(2),
                predictedTrend: pred.trend,
                confidence: parseFloat(pred.confidence),
                targetPrice: parseFloat(pred.target),
                actualPrice: parseFloat(actualPrice.toFixed(2)),
                actualChangePct: parseFloat(actualChangePct.toFixed(2)),
                correct,
                priceError: parseFloat((Math.abs(actualPrice - parseFloat(pred.target)) / currentPrice * 100).toFixed(2)),
            });
        }

        // ─── Summary Statistics ───────────────────────────
        const total = results.length;
        if (total === 0) return NextResponse.json({ error: 'No results' }, { status: 400 });

        const correct = results.filter(r => r.correct).length;
        const upPreds = results.filter(r => r.predictedTrend === 'UP');
        const downPreds = results.filter(r => r.predictedTrend === 'DOWN');
        const neutralPreds = results.filter(r => r.predictedTrend === 'Neutral');

        const highConf = results.filter(r => r.confidence >= 75);
        const midConf = results.filter(r => r.confidence >= 60 && r.confidence < 75);
        const lowConf = results.filter(r => r.confidence < 60);

        const accuracy = (n: any[]) => n.length > 0
            ? parseFloat((n.filter(r => r.correct).length / n.length * 100).toFixed(1))
            : null;

        return NextResponse.json({
            symbol,
            period: `${days} วัน`,
            totalPredictions: total,
            overallAccuracy: parseFloat((correct / total * 100).toFixed(1)),
            upAccuracy: accuracy(upPreds),
            downAccuracy: accuracy(downPreds),
            neutralAccuracy: accuracy(neutralPreds),
            upCount: upPreds.length,
            downCount: downPreds.length,
            neutralCount: neutralPreds.length,
            highConfAccuracy: accuracy(highConf),
            midConfAccuracy: accuracy(midConf),
            lowConfAccuracy: accuracy(lowConf),
            highConfCount: highConf.length,
            avgPriceError: parseFloat((results.reduce((s, r) => s + r.priceError, 0) / total).toFixed(2)),
            results: results.slice(-60), // Last 60 days for chart
        });

    } catch (e: any) {
        console.error('Backtest error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
