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

    // MACD (computed in page.tsx via technicalindicators)
    macdHistogram?: number;       // positive = bullish momentum, negative = bearish
    macdPrevHistogram?: number;   // previous bar for divergence

    // OHLC arrays for candlestick pattern detection (last 5 candles)
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
    earningsSurprise?: number;    // % surprise (actual - estimate) / |estimate|

    // Insider Activity (last 6 months)
    insiderNet?: number;          // net shares bought (positive = buying, negative = selling)

    // Relative Strength vs market
    spyChangePercent?: number;    // SPY's % change today
}

export interface PredictionResult {
    trend: 'UP' | 'DOWN' | 'Neutral';
    confidence: string;
    target: string;
    days: number;
    period: string;
    reasoning: string;
    reasoningPoints: { label: string; value: string; signal: 'positive' | 'negative' | 'neutral' }[];
}

// ─── Candlestick Pattern Detection ────────────────────────────────────────────
interface Candle { o: number; h: number; l: number; c: number; }

function detectCandlestickPattern(candles: Candle[]): { name: string; signal: 'bullish' | 'bearish' | 'neutral' } | null {
    if (candles.length < 2) return null;
    const today = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const prev2 = candles.length >= 3 ? candles[candles.length - 3] : null;

    const body = Math.abs(today.c - today.o);
    const range = today.h - today.l;
    const upperShadow = today.h - Math.max(today.c, today.o);
    const lowerShadow = Math.min(today.c, today.o) - today.l;
    const isGreen = today.c > today.o;
    const prevBody = Math.abs(prev.c - prev.o);
    const prevIsGreen = prev.c > prev.o;

    if (range === 0) return null;

    // Doji — indecision
    if (body / range < 0.1) {
        return { name: 'Doji', signal: 'neutral' };
    }

    // Hammer (bullish reversal at bottom)
    if (isGreen && lowerShadow > body * 2 && upperShadow < body * 0.5) {
        return { name: 'Hammer (สัญญาณกลับตัวขาขึ้น)', signal: 'bullish' };
    }

    // Shooting Star (bearish reversal at top)
    if (!isGreen && upperShadow > body * 2 && lowerShadow < body * 0.5) {
        return { name: 'Shooting Star (สัญญาณกลับตัวขาลง)', signal: 'bearish' };
    }

    // Bullish Engulfing
    if (isGreen && !prevIsGreen && today.o <= prev.c && today.c >= prev.o && body > prevBody) {
        return { name: 'Bullish Engulfing (แรงซื้อกลืนกิน)', signal: 'bullish' };
    }

    // Bearish Engulfing
    if (!isGreen && prevIsGreen && today.o >= prev.c && today.c <= prev.o && body > prevBody) {
        return { name: 'Bearish Engulfing (แรงขายกลืนกิน)', signal: 'bearish' };
    }

    // Morning Star (3-candle bullish)
    if (prev2 && isGreen && !prevIsGreen && !(prev2.c > prev2.o) === false) {
        const prev2Body = Math.abs(prev2.c - prev2.o);
        const prevBody2 = Math.abs(prev.c - prev.o);
        if (prev2Body > prevBody2 * 3 && today.c > (prev2.o + prev2.c) / 2) {
            return { name: 'Morning Star (สัญญาณรุ่งอรุณ ขาขึ้น)', signal: 'bullish' };
        }
    }

    // Evening Star (3-candle bearish)
    if (prev2 && !isGreen && prevIsGreen && prev2.c > prev2.o) {
        const prev2Body = Math.abs(prev2.c - prev2.o);
        const prevBody2 = Math.abs(prev.c - prev.o);
        if (prev2Body > prevBody2 * 3 && today.c < (prev2.o + prev2.c) / 2) {
            return { name: 'Evening Star (สัญญาณพระอาทิตย์ตก ขาลง)', signal: 'bearish' };
        }
    }

    // Marubozu (strong candle, no shadows)
    if (upperShadow < body * 0.05 && lowerShadow < body * 0.05) {
        return isGreen
            ? { name: 'Bullish Marubozu (แรงซื้อแข็งแกร่ง)', signal: 'bullish' }
            : { name: 'Bearish Marubozu (แรงขายแข็งแกร่ง)', signal: 'bearish' };
    }

    return null;
}

