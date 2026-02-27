'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  Autocomplete,
  LinearProgress,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Chart as ChartIcon,
  SearchNormal1,
  TrendUp,
  TrendDown,
  LampCharge,
  Refresh2,
  Activity,
  Ranking,
  Cpu,
  InfoCircle,
  Star,
  Flash,
  Command
} from 'iconsax-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const StockChart = dynamic(() => import('./components/StockChart'), {
  ssr: false,
  loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
    <CircularProgress size={20} />
  </Box>
});

import { RSI, SMA, BollingerBands, MACD } from 'technicalindicators';
import { StockQuote, getPrediction } from './utils/prediction';
import AIPredictionCard from './components/AIPredictionCard';

interface StockData {
  c: number; // current
  d: number; // change
  dp: number; // percentage
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // time
}



function HomeContent() {
  const { data: session } = useSession();
  const [symbol, setSymbol] = useState('');
  const searchParams = useSearchParams();
  const querySymbol = searchParams.get('symbol');

  const [options, setOptions] = useState<any[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [userSymbols, setUserSymbols] = useState<string[]>([]);
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [cachedPicks, setCachedPicks] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [historyError, setHistoryError] = useState(false);

  const fetchStock = async (ticker: string, silent: boolean = false) => {
    if (!ticker) return;
    if (!silent) {
      setLoading(true);
      setError('');
    }
    const sym = ticker.toUpperCase();

    if (typeof window !== 'undefined' && !silent) localStorage.setItem('lastSymbol', sym);

    try {
      // Parallelize Bundle and Candles
      const [bundleRes, candleRes] = await Promise.all([
        fetch(`/api/stock-bundle?symbol=${sym}`),
        fetch(`/api/candles?symbol=${sym}&days=250`)
      ]);

      const bundle = await bundleRes.json();
      const candleData = await candleRes.json();

      if (bundle.error) throw new Error(bundle.error);

      const { quote: data, metrics: metricData, profile: profileData, recommendations: recData, spy: spyData, earnings: epsData, news: newsData } = bundle;

      // 1. Validate Core Data
      if (!data || (data.c === 0 && data.pc === 0)) {
        throw new Error('Symbol not found or API limit reached');
      }

      // 2. Process Technical Indicators (from candles)
      let rsiValue, smaValue, sma50Value, sma200Value, lowerBB, upperBB, volumeValue, avgVolume10d;
      let macdHistogram: number | undefined, macdPrevHistogram: number | undefined;
      let recentOpens: number[] | undefined, recentHighs: number[] | undefined, recentLows: number[] | undefined, recentCloses: number[] | undefined;

      if (candleData.s === 'ok' && candleData.c) {
        if (!silent) setHistoryError(false);
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
      } else {
        if (!silent) setHistoryError(true);
      }

      // 3. Process Context & Metrics
      if (!silent) {
        setMetrics(metricData?.metric);
        setNews(newsData?.slice(0, 5) || []);
      }

      const latestRec = Array.isArray(recData) ? recData[0] : null;
      let earningsSurprise: number | undefined;
      if (epsData?.[0]?.estimate) {
        earningsSurprise = ((epsData[0].actual - epsData[0].estimate) / Math.abs(epsData[0].estimate)) * 100;
      }

      // 4. Construct Final Quote
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

      if (!silent) setQuote(newQuote);

      // 5. Prediction & Save
      const pred = getPrediction(newQuote);
      const newPick = { ...newQuote, ...pred };

      if (!silent) {
        setTopPicks(prev => {
          const filtered = prev.filter(p => p.symbol !== sym);
          return [newPick, ...filtered].sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));
        });
      }

      if (session) {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newPick, targetPrice: newPick.targetNextDay })
        });
      }

    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Failed to analyze stock');
        // If symbol not found or limit reached, fallback to NVDA
        if (sym !== 'NVDA') {
          setTimeout(() => fetchStock('NVDA'), 1500);
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const syncAllStocks = async () => {
    if (userSymbols.length === 0) return;
    setScanning(true);
    setScanProgress({ current: 0, total: userSymbols.length });

    for (let i = 0; i < userSymbols.length; i++) {
      const s = userSymbols[i];
      setScanProgress({ current: i + 1, total: userSymbols.length });
      try {
        await fetchStock(s, true);
        // Small delay to avoid API rate limits
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        console.error(`Failed to sync ${s}`, e);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('lastGlobalSync', new Date().toISOString());
    }
    setScanning(false);
    fetchWatchlistCache();
  };

  const fetchWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserSymbols(data.map((i: any) => i.symbol));
      }
    } catch (e) { console.error(e); } finally { setWatchlistLoading(false); }
  };

  const fetchWatchlistCache = async () => {
    try {
      const res = await fetch('/api/watchlist/cache');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedPicks(data.map((i: any) => ({
          symbol: i.symbol,
          price: i.price,
          trend: i.predictionTrend,
          confidence: i.predictionConfidence?.toFixed(1),
          target: i.predictionTarget
        })));
      }
    } catch (e) { }
  };

  useEffect(() => {
    setMounted(true);
    fetchWatchlist();
    fetchWatchlistCache();

    const initial = querySymbol || (typeof window !== 'undefined' ? localStorage.getItem('lastSymbol') || 'NVDA' : 'NVDA');
    setSymbol(initial);
    fetchStock(initial);
  }, [querySymbol]);

  const toggleFavorite = async (s: string) => {
    const isFav = userSymbols.includes(s);
    try {
      if (isFav) {
        await fetch(`/api/watchlist?symbol=${s}`, { method: 'DELETE' });
        setUserSymbols(prev => prev.filter(i => i !== s));
      } else {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: s })
        });
        setUserSymbols(prev => [...prev, s]);
      }
    } catch (e) { }
  };

  const searchSymbols = async (q: string) => {
    if (!q) { setOptions([]); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out duplicate symbols
        const uniqueOptions = data.reduce((acc: any[], current: any) => {
          const x = acc.find(item => item.symbol === current.symbol);
          if (!x) return acc.concat([current]);
          else return acc;
        }, []);
        setOptions(uniqueOptions);
      }
    } catch (e) { }
  };

  const prediction = useMemo(() => {
    if (!quote) return null;
    return getPrediction(quote);
  }, [quote]);

  if (!mounted) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Hidden H1 for SEO */}
      <Typography component="h1" sx={{ display: 'none' }}>
        TradingChill - เครื่องมือวิเคราะห์หุ้นเชิงปริมาณ ด้วยตัวชี้วัดทางเทคนิค ไม่ใช่คำแนะนำการลงทุน
      </Typography>
      {/* Watchlist Quick Links & Sync */}
      {session && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              รายการโปรดของคุณ
            </Typography>
            {userSymbols.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={syncAllStocks}
                  disabled={scanning}
                  startIcon={scanning ? <CircularProgress size={14} /> : <Refresh2 size="14" variant='Bold' color="#38bdf8" />}
                  sx={{
                    borderRadius: 10,
                    fontSize: '0.65rem',
                    py: 0.2,
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    '&:hover': { borderColor: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.05)' }
                  }}
                >
                  {scanning ? `Syncing ${scanProgress.current}/${scanProgress.total}` : 'Sync ทั้งหมด'}
                </Button>
                {(typeof window !== 'undefined' && localStorage.getItem('lastGlobalSync')) && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    อัปเดตล่าสุด: {new Date(localStorage.getItem('lastGlobalSync')!).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>

          {scanning && (
            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(scanProgress.current / scanProgress.total) * 100}
                sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
              />
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
            {watchlistLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" width={80} height={32} sx={{ borderRadius: 2 }} />)
            ) : userSymbols.length > 0 ? (
              userSymbols.map((s) => (
                <Button
                  key={s}
                  variant={symbol === s ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => { setSymbol(s); fetchStock(s); }}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: symbol === s ? '#0ea5e9' : 'transparent',
                    borderColor: symbol === s ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                    color: symbol === s ? 'white' : 'text.secondary',
                    '&:hover': { bgcolor: symbol === s ? '#0284c7' : 'rgba(14,165,233,0.05)', borderColor: '#0ea5e9' }
                  }}
                >
                  {s}
                </Button>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">ยังไม่มีรายการโปรด</Typography>
            )}
          </Stack>
        </Box>
      )}

      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 5, md: 8 }, px: { xs: 2.5, md: 0 } }}>
        <Box sx={{ width: '100%', maxWidth: 700 }}>
          <Stack spacing={2}>
            <Paper elevation={0} sx={{
              p: { xs: '12px 16px', md: '6px 6px 6px 20px' },
              borderRadius: { xs: 4, md: 10 },
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
              '&:focus-within': { borderColor: '#38bdf8', boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)' }
            }}>
              <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
                <SearchNormal1 size="24" color="#38bdf8" />
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={options}
                  getOptionLabel={(o) => typeof o === 'string' ? o : o.symbol}
                  onInputChange={(e, v) => {
                    const upper = v.toUpperCase();
                    setSymbol(upper);
                    searchSymbols(upper);
                  }}
                  onChange={(e, v: any) => {
                    if (v) {
                      const s = (typeof v === 'string' ? v : v.symbol).toUpperCase();
                      setSymbol(s);
                      fetchStock(s);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="ค้นหารหัสหุ้น (e.g. TSLA, NVDA)"
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        sx: {
                          ml: 2,
                          color: 'white',
                          fontSize: { xs: '1.05rem', md: '1.1rem' },
                          '& input': { textTransform: 'uppercase' }
                        }
                      }}
                    />
                  )}
                  renderOption={(props, o: any) => {
                    const { key, ...rest } = props;
                    const uniqueKey = key || `${o.symbol}-${o.description}`;
                    return (
                      <li key={uniqueKey} {...rest}>
                        <Typography sx={{ fontWeight: 800 }}>{o.symbol}</Typography>
                        <Typography sx={{ ml: 1, opacity: 0.6 }}>{o.description}</Typography>
                      </li>
                    );
                  }}
                  sx={{
                    flex: 1,
                    mr: { md: 2 },
                    '& .MuiAutocomplete-inputRoot': { pr: '0 !important' }
                  }}
                />
              </Stack>
              {/* Desktop Button - Integrated */}
              <Button
                variant="contained"
                onClick={() => fetchStock(symbol)}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  borderRadius: 10,
                  px: 4, height: 48,
                  bgcolor: '#0ea5e9',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}
              >
                Analyze Now
              </Button>
            </Paper>

            {/* Mobile Button - Separated */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => fetchStock(symbol)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                borderRadius: 4,
                height: 56,
                bgcolor: '#0ea5e9',
                fontSize: '1.1rem',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(14, 165, 233, 0.25)',
                textTransform: 'none'
              }}
            >
              Analyze Now
            </Button>
          </Stack>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress color="primary" />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>ประมวลผลอัลกอริทึมหลายแง่มุม...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button onClick={() => fetchStock(symbol)} sx={{ mt: 2 }}>Retry</Button>
        </Box>
      ) : quote && (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
            {/* Left Column: Chart & Profile */}
            <Box sx={{ order: { xs: 2, md: 1 } }}>
              <div className="glass-card">
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{quote.symbol}</Typography>
                      <Typography variant="body1" color="text.secondary">{quote.name}</Typography>
                      <IconButton size="small" onClick={() => toggleFavorite(quote.symbol)}>
                        <Star size="24" color={userSymbols.includes(quote.symbol) ? '#fbbf24' : 'rgba(255,255,255,0.2)'} variant={userSymbols.includes(quote.symbol) ? 'Bold' : 'Outline'} />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" className="font-mono" sx={{ fontWeight: 800 }}>${quote.price.toLocaleString()}</Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Typography sx={{ color: quote.change >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Divider sx={{ my: 3, opacity: 0.05 }} />
                <StockChart symbol={quote.symbol} trend={prediction?.trend || ''} />

                {/* Fundamentals & Stats */}
                <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
                  {[
                    { label: 'Yesterday (Close)', value: `$${quote.previousClose.toLocaleString()}` },
                    { label: 'Today (Open)', value: `$${quote.open.toLocaleString()}` },
                    { label: 'Statistical Est.', value: `$${parseFloat(prediction?.target || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                    { label: '52W High', value: `$${(quote.yearHigh || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: '52W Low', value: `$${(quote.yearLow || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: 'Volume', value: (quote.volume || 0).toLocaleString() },
                  ].map((item, i) => (
                    <Box key={i} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 800, fontSize: '0.65rem' }}>{item.label}</Typography>
                      <Typography variant="body2" className="font-mono" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </div>

              {/* Market Context Section */}
              <Box sx={{ mt: 4 }}>
                <Card sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8' }}>MARKET CONTEXT</Typography>
                    <Tooltip title="ข้อมูลสภาวะแวดล้อมเพื่อช่วยตัดสินใจว่าหุ้นตัวนี้คุ้มค่าที่จะลงทุนในช่วงเวลานี้หรือไม่">
                      <Box component="span" sx={{ display: 'flex' }}><InfoCircle size="14" color="#38bdf8" variant="Bulk" /></Box>
                    </Tooltip>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>เทียบกับตลาด (S&P 500)</Typography>
                        <Tooltip title="ดูว่าหุ้นตัวนี้วิ่งแรงชนะตลาด (แข็งแกร่ง) หรือวิ่งตามตลาดปกติ">
                          <Box component="span" sx={{ display: 'flex' }}><InfoCircle size="12" color="#94a3b8" /></Box>
                        </Tooltip>
                      </Stack>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {quote.spyChangePercent !== undefined ? (
                          Math.abs(quote.changePercent - quote.spyChangePercent) > 1
                            ? (quote.changePercent - quote.spyChangePercent) > 0
                              ? '🚀 แข็งแกร่งกว่าตลาด'
                              : '📉 อ่อนแอกว่าตลาด'
                            : '⚖️ วิ่งไปตามทิศทางตลาด'
                        ) : 'ไม่มีข้อมูลตลาด'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.2 }}>
                        {quote.spyChangePercent !== undefined && (
                          (quote.changePercent - quote.spyChangePercent) > 1
                            ? 'หุ้นตัวนี้มีความต้องการซื้อสูงกว่าค่าเฉลี่ย'
                            : (quote.changePercent - quote.spyChangePercent) < -1
                              ? 'หุ้นตัวนี้ถูกขายมากกว่าค่าเฉลี่ยตลาด'
                              : 'ราคายังเคลื่อนไหวตามปกติเหมือนหุ้นตัวอื่น'
                        )}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.1 }} />

                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>กำไรของบริษัท (Earnings)</Typography>
                        <Tooltip title="ผลกำไรล่าสุดดีกว่าหรือแย่กว่าที่นักวิเคราะห์ส่วนใหญ่คาดการณ์ไว้">
                          <Box component="span" sx={{ display: 'flex' }}><InfoCircle size="12" color="#94a3b8" /></Box>
                        </Tooltip>
                      </Stack>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: (quote.earningsSurprise || 0) > 0 ? '#4ade80' : '#f87171' }}>
                        {quote.earningsSurprise ? (
                          quote.earningsSurprise > 0
                            ? `💎 กำไรดีกว่าคาด +${quote.earningsSurprise.toFixed(1)}%`
                            : `⚠️ กำไรแย่กว่าคาด ${quote.earningsSurprise.toFixed(1)}%`
                        ) : 'รอประกาศผลกำไร'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.2 }}>
                        {quote.earningsSurprise ? (
                          quote.earningsSurprise > 0
                            ? 'บริษัทพื้นฐานดีเยี่ยม ทำเงินได้เกินคาด'
                            : 'ระวัง: บริษัททำกำไรได้ไม่ตามเป้า'
                        ) : 'ยังไม่มีข้อมูลช่วงผลประกอบการล่าสุด'}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Box>

              {/* Company News */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Recent Alpha Intel</Typography>
                <Stack spacing={2}>
                  {news.map((item) => (
                    <Card key={item.id} sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.4)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        {item.image && <Box component="img" src={item.image} sx={{ width: { xs: '100%', sm: 100 }, height: 60, objectFit: 'cover', borderRadius: 2 }} />}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>{item.headline}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {item.summary}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* Right Column: Prediction & Reasoning */}
            <Box sx={{ order: { xs: 1, md: 2 } }}>
              <Stack spacing={3}>
                <AIPredictionCard prediction={prediction} />
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>}>
      <HomeContent />
    </Suspense>
  );
}
