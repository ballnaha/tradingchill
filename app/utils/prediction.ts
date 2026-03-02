export interface StockQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    name?: string;

    // Technical Indicators
    rsi?: number;
    sma20?: number;
    sma50?: number;
    sma200?: number;
    lowerBB?: number;
    upperBB?: number;

    // MACD
    macdHistogram?: number;
    macdPrevHistogram?: number;

    // OHLC arrays (last 10 candles ideally)
    recentOpens?: number[];
    recentHighs?: number[];
    recentLows?: number[];
    recentCloses?: number[];

    // Volume
    volume?: number;
    avgVolume10d?: number;

    // Fundamentals
    pe?: number;
    yearHigh?: number;
    yearLow?: number;
    beta?: number;
    revenueGrowth?: number;
    netMargin?: number;

    // Analyst
    analystBuy?: number;
    analystHold?: number;
    analystSell?: number;

    // Earnings Surprise (last quarter)
    earningsSurprise?: number;

    // Insider Activity (last 6 months)
    insiderNet?: number;

    // Relative Strength vs market
    spyChangePercent?: number;
}

export interface PredictionResult {
    trend: 'UP' | 'DOWN' | 'Neutral';
    confidence: string;
    target: string;
    targetNextDay: string;
    days: number;
    period: string;
    reasoning: string;
    symbol: string;
    currentPrice: number;
    reasoningPoints: { label: string; value: string; signal: 'positive' | 'negative' | 'neutral' }[];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candle { o: number; h: number; l: number; c: number; }
type MarketRegime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'VOLATILE' | 'SIDEWAYS';
interface Signal { score: number; weight: number; label: string; value: string; signal: 'positive' | 'negative' | 'neutral'; }

// ─── ATR (Average True Range) ─────────────────────────────────────────────────
function calcATR(candles: Candle[]): number {
    if (candles.length < 2) return 0;
    let atrSum = 0;
    const n = Math.min(candles.length - 1, 14);
    for (let i = candles.length - n; i < candles.length; i++) {
        const prev = candles[i - 1];
        const cur = candles[i];
        const tr = Math.max(
            cur.h - cur.l,
            Math.abs(cur.h - prev.c),
            Math.abs(cur.l - prev.c)
        );
        atrSum += tr;
    }
    return atrSum / n;
}

// ─── Market Regime Detection ──────────────────────────────────────────────────
function detectRegime(q: StockQuote): MarketRegime {
    const { sma20, sma50, sma200, price, beta } = q;
    const highVol = (beta ?? 1) > 1.8;

    if (highVol) return 'VOLATILE';

    if (sma20 && sma50 && sma200) {
        if (sma20 > sma50 && sma50 > sma200 && price > sma20) return 'TRENDING_UP';
        if (sma20 < sma50 && sma50 < sma200 && price < sma20) return 'TRENDING_DOWN';
    }
    if (sma20 && sma50) {
        if (sma20 > sma50 * 1.01 && price > sma20) return 'TRENDING_UP';
        if (sma20 < sma50 * 0.99 && price < sma20) return 'TRENDING_DOWN';
    }
    return 'SIDEWAYS';
}

// ─── Candlestick Patterns ─────────────────────────────────────────────────────
function detectCandlestickPattern(candles: Candle[]): { name: string; signal: 'bullish' | 'bearish' | 'neutral'; strength: number } | null {
    if (candles.length < 2) return null;
    const c0 = candles[candles.length - 1];
    const c1 = candles[candles.length - 2];
    const c2 = candles.length >= 3 ? candles[candles.length - 3] : null;

    const body = Math.abs(c0.c - c0.o);
    const range = c0.h - c0.l;
    const upper = c0.h - Math.max(c0.c, c0.o);
    const lower = Math.min(c0.c, c0.o) - c0.l;
    const isGreen = c0.c > c0.o;
    const prevBody = Math.abs(c1.c - c1.o);
    const prevIsGreen = c1.c > c1.o;

    if (range === 0) return null;

    // Doji
    if (body / range < 0.08) return { name: 'Doji (ลังเล)', signal: 'neutral', strength: 0.3 };

    // Pin Bar / Hammer
    if (isGreen && lower > body * 2.5 && upper < body * 0.4 && body / range > 0.2)
        return { name: 'Hammer (กลับตัวขาขึ้น)', signal: 'bullish', strength: 0.8 };

    // Inverted Hammer (bullish)
    if (isGreen && upper > body * 2.5 && lower < body * 0.4)
        return { name: 'Inverted Hammer (สัญญาณกลับตัวบวก)', signal: 'bullish', strength: 0.5 };

    // Shooting Star
    if (!isGreen && upper > body * 2.5 && lower < body * 0.4 && body / range > 0.2)
        return { name: 'Shooting Star (กลับตัวขาลง)', signal: 'bearish', strength: 0.8 };

    // Bullish Engulfing
    if (isGreen && !prevIsGreen && c0.o <= c1.c && c0.c >= c1.o && body > prevBody * 1.1)
        return { name: 'Bullish Engulfing (แรงซื้อกลืนกิน)', signal: 'bullish', strength: 1.0 };

    // Bearish Engulfing
    if (!isGreen && prevIsGreen && c0.o >= c1.c && c0.c <= c1.o && body > prevBody * 1.1)
        return { name: 'Bearish Engulfing (แรงขายกลืนกิน)', signal: 'bearish', strength: 1.0 };

    // Morning Star
    if (c2 && isGreen && !prevIsGreen) {
        const c2Body = Math.abs(c2.c - c2.o);
        const prevBodySmall = Math.abs(c1.c - c1.o);
        if (!(c2.c > c2.o) && c2Body > prevBodySmall * 2.5 && c0.c > (c2.o + c2.c) / 2)
            return { name: 'Morning Star (รุ่งอรุณขาขึ้น)', signal: 'bullish', strength: 1.2 };
    }

    // Evening Star
    if (c2 && !isGreen && prevIsGreen && c2.c > c2.o) {
        const c2Body = Math.abs(c2.c - c2.o);
        const prevBodySmall = Math.abs(c1.c - c1.o);
        if (c2Body > prevBodySmall * 2.5 && c0.c < (c2.o + c2.c) / 2)
            return { name: 'Evening Star (พระอาทิตย์ตกขาลง)', signal: 'bearish', strength: 1.2 };
    }

    // Marubozu
    if (upper < body * 0.04 && lower < body * 0.04 && body / range > 0.9)
        return isGreen
            ? { name: 'Bullish Marubozu (แรงซื้อแข็งแกร่ง)', signal: 'bullish', strength: 0.9 }
            : { name: 'Bearish Marubozu (แรงขายแข็งแกร่ง)', signal: 'bearish', strength: 0.9 };

    // Three White Soldiers
    if (c2 && isGreen && prevIsGreen && c2.c > c2.o &&
        c0.c > c1.c && c1.c > c2.c && body > 0 && prevBody > 0 && Math.abs(c2.c - c2.o) > 0)
        return { name: 'Three White Soldiers (ขาขึ้นต่อเนื่อง)', signal: 'bullish', strength: 1.3 };

    // Three Black Crows
    if (c2 && !isGreen && !prevIsGreen && !(c2.c > c2.o) &&
        c0.c < c1.c && c1.c < c2.c)
        return { name: 'Three Black Crows (ขาลงต่อเนื่อง)', signal: 'bearish', strength: 1.3 };

    return null;
}

// ─── RSI Divergence (price new high but RSI lower = bearish div) ───────────────
function detectRSIDivergence(closes: number[], rsi: number): 'bullish' | 'bearish' | null {
    if (closes.length < 5) return null;
    const recent = closes.slice(-3);
    const earlier = closes.slice(-6, -3);
    const recentHigh = Math.max(...recent);
    const earlierHigh = Math.max(...earlier);
    const recentLow = Math.min(...recent);
    const earlierLow = Math.min(...earlier);

    // Bearish divergence: price higher high but RSI < 65 (weakening)
    if (recentHigh > earlierHigh * 1.005 && rsi < 65) return 'bearish';
    // Bullish divergence: price lower low but RSI > 35 (strengthening)
    if (recentLow < earlierLow * 0.995 && rsi > 35) return 'bullish';
    return null;
}

// ─── Trend Strength via Slope ─────────────────────────────────────────────────
function calcSlope(values: number[]): number {
    if (values.length < 2) return 0;
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
    return den === 0 ? 0 : num / den;
}

// ─── Close Location Value — where close sits in day's range ───────────────────
function calcCLV(high: number, low: number, close: number): number {
    if (high === low) return 0;
    return ((close - low) - (high - close)) / (high - low); // -1 to +1
}

// ─── Count consecutive up or down days ────────────────────────────────────────
function countConsecutiveDays(closes: number[]): { direction: 'up' | 'down' | 'flat'; count: number } {
    if (closes.length < 2) return { direction: 'flat', count: 0 };
    let count = 0;
    let lastDir: 'up' | 'down' | 'flat' = 'flat';
    for (let i = closes.length - 1; i > 0; i--) {
        const dir = closes[i] > closes[i - 1] ? 'up' : closes[i] < closes[i - 1] ? 'down' : 'flat';
        if (dir === 'flat') break;
        if (lastDir === 'flat') lastDir = dir;
        if (dir !== lastDir) break;
        count++;
    }
    return { direction: lastDir, count };
}

// ─── Narrow Range Detection (NR4/NR7) — Volatility Squeeze ───────────────────
function detectNarrowRange(highs: number[], lows: number[]): { isNR4: boolean; isNR7: boolean } {
    if (highs.length < 7) return { isNR4: false, isNR7: false };
    const ranges = highs.map((h, i) => h - lows[i]);
    const currentRange = ranges[ranges.length - 1];
    return {
        isNR4: currentRange <= Math.min(...ranges.slice(-4)),
        isNR7: currentRange <= Math.min(...ranges.slice(-7)),
    };
}

// ─── Short-term Stochastic %K ─────────────────────────────────────────────────
function calcStochastic(closes: number[], highs: number[], lows: number[], period: number = 5): number | null {
    if (closes.length < period) return null;
    const h = highs.slice(-period);
    const l = lows.slice(-period);
    const highest = Math.max(...h);
    const lowest = Math.min(...l);
    if (highest === lowest) return 50;
    return ((closes[closes.length - 1] - lowest) / (highest - lowest)) * 100;
}

// ─── Swing Structure (HH/HL or LH/LL) ────────────────────────────────────────
function detectSwingStructure(highs: number[], lows: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (highs.length < 6) return 'neutral';
    const h = highs.slice(-6);
    const l = lows.slice(-6);
    const sH = [Math.max(h[0], h[1]), Math.max(h[2], h[3]), Math.max(h[4], h[5])];
    const sL = [Math.min(l[0], l[1]), Math.min(l[2], l[3]), Math.min(l[4], l[5])];
    const hh = sH[2] > sH[1] && sH[1] > sH[0];
    const hl = sL[2] > sL[1] && sL[1] > sL[0];
    const lh = sH[2] < sH[1] && sH[1] < sH[0];
    const ll = sL[2] < sL[1] && sL[1] < sL[0];
    if (hh && hl) return 'bullish';
    if (lh && ll) return 'bearish';
    return 'neutral';
}

// ─── Main Prediction Function ── Professional Edition ─────────────────────────
export const getPrediction = (q: StockQuote): PredictionResult => {
    const signals: Signal[] = [];
    const regime = detectRegime(q);

    // Regime-based weight multipliers (momentum signals matter more in trending markets)
    const trendMul = regime === 'TRENDING_UP' || regime === 'TRENDING_DOWN' ? 1.3 : 1.0;
    const momentumMul = regime === 'VOLATILE' ? 0.7 : 1.0;
    const fundamentalMul = regime === 'SIDEWAYS' ? 1.2 : 0.9;

    // ─── 1. TREND — Triple SMA System (HIGH WEIGHT) ──────────────────────────
    if (q.sma20 && q.sma50) {
        // Price vs SMA20
        const pctAbove20 = ((q.price - q.sma20) / q.sma20) * 100;
        if (q.price > q.sma20) {
            signals.push({ score: Math.min(pctAbove20 / 2, 1.5), weight: 2.5 * trendMul, label: 'ราคา vs SMA20', value: `ราคา $${q.price.toFixed(2)} เหนือ SMA20 $${q.sma20.toFixed(2)} (+${pctAbove20.toFixed(1)}%) → ระยะสั้นบวก`, signal: 'positive' });
        } else {
            signals.push({ score: Math.max(pctAbove20 / 2, -1.5), weight: 2.5 * trendMul, label: 'ราคา vs SMA20', value: `ราคา $${q.price.toFixed(2)} ต่ำกว่า SMA20 $${q.sma20.toFixed(2)} (${pctAbove20.toFixed(1)}%) → ระยะสั้นลบ`, signal: 'negative' });
        }

        // Golden/Death Cross
        const crossStrength = ((q.sma20 - q.sma50) / q.sma50) * 100;
        if (q.sma20 > q.sma50) {
            signals.push({ score: Math.min(1 + crossStrength / 3, 2), weight: 2.0 * trendMul, label: 'SMA20/50 Cross', value: `Golden Cross: SMA20 $${q.sma20.toFixed(2)} > SMA50 $${q.sma50.toFixed(2)} (+${crossStrength.toFixed(2)}%) → Momentum ขาขึ้น`, signal: 'positive' });
        } else {
            signals.push({ score: Math.max(-1 - Math.abs(crossStrength) / 3, -2), weight: 2.0 * trendMul, label: 'SMA20/50 Cross', value: `Death Cross: SMA20 $${q.sma20.toFixed(2)} < SMA50 $${q.sma50.toFixed(2)} (${crossStrength.toFixed(2)}%) → Momentum ขาลง`, signal: 'negative' });
        }
    }

    if (q.sma200) {
        const pctVs200 = ((q.price - q.sma200) / q.sma200) * 100;
        if (q.price > q.sma200) {
            signals.push({ score: 1, weight: 1.8 * trendMul, label: 'SMA200 (Long-Term)', value: `ราคาเหนือ SMA200 $${q.sma200.toFixed(2)} (+${pctVs200.toFixed(1)}%) → Bullish Territory ระยะยาว`, signal: 'positive' });
        } else {
            signals.push({ score: -1, weight: 1.8 * trendMul, label: 'SMA200 (Long-Term)', value: `ราคาต่ำกว่า SMA200 $${q.sma200.toFixed(2)} (${pctVs200.toFixed(1)}%) → Bearish Territory ระยะยาว`, signal: 'negative' });
        }
    }

    // Triple SMA Alignment (strong confluence)
    if (q.sma20 && q.sma50 && q.sma200) {
        if (q.sma20 > q.sma50 && q.sma50 > q.sma200 && q.price > q.sma20) {
            signals.push({ score: 1, weight: 2.5 * trendMul, label: 'Trend Alignment ✓', value: `ราคา > SMA20 > SMA50 > SMA200 → Perfect Bull Alignment ยืนยันทุกกรอบเวลา`, signal: 'positive' });
        } else if (q.sma20 < q.sma50 && q.sma50 < q.sma200 && q.price < q.sma20) {
            signals.push({ score: -1, weight: 2.5 * trendMul, label: 'Trend Alignment ✗', value: `ราคา < SMA20 < SMA50 < SMA200 → Perfect Bear Alignment ยืนยันทุกกรอบเวลา`, signal: 'negative' });
        }
    }

    // SMA Slope (trend acceleration)
    if (q.recentCloses && q.recentCloses.length >= 5) {
        const slope = calcSlope(q.recentCloses.slice(-5));
        const slopePct = (slope / q.price) * 100;
        if (Math.abs(slopePct) > 0.1) {
            const sc = Math.min(Math.abs(slopePct) / 0.3, 1);
            signals.push({ score: slopePct > 0 ? sc : -sc, weight: 1.5 * trendMul, label: 'Price Slope (5d)', value: `ทิศทางราคา 5 วัน: ${slopePct > 0 ? '+' : ''}${slopePct.toFixed(2)}%/วัน → เทรนด์${slopePct > 0 ? 'เร่งขึ้น' : 'เร่งลง'}`, signal: slopePct > 0 ? 'positive' : 'negative' });
        }
    }

    // ─── 2. MACD (HIGH WEIGHT — momentum) ─────────────────────────────────────
    if (q.macdHistogram !== undefined) {
        const growing = q.macdPrevHistogram !== undefined && q.macdHistogram > q.macdPrevHistogram;
        const histAbs = Math.abs(q.macdHistogram);

        if (q.macdHistogram > 0 && growing) {
            signals.push({ score: 1, weight: 3.0 * momentumMul, label: 'MACD', value: `MACD Histogram +${q.macdHistogram.toFixed(4)} และกำลังเพิ่ม → Bullish Momentum เร่งตัว สัญญาณซื้อแข็งแกร่ง`, signal: 'positive' });
        } else if (q.macdHistogram > 0 && !growing) {
            signals.push({ score: 0.5, weight: 2.0 * momentumMul, label: 'MACD', value: `MACD Histogram +${q.macdHistogram.toFixed(4)} แต่ชะลอตัว → Momentum บวกแต่เริ่มอ่อนแรง`, signal: 'positive' });
        } else if (q.macdHistogram < 0 && !growing) {
            signals.push({ score: -1, weight: 3.0 * momentumMul, label: 'MACD', value: `MACD Histogram ${q.macdHistogram.toFixed(4)} และกำลังลด → Bearish Momentum เร่งตัว สัญญาณขายแข็งแกร่ง`, signal: 'negative' });
        } else {
            signals.push({ score: -0.5, weight: 2.0 * momentumMul, label: 'MACD', value: `MACD Histogram ${q.macdHistogram.toFixed(4)} แต่ชะลอตัว → Momentum ลบแต่เริ่มอ่อนแรง`, signal: 'negative' });
        }
    }

    // ─── 3. RSI + Divergence ──────────────────────────────────────────────────
    if (q.rsi !== undefined) {
        let rsiScore = 0;
        let rsiLabel = '';
        let rsiSig: 'positive' | 'negative' | 'neutral' = 'neutral';

        if (q.rsi >= 50 && q.rsi <= 70) {
            rsiScore = (q.rsi - 50) / 20; // 0→1
            rsiLabel = `RSI ${q.rsi.toFixed(1)} → Bullish Zone (50–70) โมเมนตัมดี`;
            rsiSig = 'positive';
        } else if (q.rsi > 70 && q.rsi <= 80) {
            rsiScore = 0.3; // Overbought but momentum
            rsiLabel = `RSI ${q.rsi.toFixed(1)} → Overbought แต่ Momentum แข็งแกร่ง อาจวิ่งต่อ`;
            rsiSig = 'positive';
        } else if (q.rsi > 80) {
            rsiScore = -0.5; // Extreme overbought = risk
            rsiLabel = `RSI ${q.rsi.toFixed(1)} > 80 → Extreme Overbought ความเสี่ยง Reversal สูง`;
            rsiSig = 'negative';
        } else if (q.rsi <= 30 && q.rsi > 20) {
            rsiScore = 0.5; // Oversold bounce
            rsiLabel = `RSI ${q.rsi.toFixed(1)} → Oversold Zone โอกาสรีบาวด์`;
            rsiSig = 'positive';
        } else if (q.rsi <= 20) {
            rsiScore = 1.0; // Extreme oversold
            rsiLabel = `RSI ${q.rsi.toFixed(1)} < 20 → Extreme Oversold โอกาสรีบาวด์แรง`;
            rsiSig = 'positive';
        } else {
            rsiScore = (q.rsi - 40) / 10 * 0.5; // -0.5 to 0.5 in neutral zone
            rsiLabel = `RSI ${q.rsi.toFixed(1)} → Neutral Zone (30–50) รอสัญญาณชัด`;
            rsiSig = 'neutral';
        }

        signals.push({ score: rsiScore, weight: 2.5 * momentumMul, label: 'RSI', value: rsiLabel, signal: rsiSig });

        // RSI Divergence
        if (q.recentCloses && q.recentCloses.length >= 5) {
            const div = detectRSIDivergence(q.recentCloses, q.rsi);
            if (div === 'bearish') {
                signals.push({ score: -0.8, weight: 2.0, label: 'RSI Divergence ⚠', value: `Bearish Divergence: ราคาทำ High ใหม่ แต่ RSI อ่อนแรงลง → สัญญาณเตือนกลับตัว`, signal: 'negative' });
            } else if (div === 'bullish') {
                signals.push({ score: 0.8, weight: 2.0, label: 'RSI Divergence ✓', value: `Bullish Divergence: ราคาทำ Low ใหม่ แต่ RSI ฟื้นตัว → สัญญาณกลับตัวขาขึ้น`, signal: 'positive' });
            }
        }
    }

    // ─── 4. Bollinger Bands (Squeeze & Breakout) ──────────────────────────────
    if (q.lowerBB && q.upperBB) {
        const bbWidth = (q.upperBB - q.lowerBB) / q.price;
        const bbPos = (q.price - q.lowerBB) / (q.upperBB - q.lowerBB);
        const tight = bbWidth < 0.06; // Bollinger Squeeze

        if (q.price >= q.upperBB) {
            signals.push({ score: tight ? 1.0 : -0.5, weight: 1.8, label: 'Bollinger Bands', value: `${tight ? '🔥 BB Squeeze Breakout ขึ้น!' : 'ราคาแตะขอบบน BB'} $${q.upperBB.toFixed(2)} → ${tight ? 'แรงซื้อ Breakout หลัง Squeeze' : 'Overbought ระยะสั้น'}`, signal: tight ? 'positive' : 'negative' });
        } else if (q.price <= q.lowerBB) {
            signals.push({ score: tight ? -1.0 : 0.5, weight: 1.8, label: 'Bollinger Bands', value: `${tight ? '💥 BB Squeeze Breakout ลง!' : 'ราคาแตะขอบล่าง BB'} $${q.lowerBB.toFixed(2)} → ${tight ? 'แรงขาย Breakout หลัง Squeeze' : 'Oversold รีบาวด์ได้'}`, signal: tight ? 'negative' : 'positive' });
        } else {
            const posLabel = bbPos > 0.7 ? 'ใกล้ขอบบน' : bbPos < 0.3 ? 'ใกล้ขอบล่าง' : 'กลาง Band';
            signals.push({ score: bbPos > 0.5 ? 0.3 : -0.3, weight: 1.0, label: 'Bollinger Bands', value: `ราคาอยู่${posLabel} BB (${(bbPos * 100).toFixed(0)}%) ช่วง $${q.lowerBB.toFixed(2)}–$${q.upperBB.toFixed(2)}${tight ? ' ⚡ Squeeze!' : ''}`, signal: bbPos > 0.6 ? 'positive' : bbPos < 0.4 ? 'negative' : 'neutral' });
        }
    }

    // ─── 5. Candlestick Patterns (HIGH WEIGHT — price action) ────────────────
    if (q.recentOpens && q.recentHighs && q.recentLows && q.recentCloses && q.recentCloses.length >= 2) {
        const candles: Candle[] = q.recentCloses.map((c, i) => ({ o: q.recentOpens![i], h: q.recentHighs![i], l: q.recentLows![i], c }));
        const pattern = detectCandlestickPattern(candles);
        if (pattern) {
            const w = 2.5;
            if (pattern.signal === 'bullish') {
                signals.push({ score: pattern.strength, weight: w, label: 'Candlestick Pattern', value: `✅ ${pattern.name} → Price Action สัญญาณซื้อ (Strength: ${(pattern.strength * 100).toFixed(0)}%)`, signal: 'positive' });
            } else if (pattern.signal === 'bearish') {
                signals.push({ score: -pattern.strength, weight: w, label: 'Candlestick Pattern', value: `🔴 ${pattern.name} → Price Action สัญญาณขาย (Strength: ${(pattern.strength * 100).toFixed(0)}%)`, signal: 'negative' });
            } else {
                signals.push({ score: 0, weight: w * 0.5, label: 'Candlestick Pattern', value: `⚪ ${pattern.name} → ตลาดลังเล รอสัญญาณยืนยัน`, signal: 'neutral' });
            }
        } else {
            signals.push({ score: 0, weight: 0.5, label: 'Candlestick Pattern', value: 'ไม่พบรูปแบบเทียนพิเศษ → Price Action ปกติ', signal: 'neutral' });
        }
    }

    // ─── 6. Volume Analysis (Smart Money) ────────────────────────────────────
    if (q.volume && q.avgVolume10d && q.avgVolume10d > 0) {
        const vr = q.volume / q.avgVolume10d;
        const up = q.changePercent > 0;

        if (vr > 2.0 && up) {
            signals.push({ score: 1, weight: 3.0, label: 'Volume (Smart Money)', value: `🔥 Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาขึ้น → Institutional Buying แท้จริง`, signal: 'positive' });
        } else if (vr > 2.0 && !up) {
            signals.push({ score: -1, weight: 3.0, label: 'Volume (Smart Money)', value: `💥 Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาลง → Institutional Selling แท้จริง`, signal: 'negative' });
        } else if (vr > 1.5 && up) {
            signals.push({ score: 0.7, weight: 2.0, label: 'Volume', value: `Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาขึ้น → แรงซื้อยืนยันเทรนด์`, signal: 'positive' });
        } else if (vr > 1.5 && !up) {
            signals.push({ score: -0.7, weight: 2.0, label: 'Volume', value: `Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาลง → แรงขายยืนยันเทรนด์`, signal: 'negative' });
        } else if (vr < 0.6) {
            signals.push({ score: 0, weight: 1.0, label: 'Volume', value: `Volume ต่ำ (${vr.toFixed(1)}x) → การเคลื่อนไหวอาจไม่ sustained`, signal: 'neutral' });
        } else {
            signals.push({ score: 0, weight: 0.5, label: 'Volume', value: `Volume ปกติ (${vr.toFixed(1)}x) → ไม่มีสัญญาณ Institutional พิเศษ`, signal: 'neutral' });
        }
    }

    // ─── 7. Relative Strength vs SPY ─────────────────────────────────────────
    if (q.spyChangePercent !== undefined) {
        const rs = q.changePercent - q.spyChangePercent;
        if (rs > 2) {
            signals.push({ score: 1, weight: 2.0, label: 'Relative Strength vs SPY', value: `แข็งแกร่งกว่า S&P500 มาก +${rs.toFixed(2)}% → Money Flow เข้าหุ้นนี้โดยเฉพาะ`, signal: 'positive' });
        } else if (rs > 0.8) {
            signals.push({ score: 0.5, weight: 1.5, label: 'Relative Strength vs SPY', value: `แข็งแกร่งกว่า S&P500 +${rs.toFixed(2)}% → Sector/Stock Rotation บวก`, signal: 'positive' });
        } else if (rs < -2) {
            signals.push({ score: -1, weight: 2.0, label: 'Relative Strength vs SPY', value: `อ่อนแอกว่า S&P500 มาก ${rs.toFixed(2)}% → Money Flow ออก Underperform`, signal: 'negative' });
        } else if (rs < -0.8) {
            signals.push({ score: -0.5, weight: 1.5, label: 'Relative Strength vs SPY', value: `อ่อนแอกว่า S&P500 ${rs.toFixed(2)}% → Sector Rotation ออก`, signal: 'negative' });
        } else {
            signals.push({ score: 0, weight: 0.5, label: 'Relative Strength vs SPY', value: `Relative Strength ${rs >= 0 ? '+' : ''}${rs.toFixed(2)}% vs SPY → เคลื่อนไหวใกล้เคียงตลาด`, signal: 'neutral' });
        }
    }

    // ─── 8. 52-Week Position ─────────────────────────────────────────────────
    if (q.yearHigh && q.yearLow) {
        const range52 = q.yearHigh - q.yearLow;
        const pos = range52 > 0 ? ((q.price - q.yearLow) / range52) * 100 : 50;
        const nearHigh = pos >= 85;
        const nearLow = pos <= 15;
        if (nearHigh) {
            signals.push({ score: -0.6, weight: 1.5, label: '52-Week Position', value: `ราคาอยู่ที่ Top ${pos.toFixed(0)}% ของ 52 สัปดาห์ → แนวต้านแข็ง แต่ Breakout ก็เป็นไปได้`, signal: 'negative' });
        } else if (nearLow) {
            signals.push({ score: 0.8, weight: 1.5, label: '52-Week Position', value: `ราคาอยู่ที่ Bottom ${pos.toFixed(0)}% ของ 52 สัปดาห์ → Upside Potential สูง แนวรับแข็ง`, signal: 'positive' });
        } else {
            signals.push({ score: pos > 60 ? 0.2 : pos < 40 ? -0.2 : 0, weight: 0.8, label: '52-Week Position', value: `ราคาที่ ${pos.toFixed(0)}% ของ 52 สัปดาห์ (H$${q.yearHigh.toFixed(0)} / L$${q.yearLow.toFixed(0)})`, signal: pos > 50 ? 'positive' : 'neutral' });
        }
    }

    // ─── 9. Analyst Consensus ─────────────────────────────────────────────────
    if (q.analystBuy !== undefined && q.analystHold !== undefined && q.analystSell !== undefined) {
        const total = q.analystBuy + q.analystHold + q.analystSell;
        if (total >= 3) {
            const buyPct = (q.analystBuy / total) * 100;
            const sellPct = (q.analystSell / total) * 100;
            if (buyPct >= 70) {
                signals.push({ score: 1, weight: 1.8 * fundamentalMul, label: 'Analyst Consensus', value: `Wall Street: Buy ${q.analystBuy}/${total} (${buyPct.toFixed(0)}%) → Consensus แข็งแกร่งมาก`, signal: 'positive' });
            } else if (buyPct >= 55) {
                signals.push({ score: 0.5, weight: 1.5 * fundamentalMul, label: 'Analyst Consensus', value: `Wall Street: Buy ${q.analystBuy} / Hold ${q.analystHold} / Sell ${q.analystSell} → Moderate Buy`, signal: 'positive' });
            } else if (sellPct >= 40) {
                signals.push({ score: -1, weight: 1.8 * fundamentalMul, label: 'Analyst Consensus', value: `Wall Street: ${sellPct.toFixed(0)}% Sell Rating → นักวิเคราะห์ไม่ชอบ`, signal: 'negative' });
            } else {
                signals.push({ score: 0, weight: 0.8, label: 'Analyst Consensus', value: `Buy ${q.analystBuy} / Hold ${q.analystHold} / Sell ${q.analystSell} → Mixed Consensus`, signal: 'neutral' });
            }
        }
    }

    // ─── 10. Earnings Surprise ────────────────────────────────────────────────
    if (q.earningsSurprise !== undefined) {
        if (q.earningsSurprise > 10) {
            signals.push({ score: 1, weight: 2.0 * fundamentalMul, label: 'Earnings Surprise', value: `กำไรเกินคาด +${q.earningsSurprise.toFixed(1)}% → Strong Beat Post-Earnings Momentum`, signal: 'positive' });
        } else if (q.earningsSurprise > 3) {
            signals.push({ score: 0.5, weight: 1.5 * fundamentalMul, label: 'Earnings Surprise', value: `กำไรเกินคาด +${q.earningsSurprise.toFixed(1)}% → Moderate Beat`, signal: 'positive' });
        } else if (q.earningsSurprise < -10) {
            signals.push({ score: -1, weight: 2.0 * fundamentalMul, label: 'Earnings Surprise', value: `กำไรต่ำกว่าคาด ${q.earningsSurprise.toFixed(1)}% → กดดันราคาหนัก`, signal: 'negative' });
        } else if (q.earningsSurprise < -3) {
            signals.push({ score: -0.5, weight: 1.5 * fundamentalMul, label: 'Earnings Surprise', value: `กำไรต่ำกว่าคาดเล็กน้อย ${q.earningsSurprise.toFixed(1)}% → กดดันระยะสั้น`, signal: 'negative' });
        } else {
            signals.push({ score: 0, weight: 0.5, label: 'Earnings Surprise', value: `กำไรใกล้เคียงคาด (${q.earningsSurprise.toFixed(1)}%) → ไม่มีผล Catalyst พิเศษ`, signal: 'neutral' });
        }
    }

    // ─── 11. Insider Activity ─────────────────────────────────────────────────
    if (q.insiderNet !== undefined) {
        if (q.insiderNet > 500000) {
            signals.push({ score: 1, weight: 1.5 * fundamentalMul, label: 'Insider Activity', value: `ผู้บริหารซื้อสุทธิ ${(q.insiderNet / 1e6).toFixed(2)}M หุ้น → Smart Money ซื้อหนัก`, signal: 'positive' });
        } else if (q.insiderNet > 100000) {
            signals.push({ score: 0.5, weight: 1.2 * fundamentalMul, label: 'Insider Activity', value: `ผู้บริหารซื้อสุทธิ ${(q.insiderNet / 1e6).toFixed(2)}M หุ้น → Insider เชื่อมั่น`, signal: 'positive' });
        } else if (q.insiderNet < -500000) {
            signals.push({ score: -0.8, weight: 1.5 * fundamentalMul, label: 'Insider Activity', value: `ผู้บริหารขายสุทธิ ${(Math.abs(q.insiderNet) / 1e6).toFixed(2)}M หุ้น → Insider ลดการถือหุ้น`, signal: 'negative' });
        } else {
            signals.push({ score: 0, weight: 0.5, label: 'Insider Activity', value: `Insider Activity สมดุล → ไม่มีสัญญาณ Smart Money พิเศษ`, signal: 'neutral' });
        }
    }

    // ─── 12. Fundamentals ─────────────────────────────────────────────────────
    if (q.pe && q.pe > 0) {
        if (q.pe > 60) signals.push({ score: -0.6, weight: 1.2 * fundamentalMul, label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → แพงมาก Valuation Risk สูง`, signal: 'negative' });
        else if (q.pe > 30) signals.push({ score: -0.2, weight: 0.8 * fundamentalMul, label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → ค่อนข้างแพง แต่ยังยอมรับได้สำหรับ Growth Stock`, signal: 'neutral' });
        else if (q.pe < 12) signals.push({ score: 0.7, weight: 1.2 * fundamentalMul, label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → Undervalued น่าสนใจสำหรับ Value Investor`, signal: 'positive' });
        else signals.push({ score: 0, weight: 0.8 * fundamentalMul, label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → Valuation สมเหตุสมผล`, signal: 'neutral' });
    }
    if (q.revenueGrowth !== undefined) {
        if (q.revenueGrowth > 20) signals.push({ score: 0.7, weight: 1.0 * fundamentalMul, label: 'Revenue Growth', value: `รายได้โต +${q.revenueGrowth.toFixed(1)}% YoY → Hyper Growth`, signal: 'positive' });
        else if (q.revenueGrowth > 8) signals.push({ score: 0.3, weight: 0.8 * fundamentalMul, label: 'Revenue Growth', value: `รายได้โต +${q.revenueGrowth.toFixed(1)}% YoY → Healthy Growth`, signal: 'positive' });
        else if (q.revenueGrowth < -5) signals.push({ score: -0.7, weight: 1.0 * fundamentalMul, label: 'Revenue Growth', value: `รายได้ลด ${q.revenueGrowth.toFixed(1)}% YoY → Fundamental อ่อนแอ`, signal: 'negative' });
        else signals.push({ score: 0, weight: 0.5, label: 'Revenue Growth', value: `รายได้โต +${q.revenueGrowth.toFixed(1)}% YoY → ปานกลาง`, signal: 'neutral' });
    }
    if (q.netMargin !== undefined) {
        if (q.netMargin > 25) signals.push({ score: 0.5, weight: 0.8 * fundamentalMul, label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → Excellent Profitability`, signal: 'positive' });
        else if (q.netMargin < 3) signals.push({ score: -0.3, weight: 0.8 * fundamentalMul, label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → Margin ต่ำมาก`, signal: 'negative' });
        else signals.push({ score: 0, weight: 0.5, label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → ระดับปกติ`, signal: 'neutral' });
    }

    // ─── 13. Beta / Risk Regime ───────────────────────────────────────────────
    if (q.beta !== undefined && q.beta > 0) {
        const betaLabel = q.beta > 2 ? 'High Risk — Speculative' : q.beta > 1.5 ? 'High Volatility' : q.beta < 0.6 ? 'Defensive — เสถียร' : 'ปกติ';
        signals.push({ score: q.beta > 1.5 ? -0.3 : q.beta < 0.6 ? 0.2 : 0, weight: 0.8, label: 'Beta (Volatility Risk)', value: `Beta ${q.beta.toFixed(2)} → ${betaLabel}`, signal: q.beta > 1.5 ? 'negative' : q.beta < 0.6 ? 'positive' : 'neutral' });
    }

    // ─── 14. Today's Price Action ─────────────────────────────────────────────
    if (Math.abs(q.changePercent) > 0.2) {
        const up = q.changePercent > 0;
        const strength = Math.min(Math.abs(q.changePercent) / 3, 1);
        signals.push({ score: up ? strength : -strength, weight: 1.5, label: 'Price Action วันนี้', value: `${up ? '+' : ''}${q.changePercent.toFixed(2)}% → ${up ? 'Momentum ขาขึ้น' : 'Pressure ขาลง'}`, signal: up ? 'positive' : 'negative' });
    } else {
        signals.push({ score: 0, weight: 0.5, label: 'Price Action วันนี้', value: `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}% → Consolidation ราคาทรง`, signal: 'neutral' });
    }

    // ─── 15. Mean Reversion (Consecutive Days) ───────────────────────────────
    if (q.recentCloses && q.recentCloses.length >= 4) {
        const streak = countConsecutiveDays(q.recentCloses);
        if (streak.count >= 4) {
            const rv = streak.direction === 'up' ? -0.8 : 0.8;
            signals.push({ score: rv, weight: 2.8, label: 'Mean Reversion', value: `${streak.count} วันติดต่อกัน${streak.direction === 'up' ? 'ขึ้น → สถิติชี้ว่าอาจพักตัว/ปรับฐาน' : 'ลง → สถิติชี้ว่าอาจรีบาวด์'}`, signal: rv > 0 ? 'positive' : 'negative' });
        } else if (streak.count >= 3) {
            const rv = streak.direction === 'up' ? -0.4 : 0.4;
            signals.push({ score: rv, weight: 2.0, label: 'Mean Reversion', value: `${streak.count} วันติดต่อกัน${streak.direction === 'up' ? 'ขึ้น → เริ่มมีโอกาสพักตัว' : 'ลง → เริ่มมีโอกาสรีบาวด์'}`, signal: rv > 0 ? 'positive' : 'negative' });
        }
    }

    // ─── 16. Close Location Value (CLV) + Accumulation/Distribution ──────────
    {
        const clv = calcCLV(q.high, q.low, q.price);
        if (Math.abs(clv) > 0.3) {
            const cs = clv > 0 ? Math.min(clv * 0.8, 1) : Math.max(clv * 0.8, -1);
            signals.push({ score: cs, weight: 2.0, label: 'Close Location', value: `ราคาปิด${clv > 0.6 ? 'ใกล้ High' : clv > 0 ? 'เหนือกึ่งกลาง' : clv > -0.6 ? 'ใต้กึ่งกลาง' : 'ใกล้ Low'} ของวัน (${(clv * 100).toFixed(0)}%) → ${clv > 0 ? 'แรงซื้อคุม' : 'แรงขายคุม'}`, signal: clv > 0.3 ? 'positive' : 'negative' });
        }
        if (q.recentHighs && q.recentLows && q.recentCloses && q.recentCloses.length >= 5) {
            let clvSum = 0;
            for (let j = q.recentCloses.length - 5; j < q.recentCloses.length; j++) {
                clvSum += calcCLV(q.recentHighs[j], q.recentLows[j], q.recentCloses[j]);
            }
            const avgCLV = clvSum / 5;
            if (Math.abs(avgCLV) > 0.3) {
                signals.push({ score: avgCLV > 0 ? 0.6 : -0.6, weight: 1.8, label: 'Accumulation/Distribution', value: `CLV เฉลี่ย 5 วัน: ${(avgCLV * 100).toFixed(0)}% → ${avgCLV > 0 ? 'สัญญาณ Accumulation (สะสม)' : 'สัญญาณ Distribution (ทยอยขาย)'}`, signal: avgCLV > 0 ? 'positive' : 'negative' });
            }
        }
    }

    // ─── 17. Gap Analysis ────────────────────────────────────────────────────
    if (q.recentCloses && q.recentOpens && q.recentCloses.length >= 2) {
        const prevClose = q.recentCloses[q.recentCloses.length - 2];
        const todayOpen = q.recentOpens[q.recentOpens.length - 1];
        const gapPct = ((todayOpen - prevClose) / prevClose) * 100;
        if (Math.abs(gapPct) > 0.5) {
            const gapFilled = gapPct > 0 ? q.low <= prevClose : q.high >= prevClose;
            if (gapPct > 1.0 && !gapFilled) {
                signals.push({ score: 0.8, weight: 2.2, label: 'Gap Analysis', value: `Gap Up +${gapPct.toFixed(2)}% ไม่ถูกปิด → แรงซื้อแข็ง Breakaway Gap`, signal: 'positive' });
            } else if (gapPct > 0.5 && gapFilled) {
                signals.push({ score: -0.3, weight: 1.5, label: 'Gap Analysis', value: `Gap Up +${gapPct.toFixed(2)}% ถูกปิดแล้ว → แรงซื้ออ่อนแอ`, signal: 'negative' });
            } else if (gapPct < -1.0 && !gapFilled) {
                signals.push({ score: -0.8, weight: 2.2, label: 'Gap Analysis', value: `Gap Down ${gapPct.toFixed(2)}% ไม่ถูกปิด → แรงขายแข็ง`, signal: 'negative' });
            } else if (gapPct < -0.5 && gapFilled) {
                signals.push({ score: 0.3, weight: 1.5, label: 'Gap Analysis', value: `Gap Down ${gapPct.toFixed(2)}% ถูกปิดแล้ว → แรงขายอ่อนแอ`, signal: 'positive' });
            }
        }
    }

    // ─── 18. Stochastic Oscillator (Short-term 5d) ───────────────────────────
    if (q.recentCloses && q.recentHighs && q.recentLows && q.recentCloses.length >= 5) {
        const stochK = calcStochastic(q.recentCloses, q.recentHighs, q.recentLows, 5);
        if (stochK !== null) {
            let ss = 0; let sl = ''; let sg: 'positive' | 'negative' | 'neutral' = 'neutral';
            if (stochK >= 80) { ss = -0.5; sl = `Stochastic %K ${stochK.toFixed(0)}% → Overbought ระยะสั้น อาจพักตัว`; sg = 'negative'; }
            else if (stochK <= 20) { ss = 0.5; sl = `Stochastic %K ${stochK.toFixed(0)}% → Oversold ระยะสั้น อาจรีบาวด์`; sg = 'positive'; }
            else if (stochK >= 50) { ss = 0.2; sl = `Stochastic %K ${stochK.toFixed(0)}% → Bullish Zone`; sg = 'positive'; }
            else { ss = -0.2; sl = `Stochastic %K ${stochK.toFixed(0)}% → Bearish Zone`; sg = 'negative'; }
            signals.push({ score: ss, weight: 2.0, label: 'Stochastic (5d)', value: sl, signal: sg });
        }
    }

    // ─── 19. Swing Structure (HH/HL or LH/LL) ──────────────────────────────
    if (q.recentHighs && q.recentLows && q.recentHighs.length >= 6) {
        const structure = detectSwingStructure(q.recentHighs, q.recentLows);
        if (structure !== 'neutral') {
            signals.push({ score: structure === 'bullish' ? 0.7 : -0.7, weight: 2.2, label: 'Swing Structure', value: structure === 'bullish' ? 'Higher Highs + Higher Lows → โครงสร้างขาขึ้นชัดเจน' : 'Lower Highs + Lower Lows → โครงสร้างขาลงชัดเจน', signal: structure === 'bullish' ? 'positive' : 'negative' });
        }
    }

    // ─── 20. Narrow Range (NR4/NR7) — Volatility Squeeze ────────────────────
    if (q.recentHighs && q.recentLows && q.recentHighs.length >= 7) {
        const nr = detectNarrowRange(q.recentHighs, q.recentLows);
        if (nr.isNR7) {
            signals.push({ score: 0, weight: 1.5, label: 'Volatility Squeeze (NR7)', value: '⚡ Narrow Range 7 วัน → พร้อม Breakout รุนแรง รอทิศทางจาก Indicator อื่น', signal: 'neutral' });
        } else if (nr.isNR4) {
            signals.push({ score: 0, weight: 1.0, label: 'Volatility Squeeze (NR4)', value: '⚡ Narrow Range 4 วัน → สะสมพลังงาน อาจเกิดการเคลื่อนไหวแรง', signal: 'neutral' });
        }
    }

    // ─── 21. Volume Spread Analysis (VSA) ────────────────────────────────────
    if (q.volume && q.avgVolume10d && q.avgVolume10d > 0 && q.recentHighs && q.recentLows && q.recentHighs.length >= 5) {
        const spreads = q.recentHighs.map((h, i) => h - q.recentLows![i]);
        const avgSpread = spreads.slice(0, -1).reduce((a, b) => a + b, 0) / (spreads.length - 1);
        const currentSpread = spreads[spreads.length - 1];
        const vr = q.volume / q.avgVolume10d;
        if (vr > 1.5 && currentSpread < avgSpread * 0.7) {
            signals.push({ score: q.changePercent > 0 ? -0.6 : 0.6, weight: 2.5, label: 'Volume Spread Analysis', value: `Volume สูง + Range แคบ → Churning ${q.changePercent > 0 ? '(แรงขายซ่อนตัว อาจกลับทิศ)' : '(แรงซื้อซ่อนตัว อาจกลับทิศ)'}`, signal: q.changePercent > 0 ? 'negative' : 'positive' });
        } else if (vr < 0.7 && currentSpread > avgSpread * 1.3) {
            signals.push({ score: q.changePercent > 0 ? -0.4 : 0.4, weight: 1.8, label: 'Volume Spread Analysis', value: `Volume ต่ำ + Range กว้าง → การเคลื่อนไหวไม่ยั่งยืน อาจกลับทิศ`, signal: q.changePercent > 0 ? 'negative' : 'positive' });
        }
    }

    // ─── WEIGHTED SCORE CALCULATION ───────────────────────────────────────────
    let weightedSum = 0;
    let totalWeight = 0;
    for (const s of signals) {
        weightedSum += s.score * s.weight;
        totalWeight += s.weight;
    }
    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Signal Confluence — count how many signals agree
    const bullSignals = signals.filter(s => s.signal === 'positive').length;
    const bearSignals = signals.filter(s => s.signal === 'negative').length;
    const totalSignals = signals.length;
    const confluence = Math.max(bullSignals, bearSignals) / totalSignals;

    // Adaptive threshold based on regime and confluence
    const baseThreshold = regime === 'VOLATILE' ? 0.25 : regime === 'SIDEWAYS' ? 0.20 : 0.15;
    const threshold = baseThreshold * (confluence < 0.5 ? 1.4 : 1.0);

    const trend = normalizedScore >= threshold ? 'UP' : normalizedScore <= -threshold ? 'DOWN' : 'Neutral';

    // ─── Confidence (multi-factor + signal agreement) ─────────────────────────
    const baseConf = Math.min(Math.abs(normalizedScore) / 0.5, 1); // 0–1, more sensitive
    const confFromConfluence = confluence; // 0–1
    // Signal agreement: what % of weighted signals agree with the trend direction
    let agreeWeight = 0, totalWt = 0;
    for (const s of signals) {
        totalWt += s.weight;
        if (trend === 'UP' && s.score > 0) agreeWeight += s.weight;
        else if (trend === 'DOWN' && s.score < 0) agreeWeight += s.weight;
        else if (trend === 'Neutral' && Math.abs(s.score) < 0.3) agreeWeight += s.weight;
    }
    const agreement = totalWt > 0 ? agreeWeight / totalWt : 0.5;
    const rawConf = (baseConf * 0.40 + confFromConfluence * 0.30 + agreement * 0.30);
    const confMin = trend === 'Neutral' ? 40 : 52;
    const confMax = trend === 'Neutral' ? 58 : 90;
    const confidence = confMin + rawConf * (confMax - confMin);

    // ─── ATR-Based Target Price ────────────────────────────────────────────────
    let atr = 0;
    if (q.recentHighs && q.recentLows && q.recentCloses && q.recentCloses.length >= 3) {
        const candles: Candle[] = q.recentCloses.map((c, i) => ({ o: q.recentOpens?.[i] ?? c, h: q.recentHighs![i], l: q.recentLows![i], c }));
        atr = calcATR(candles);
    }
    const betaMul = Math.max(0.6, Math.min(q.beta ?? 1.0, 2.5));
    const atrMul = atr > 0 ? (atr / q.price) : Math.min(Math.abs(q.changePercent) / 100, 0.03);

    // 3-day move = ATR * beta factor * confidence * direction multiplier
    const confFactor = 0.8 + rawConf * 0.6; // 0.8–1.4
    const moveBase = Math.min(atrMul * betaMul * confFactor * 2.5, 0.12);
    const scoreFactor = 1 + Math.min(Math.abs(normalizedScore) * 0.3, 0.5);

    let targetPrice = q.price;
    let targetNextDay = q.price;

    if (trend === 'UP') {
        const move3d = moveBase * scoreFactor;
        targetPrice = q.price * (1 + move3d);
        targetNextDay = q.price * (1 + move3d * 0.38);
    } else if (trend === 'DOWN') {
        const move3d = moveBase * scoreFactor * 0.9;
        targetPrice = q.price * (1 - move3d);
        targetNextDay = q.price * (1 - move3d * 0.38);
    } else {
        const nudge = atrMul * 0.3 * (q.changePercent > 0 ? 1 : -1);
        targetPrice = q.price * (1 + nudge);
        targetNextDay = q.price * (1 + nudge * 0.4);
    }

    // ─── Regime label for display ─────────────────────────────────────────────
    const regimeLabel = regime === 'TRENDING_UP' ? '📈 Trending Up' : regime === 'TRENDING_DOWN' ? '📉 Trending Down' : regime === 'VOLATILE' ? '⚡ Volatile' : '↔ Sideways';

    // ─── Forecast dates ────────────────────────────────────────────────────────
    const startDate = new Date();
    const endDate = new Date();
    let daysCount = 0;
    while (daysCount < 3) {
        endDate.setDate(endDate.getDate() + 1);
        if (endDate.getDay() !== 0 && endDate.getDay() !== 6) daysCount++;
    }
    const fmt = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    // ─── Top signal for reasoning ─────────────────────────────────────────────
    const topSignal = signals
        .filter(s => s.signal !== 'neutral')
        .sort((a, b) => Math.abs(b.score * b.weight) - Math.abs(a.score * a.weight))[0];
    const topDetail = topSignal?.label ?? (trend === 'UP' ? 'สัญญาณบวกหลายมิติ' : trend === 'DOWN' ? 'สัญญาณลบหลายมิติ' : 'รอยืนยันเทรนด์');

    const reasoning = trend === 'UP'
        ? `[${regimeLabel}] สัญญาณซื้อ: ${topDetail} — ${bullSignals}/${totalSignals} signals บวก — Confidence ${confidence.toFixed(1)}%`
        : trend === 'DOWN'
            ? `[${regimeLabel}] สัญญาณขาย: ${topDetail} — ${bearSignals}/${totalSignals} signals ลบ — Confidence ${confidence.toFixed(1)}%`
            : `[${regimeLabel}] Sideways: สัญญาณ Mixed — ${bullSignals} บวก vs ${bearSignals} ลบ — รอยืนยัน`;

    return {
        trend,
        confidence: confidence.toFixed(1),
        target: targetPrice.toFixed(2),
        targetNextDay: targetNextDay.toFixed(2),
        days: 3,
        period: `${fmt(startDate)} - ${fmt(endDate)}`,
        reasoning,
        symbol: q.symbol,
        currentPrice: q.price,
        reasoningPoints: signals.map(s => ({ label: s.label, value: s.value, signal: s.signal }))
    };
};