// ─── Main Prediction Function ─────────────────────────────────────────────────
export const getPrediction = (q: StockQuote): PredictionResult => {
    let score = 0;
    let factorsCount = 0;
    const details: string[] = [];
    const reasoningPoints: PredictionResult['reasoningPoints'] = [];

    // ─── 1. TREND — SMA Short / Medium / Long ─────────────────────────────────
    if (q.sma20 && q.sma50) {
        factorsCount++;
        if (q.price > q.sma20) {
            score += 1;
            reasoningPoints.push({ label: 'ราคา vs SMA20', value: `$${q.price.toFixed(2)} > SMA20 $${q.sma20.toFixed(2)} → ระยะสั้นบวก`, signal: 'positive' });
        } else {
            score -= 1;
            reasoningPoints.push({ label: 'ราคา vs SMA20', value: `$${q.price.toFixed(2)} < SMA20 $${q.sma20.toFixed(2)} → ระยะสั้นอ่อนแอ`, signal: 'negative' });
        }
        if (q.sma20 > q.sma50) {
            score += 1.5; details.push('Golden Cross SMA20>SMA50');
            reasoningPoints.push({ label: 'SMA Crossover', value: `SMA20 $${q.sma20.toFixed(2)} > SMA50 $${q.sma50.toFixed(2)} → Golden Cross ระยะกลางบวก`, signal: 'positive' });
        } else {
            score -= 1.5; details.push('Death Cross SMA20<SMA50');
            reasoningPoints.push({ label: 'SMA Crossover', value: `SMA20 $${q.sma20.toFixed(2)} < SMA50 $${q.sma50.toFixed(2)} → Death Cross ระยะกลางลบ`, signal: 'negative' });
        }
    }
    if (q.sma200) {
        factorsCount++;
        if (q.price > q.sma200) {
            score += 1;
            reasoningPoints.push({ label: 'SMA200 (ระยะยาว)', value: `ราคาเหนือ SMA200 $${q.sma200.toFixed(2)} → Bullish Market ระยะยาว`, signal: 'positive' });
        } else {
            score -= 1;
            reasoningPoints.push({ label: 'SMA200 (ระยะยาว)', value: `ราคาต่ำกว่า SMA200 $${q.sma200.toFixed(2)} → Bearish Market ระยะยาว`, signal: 'negative' });
        }
    }

    // ─── TREND ALIGNMENT BONUS (SMA20 > SMA50 > SMA200 or reverse) ──────────
    if (q.sma20 && q.sma50 && q.sma200) {
        if (q.sma20 > q.sma50 && q.sma50 > q.sma200) {
            score += 1.5;
            details.push('Triple SMA alignment bullish');
            reasoningPoints.push({ label: 'Trend Alignment', value: `SMA20 > SMA50 > SMA200 → เทรนด์ขาขึ้นยืนยันทุกกรอบเวลา`, signal: 'positive' });
        } else if (q.sma20 < q.sma50 && q.sma50 < q.sma200) {
            score -= 1.5;
            details.push('Triple SMA alignment bearish');
            reasoningPoints.push({ label: 'Trend Alignment', value: `SMA20 < SMA50 < SMA200 → เทรนด์ขาลงยืนยันทุกกรอบเวลา`, signal: 'negative' });
        }
    }

    // ─── 2. MACD ──────────────────────────────────────────────────────────────
    if (q.macdHistogram !== undefined) {
        factorsCount++;
        const growing = q.macdPrevHistogram !== undefined && q.macdHistogram > q.macdPrevHistogram;
        if (q.macdHistogram > 0 && growing) {
            score += 2;
            details.push('MACD histogram ขาขึ้นและเร่งตัว');
            reasoningPoints.push({ label: 'MACD', value: `MACD Histogram +${q.macdHistogram.toFixed(3)} และเพิ่มขึ้น → โมเมนตัมขาขึ้นเร่งตัว สัญญาณซื้อแข็งแกร่ง`, signal: 'positive' });
        } else if (q.macdHistogram > 0) {
            score += 1;
            reasoningPoints.push({ label: 'MACD', value: `MACD Histogram +${q.macdHistogram.toFixed(3)} → โมเมนตัมบวก แต่เริ่มชะลอ`, signal: 'positive' });
        } else if (q.macdHistogram < 0 && !growing) {
            score -= 2;
            details.push('MACD histogram ขาลงและเร่งตัว');
            reasoningPoints.push({ label: 'MACD', value: `MACD Histogram ${q.macdHistogram.toFixed(3)} และลดลง → โมเมนตัมขาลงเร่งตัว สัญญาณขายแข็งแกร่ง`, signal: 'negative' });
        } else {
            score -= 1;
            reasoningPoints.push({ label: 'MACD', value: `MACD Histogram ${q.macdHistogram.toFixed(3)} → โมเมนตัมลบ แต่เริ่มชะลอ`, signal: 'negative' });
        }
    }

    // ─── 3. RSI + BOLLINGER ────────────────────────────────────────────────────
    if (q.rsi) {
        factorsCount++;
        if (q.rsi > 60) {
            score += 1;
            reasoningPoints.push({ label: 'RSI', value: `RSI ${q.rsi.toFixed(1)} → แรงซื้อครอบงำ (>60) โมเมนตัมบวก`, signal: 'positive' });
        } else if (q.rsi < 40) {
            score -= 1;
            reasoningPoints.push({ label: 'RSI', value: `RSI ${q.rsi.toFixed(1)} → แรงขายครอบงำ (<40) โมเมนตัมลบ`, signal: 'negative' });
        } else {
            reasoningPoints.push({ label: 'RSI', value: `RSI ${q.rsi.toFixed(1)} → โซน Neutral (40–60) ยังไม่มีสัญญาณชัด`, signal: 'neutral' });
        }
        // Short-term: overbought/oversold are weaker signals — momentum tends to persist
        if (q.rsi > 80) { score -= 0.5; reasoningPoints.push({ label: 'RSI Overbought', value: `RSI ${q.rsi.toFixed(1)} > 80 → Overbought สุดขีด แต่ Momentum อาจต่อ`, signal: 'negative' }); }
        if (q.rsi < 20) { score += 0.8; reasoningPoints.push({ label: 'RSI Oversold', value: `RSI ${q.rsi.toFixed(1)} < 20 → Oversold สุดขีด โอกาสรีบาวด์`, signal: 'positive' }); }
    }
    if (q.lowerBB && q.upperBB) {
        factorsCount++;
        if (q.price <= q.lowerBB) {
            score += 0.5;
            reasoningPoints.push({ label: 'Bollinger Bands', value: `ราคาแตะขอบล่าง BB $${q.lowerBB.toFixed(2)} → อาจรีบาวด์ แต่ Breakout ลงก็เป็นไปได้`, signal: 'positive' });
        } else if (q.price >= q.upperBB) {
            score -= 0.5;
            reasoningPoints.push({ label: 'Bollinger Bands', value: `ราคาแตะขอบบน BB $${q.upperBB.toFixed(2)} → อาจปรับฐาน แต่ Breakout ขึ้นก็เป็นไปได้`, signal: 'negative' });
        } else {
            const bbMid = (q.lowerBB + q.upperBB) / 2;
            const sig = q.price > bbMid ? 'positive' : 'negative';
            reasoningPoints.push({ label: 'Bollinger Bands', value: `ราคาอยู่${q.price > bbMid ? 'เหนือ' : 'ต่ำกว่า'}กลาง BB — ช่วง $${q.lowerBB.toFixed(2)}–$${q.upperBB.toFixed(2)}`, signal: sig });
        }
    }

    // ─── 4. CANDLESTICK PATTERNS ───────────────────────────────────────────────
    if (q.recentOpens && q.recentHighs && q.recentLows && q.recentCloses &&
        q.recentCloses.length >= 2) {
        factorsCount++;
        const candles: Candle[] = q.recentCloses.map((c, i) => ({
            o: q.recentOpens![i], h: q.recentHighs![i],
            l: q.recentLows![i], c
        }));
        const pattern = detectCandlestickPattern(candles);
        if (pattern) {
            if (pattern.signal === 'bullish') {
                score += 1.5;
                details.push(pattern.name);
                reasoningPoints.push({ label: 'Candlestick Pattern', value: `${pattern.name} → รูปแบบเทียนสัญญาณขาขึ้น`, signal: 'positive' });
            } else if (pattern.signal === 'bearish') {
                score -= 1.5;
                details.push(pattern.name);
                reasoningPoints.push({ label: 'Candlestick Pattern', value: `${pattern.name} → รูปแบบเทียนสัญญาณขาลง`, signal: 'negative' });
            } else {
                reasoningPoints.push({ label: 'Candlestick Pattern', value: `${pattern.name} → ตลาดลังเล รอสัญญาณยืนยัน`, signal: 'neutral' });
            }
        } else {
            reasoningPoints.push({ label: 'Candlestick Pattern', value: `ไม่พบรูปแบบเทียนพิเศษ → Price Action ปกติ`, signal: 'neutral' });
        }
    }

    // ─── 5. VOLUME ANALYSIS ────────────────────────────────────────────────────
    if (q.volume && q.avgVolume10d && q.avgVolume10d > 0) {
        factorsCount++;
        const vr = q.volume / q.avgVolume10d;
        const up = q.changePercent > 0;
        if (vr > 1.5 && up) {
            score += 1.5; details.push('Volume spike ยืนยันแรงซื้อ');
            reasoningPoints.push({ label: 'Volume', value: `Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาขึ้น → แรงซื้อแท้จริง ยืนยันเทรนด์`, signal: 'positive' });
        } else if (vr > 1.5 && !up) {
            score -= 1.5; details.push('Volume spike ยืนยันแรงขาย');
            reasoningPoints.push({ label: 'Volume', value: `Volume ${vr.toFixed(1)}x ค่าเฉลี่ย + ราคาลง → แรงขายแท้จริง`, signal: 'negative' });
        } else if (vr < 0.7) {
            reasoningPoints.push({ label: 'Volume', value: `Volume ต่ำ (${vr.toFixed(1)}x) → การเคลื่อนไหวอาจไม่ยั่งยืน`, signal: 'neutral' });
        } else {
            reasoningPoints.push({ label: 'Volume', value: `Volume ปกติ (${vr.toFixed(1)}x) → ไม่มีสัญญาณพิเศษ`, signal: 'neutral' });
        }
    }

    // ─── 6. EARNINGS SURPRISE ──────────────────────────────────────────────────
    if (q.earningsSurprise !== undefined) {
        factorsCount++;
        if (q.earningsSurprise > 5) {
            score += 1.5;
            details.push(`Earnings beat +${q.earningsSurprise.toFixed(1)}%`);
            reasoningPoints.push({ label: 'Earnings Surprise', value: `กำไรไตรมาสล่าสุดเกินคาด +${q.earningsSurprise.toFixed(1)}% → Momentum หลัง Earnings แข็งแกร่ง`, signal: 'positive' });
        } else if (q.earningsSurprise > 0) {
            score += 0.5;
            reasoningPoints.push({ label: 'Earnings Surprise', value: `กำไรเกินคาดเล็กน้อย +${q.earningsSurprise.toFixed(1)}% → บวกเล็กน้อยต่อ Sentiment`, signal: 'positive' });
        } else if (q.earningsSurprise < -5) {
            score -= 1.5;
            details.push(`Earnings miss ${q.earningsSurprise.toFixed(1)}%`);
            reasoningPoints.push({ label: 'Earnings Surprise', value: `กำไรต่ำกว่าคาด ${q.earningsSurprise.toFixed(1)}% → กดดันราคาระยะสั้น`, signal: 'negative' });
        } else {
            reasoningPoints.push({ label: 'Earnings Surprise', value: `กำไรใกล้เคียงคาด (${q.earningsSurprise.toFixed(1)}%) → ไม่มีผลพิเศษต่อราคา`, signal: 'neutral' });
        }
    }

    // ─── 7. INSIDER ACTIVITY ──────────────────────────────────────────────────
    if (q.insiderNet !== undefined) {
        factorsCount++;
        if (q.insiderNet > 100000) {
            score += 1;
            reasoningPoints.push({ label: 'Insider Activity', value: `ผู้บริหารซื้อสุทธิ ${(q.insiderNet / 1e6).toFixed(2)}M หุ้น (6 เดือน) → Smart Money เชื่อมั่นในบริษัท`, signal: 'positive' });
        } else if (q.insiderNet < -100000) {
            score -= 0.8;
            reasoningPoints.push({ label: 'Insider Activity', value: `ผู้บริหารขายสุทธิ ${(Math.abs(q.insiderNet) / 1e6).toFixed(2)}M หุ้น (6 เดือน) → อาจมองราคาแพงเกิน`, signal: 'negative' });
        } else {
            reasoningPoints.push({ label: 'Insider Activity', value: `การซื้อขายของ Insider สมดุล → ไม่มีสัญญาณพิเศษ`, signal: 'neutral' });
        }
    }

    // ─── 8. RELATIVE STRENGTH vs SPY ─────────────────────────────────────────
    if (q.spyChangePercent !== undefined) {
        factorsCount++;
        const rs = q.changePercent - q.spyChangePercent;
        if (rs > 1.5) {
            score += 1;
            reasoningPoints.push({ label: 'Relative Strength vs SPY', value: `แข็งแกร่งกว่า S&P500 +${rs.toFixed(2)}% → เงินไหลเข้าหุ้นนี้โดยเฉพาะ`, signal: 'positive' });
        } else if (rs < -1.5) {
            score -= 1;
            reasoningPoints.push({ label: 'Relative Strength vs SPY', value: `อ่อนแอกว่า S&P500 ${rs.toFixed(2)}% → เงินไหลออก Underperform`, signal: 'negative' });
        } else {
            reasoningPoints.push({ label: 'Relative Strength vs SPY', value: `Relative Strength ${rs >= 0 ? '+' : ''}${rs.toFixed(2)}% vs SPY → เคลื่อนไหวใกล้เคียงตลาด`, signal: 'neutral' });
        }
    }

    // ─── 9. 52-WEEK POSITION ──────────────────────────────────────────────────
    if (q.yearHigh && q.yearLow) {
        const range = q.yearHigh - q.yearLow;
        const position = range > 0 ? ((q.price - q.yearLow) / range) * 100 : 50;
        if (position >= 85) {
            score -= 0.8;
            reasoningPoints.push({ label: '52-Week Position', value: `ราคาอยู่ที่ ${position.toFixed(0)}% ของช่วง 52 สัปดาห์ → ใกล้ High แนวต้านแข็ง`, signal: 'negative' });
        } else if (position <= 15) {
            score += 0.8;
            reasoningPoints.push({ label: '52-Week Position', value: `ราคาอยู่ที่ ${position.toFixed(0)}% ของช่วง 52 สัปดาห์ → ใกล้ Low Upside สูง`, signal: 'positive' });
        } else {
            reasoningPoints.push({ label: '52-Week Position', value: `ราคาที่ ${position.toFixed(0)}% ของช่วง 52 สัปดาห์ (High $${q.yearHigh.toFixed(0)} / Low $${q.yearLow.toFixed(0)})`, signal: position > 50 ? 'positive' : 'neutral' });
        }
    }

    // ─── 10. ANALYST CONSENSUS ────────────────────────────────────────────────
    if (q.analystBuy !== undefined && q.analystHold !== undefined && q.analystSell !== undefined) {
        const total = q.analystBuy + q.analystHold + q.analystSell;
        if (total > 0) {
            factorsCount++;
            const buyPct = (q.analystBuy / total) * 100;
            const sellPct = (q.analystSell / total) * 100;
            if (buyPct >= 65) {
                score += 1.5; details.push(`Wall Street consensus: Buy ${q.analystBuy}/${total}`);
                reasoningPoints.push({ label: 'Analyst Consensus', value: `Buy ${q.analystBuy} / Hold ${q.analystHold} / Sell ${q.analystSell} → ${buyPct.toFixed(0)}% นักวิเคราะห์แนะนำซื้อ`, signal: 'positive' });
            } else if (sellPct >= 40) {
                score -= 1.5;
                reasoningPoints.push({ label: 'Analyst Consensus', value: `Buy ${q.analystBuy} / Hold ${q.analystHold} / Sell ${q.analystSell} → ${sellPct.toFixed(0)}% แนะนำขาย`, signal: 'negative' });
            } else {
                reasoningPoints.push({ label: 'Analyst Consensus', value: `Buy ${q.analystBuy} / Hold ${q.analystHold} / Sell ${q.analystSell} → Mixed consensus`, signal: 'neutral' });
            }
        }
    }

    // ─── 11. BETA ─────────────────────────────────────────────────────────────
    if (q.beta !== undefined && q.beta > 0) {
        if (q.beta > 1.5) {
            reasoningPoints.push({ label: 'Beta (ความเสี่ยง)', value: `Beta ${q.beta.toFixed(2)} → High Volatility ${((q.beta - 1) * 100).toFixed(0)}% ผันผวนกว่าตลาด`, signal: 'negative' });
        } else if (q.beta < 0.8) {
            reasoningPoints.push({ label: 'Beta (ความเสี่ยง)', value: `Beta ${q.beta.toFixed(2)} → Defensive Stock เสถียร`, signal: 'positive' });
        } else {
            reasoningPoints.push({ label: 'Beta (ความเสี่ยง)', value: `Beta ${q.beta.toFixed(2)} → ผันผวนใกล้เคียงตลาด`, signal: 'neutral' });
        }
    }

    // ─── 12. FUNDAMENTALS ──────────────────────────────────────────────────────
    if (q.pe && q.pe > 0) {
        if (q.pe > 50) { score -= 0.5; reasoningPoints.push({ label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → แพงเกินมูลค่าจริง`, signal: 'negative' }); }
        else if (q.pe < 15) { score += 0.5; reasoningPoints.push({ label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → Undervalued น่าสนใจ`, signal: 'positive' }); }
        else { reasoningPoints.push({ label: 'P/E Ratio', value: `P/E ${q.pe.toFixed(1)} → สมเหตุสมผล`, signal: 'neutral' }); }
    }
    if (q.revenueGrowth !== undefined) {
        if (q.revenueGrowth > 15) { score += 0.8; reasoningPoints.push({ label: 'Revenue Growth', value: `รายได้โต +${q.revenueGrowth.toFixed(1)}% YoY → Fundamental แข็งแกร่ง`, signal: 'positive' }); }
        else if (q.revenueGrowth < 0) { score -= 0.8; reasoningPoints.push({ label: 'Revenue Growth', value: `รายได้ลด ${q.revenueGrowth.toFixed(1)}% YoY → Fundamental อ่อนแอ`, signal: 'negative' }); }
        else { reasoningPoints.push({ label: 'Revenue Growth', value: `รายได้โต +${q.revenueGrowth.toFixed(1)}% YoY → ปานกลาง`, signal: 'neutral' }); }
    }
    if (q.netMargin !== undefined) {
        if (q.netMargin > 20) { score += 0.5; reasoningPoints.push({ label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → ความสามารถทำกำไรสูงมาก`, signal: 'positive' }); }
        else if (q.netMargin < 5) { score -= 0.3; reasoningPoints.push({ label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → Margin ต่ำ`, signal: 'negative' }); }
        else { reasoningPoints.push({ label: 'Net Margin', value: `กำไรสุทธิ ${q.netMargin.toFixed(1)}% → ระดับปกติ`, signal: 'neutral' }); }
    }

    // ─── 13. PRICE ACTION ─────────────────────────────────────────────────────
    if (Math.abs(q.changePercent) > 0.3) {
        const up = q.changePercent > 0;
        score += up ? 0.5 : -0.5;
        reasoningPoints.push({ label: 'Price Action วันนี้', value: `${up ? '+' : ''}${q.changePercent.toFixed(2)}% → ${up ? 'แรงซื้อเข้ามา' : 'แรงขายออก'}`, signal: up ? 'positive' : 'negative' });
    } else {
        reasoningPoints.push({ label: 'Price Action วันนี้', value: `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}% → ตลาดลังเล`, signal: 'neutral' });
    }

    // ─── FINAL SCORING ────────────────────────────────────────────────────────
    // Lower threshold = fewer Neutral predictions = higher accuracy
    // (stocks rarely stay flat over 3 days, so Neutral is almost always wrong)
    const threshold = factorsCount >= 5 ? 1.5 : factorsCount >= 3 ? 1.0 : 0.8;
    const trend = score >= threshold ? 'UP' : score <= -threshold ? 'DOWN' : 'Neutral';

    const absoluteScore = Math.abs(score);
    const maxScore = 16; // theoretical max with alignment bonus
    const confidenceRange = trend === 'Neutral' ? [44, 56] : [56, 92];
    const confidence = confidenceRange[0] + (Math.min(absoluteScore / maxScore, 1) * (confidenceRange[1] - confidenceRange[0]));

    // Dynamic Target — Beta-adjusted
    const betaMul = q.beta ? Math.max(0.5, Math.min(q.beta, 2.5)) : 1.0;
    const baseVol = Math.min(Math.abs(q.changePercent) / 100, 0.04);
    let targetPrice = q.price;

    if (trend === 'UP') {
        const move = Math.min((0.015 + baseVol * betaMul + (score > 5 ? 0.015 : 0)), 0.10);
        targetPrice = q.price * (1 + move);
    } else if (trend === 'DOWN') {
        const move = Math.min((0.012 + baseVol * betaMul + (Math.abs(score) > 5 ? 0.01 : 0)), 0.10);
        targetPrice = q.price * (1 - move);
    } else {
        targetPrice = q.price * (1 + (q.changePercent > 0 ? 0.003 : -0.003));
    }

    // Forecast dates (skip weekends)
    const startDate = new Date();
    const endDate = new Date();
    let days = 0;
    while (days < 3) {
        endDate.setDate(endDate.getDate() + 1);
        if (endDate.getDay() !== 0 && endDate.getDay() !== 6) days++;
    }
    const fmt = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    const topDetail = details[0] || (trend === 'UP' ? 'แนวโน้มหลายมิติบวก' : trend === 'DOWN' ? 'ตัวบ่งชี้ส่วนใหญ่ลบ' : 'รอยืนยันเทรนด์');
    const reasoning = trend === 'UP'
        ? `สัญญาณซื้อ: ${topDetail} — Confidence ${confidence.toFixed(1)}%`
        : trend === 'DOWN'
            ? `สัญญาณขาย: ${topDetail} — Confidence ${confidence.toFixed(1)}%`
            : `Sideways: ${topDetail} — รอสัญญาณยืนยัน`;

    return {
        trend,
        confidence: confidence.toFixed(1),
        target: targetPrice.toFixed(2),
        days: 3,
        period: `${fmt(startDate)} - ${fmt(endDate)}`,
        reasoning,
        reasoningPoints
    };
};
