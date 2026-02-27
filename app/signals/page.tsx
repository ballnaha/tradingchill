'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    Container,
    Box,
    Typography,
    Card,
    Stack,
    Chip,
    Button,
    IconButton,
    CircularProgress,
    Divider,
    Breadcrumbs,
    Tooltip,
    LinearProgress,
    Paper,
} from '@mui/material';
import {
    Activity,
    TrendUp,
    TrendDown,
    Refresh2,
    ArrowRight2,
    Star1,
    Chart,
    Flash,
    SearchNormal1,
    InfoCircle,
    Timer1,
} from 'iconsax-react';
import Link from 'next/link';

interface WatchlistItem {
    symbol: string;
    name: string | null;
}

interface StockSignal {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    trend: 'UP' | 'DOWN' | 'Neutral';
    confidence: string;
    target: string;
    targetNextDay: string;
    reasoning: string;
    rsi?: number;
    sma20?: number;
    sma50?: number;
    macdHistogram?: number;
    reasoningPoints?: { label: string; value: string; signal: 'positive' | 'negative' | 'neutral' }[];
    loading?: boolean;
}

const SignalCard = ({ signal, onRefresh }: { signal: StockSignal; onRefresh: (sym: string) => void }) => {
    const isUp = signal.trend === 'UP';
    const isDown = signal.trend === 'DOWN';
    const trendColor = isUp ? '#4ade80' : isDown ? '#f87171' : '#94a3b8';
    const trendBg = isUp ? 'rgba(34, 197, 94, 0.08)' : isDown ? 'rgba(239, 68, 68, 0.08)' : 'rgba(148, 163, 184, 0.08)';

    const positiveCount = signal.reasoningPoints?.filter(p => p.signal === 'positive').length || 0;
    const negativeCount = signal.reasoningPoints?.filter(p => p.signal === 'negative').length || 0;
    const totalPoints = signal.reasoningPoints?.length || 1;
    const bullPercent = (positiveCount / totalPoints) * 100;

    return (
        <Card sx={{
            p: 0,
            borderRadius: 2,
            bgcolor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isUp ? 'rgba(34, 197, 94, 0.15)' : isDown ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)'}`,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px ${isUp ? 'rgba(34, 197, 94, 0.12)' : isDown ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0,0,0,0.2)'}`,
                borderColor: isUp ? 'rgba(34, 197, 94, 0.35)' : isDown ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255,255,255,0.1)',
            },
            opacity: signal.loading ? 0.6 : 1,
        }}>
            {signal.loading && (
                <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: '#0ea5e9' } }} />
            )}

            {/* Header */}
            <Box sx={{ p: 2.5, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            width: 44, height: 44, borderRadius: 2,
                            background: trendBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${trendColor}22`,
                        }}>
                            {isUp ? <TrendUp size="22" color={trendColor} variant="Bold" /> : isDown ? <TrendDown size="22" color={trendColor} variant="Bold" /> : <Activity size="22" color={trendColor} />}
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.2 }}>
                                {signal.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {signal.name || signal.symbol}
                            </Typography>
                        </Box>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                            ${signal.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: signal.change >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                            {signal.change >= 0 ? '+' : ''}{signal.changePercent?.toFixed(2)}%
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Divider sx={{ opacity: 0.05 }} />

            {/* Signal Detail */}
            <Box sx={{ p: 2.5, pt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            สัญญาณ
                        </Typography>
                        <Chip
                            label={isUp ? 'BULLISH' : isDown ? 'BEARISH' : 'NEUTRAL'}
                            size="small"
                            sx={{
                                bgcolor: trendBg,
                                color: trendColor,
                                fontWeight: 900, fontSize: '0.6rem', height: 22,
                            }}
                        />
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            ความมั่นใจ
                        </Typography>
                        <Typography variant="subtitle2" className="font-mono" sx={{ fontWeight: 800 }}>
                            {signal.confidence}%
                        </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Target (1D)
                        </Typography>
                        <Typography variant="subtitle2" className="font-mono" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                            ${parseFloat(signal.targetNextDay)?.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* Bullish / Bearish Meter */}
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700, fontSize: '0.65rem' }}>
                            Bull {positiveCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700, fontSize: '0.65rem' }}>
                            Bear {negativeCount}
                        </Typography>
                    </Stack>
                    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.2)', overflow: 'hidden' }}>
                        <Box sx={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${bullPercent}%`,
                            bgcolor: '#4ade80',
                            borderRadius: 3,
                            transition: 'width 0.5s ease',
                        }} />
                    </Box>
                </Box>

                {/* Key Indicators */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                    <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.015)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>RSI</Typography>
                        <Typography variant="body2" className="font-mono" sx={{
                            fontWeight: 800, fontSize: '0.85rem',
                            color: (signal.rsi && signal.rsi > 70) ? '#f87171' : (signal.rsi && signal.rsi < 30) ? '#4ade80' : 'white'
                        }}>
                            {signal.rsi?.toFixed(1) || '-'}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.015)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>SMA20</Typography>
                        <Typography variant="body2" className="font-mono" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                            {signal.sma20 ? `$${signal.sma20.toFixed(0)}` : '-'}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.015)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>MACD</Typography>
                        <Typography variant="body2" className="font-mono" sx={{
                            fontWeight: 800, fontSize: '0.85rem',
                            color: signal.macdHistogram !== undefined ? (signal.macdHistogram > 0 ? '#4ade80' : '#f87171') : 'white'
                        }}>
                            {signal.macdHistogram?.toFixed(2) || '-'}
                        </Typography>
                    </Box>
                </Box>

                {/* Reasoning */}
                <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    bgcolor: 'rgba(14, 165, 233, 0.03)',
                    p: 1.5, borderRadius: 2, fontSize: '0.72rem', lineHeight: 1.5,
                    border: '1px solid rgba(14, 165, 233, 0.06)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {signal.reasoning}
                </Typography>
            </Box>

            {/* Footer Actions */}
            <Box sx={{
                p: 1.5, px: 2.5,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <Tooltip title="รีเฟรชข้อมูล">
                    <IconButton size="small" onClick={() => onRefresh(signal.symbol)} sx={{ color: 'text.secondary', '&:hover': { color: '#0ea5e9' } }}>
                        <Refresh2 size="18" variant="Outline" color="#0ea5e9" />
                    </IconButton>
                </Tooltip>
                <Link href={`/?symbol=${signal.symbol}`} style={{ textDecoration: 'none' }}>
                    <Button
                        variant="text"
                        endIcon={<ArrowRight2 size="16" variant="Bold" color="#0ea5e9" />}
                        sx={{
                            color: '#0ea5e9', fontWeight: 700, textTransform: 'none', fontSize: '0.8rem',
                            '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.08)' }
                        }}
                    >
                        ดูการวิเคราะห์เต็ม
                    </Button>
                </Link>
            </Box>
        </Card>
    );
};

export default function SignalsPage() {
    const { data: session, status } = useSession();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [signals, setSignals] = useState<Record<string, StockSignal>>({});
    const [loading, setLoading] = useState(true);
    const [scanningAll, setScanningAll] = useState(false);
    const [scannedCount, setScannedCount] = useState(0);

    // Fetch watchlist
    useEffect(() => {
        if (status !== 'authenticated') return;
        fetchWatchlist();
    }, [status]);

    const fetchWatchlist = async () => {
        try {
            const res = await fetch('/api/signals');
            const data = await res.json();
            if (Array.isArray(data)) {
                setWatchlist(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const analyzeOne = useCallback(async (symbol: string) => {
        setSignals(prev => ({
            ...prev,
            [symbol]: { ...(prev[symbol] || {} as StockSignal), symbol, loading: true }
        }));
        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });
            const data = await res.json();
            if (!data.error) {
                setSignals(prev => ({
                    ...prev,
                    [symbol]: { ...data, loading: false }
                }));
            }
        } catch (err) {
            console.error(`Failed to analyze ${symbol}:`, err);
            setSignals(prev => {
                const copy = { ...prev };
                if (copy[symbol]) copy[symbol].loading = false;
                return copy;
            });
        }
    }, []);

    const handleScanAll = async () => {
        setScanningAll(true);
        setScannedCount(0);
        for (let i = 0; i < watchlist.length; i++) {
            await analyzeOne(watchlist[i].symbol);
            setScannedCount(i + 1);
            // Rate limit: 1.2s between each to protect API
            if (i < watchlist.length - 1) {
                await new Promise(r => setTimeout(r, 1200));
            }
        }
        setScanningAll(false);
    };

    if (status === 'loading' || loading) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (status !== 'authenticated') {
        return (
            <Container sx={{ py: 10 }}>
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Activity size="48" color="#0ea5e9" variant="Bold" />
                    <Typography variant="h5" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>
                        สัญญาณหุ้นที่คุณสนใจ
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        เข้าสู่ระบบเพื่อเปิดใช้งาน My Signals และรับสัญญาณวิเคราะห์แบบ Real-time
                    </Typography>
                    <Link href="/api/auth/signin" passHref>
                        <Button variant="contained" sx={{ bgcolor: '#0ea5e9', fontWeight: 800, borderRadius: 3, px: 4 }}>
                            เข้าสู่ระบบ
                        </Button>
                    </Link>
                </Card>
            </Container>
        );
    }

    if ((session?.user as any)?.status === 'suspended') {
        return (
            <Container maxWidth="sm" sx={{ py: 20 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 6, bgcolor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                    <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', width: 80, height: 80, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size="40" color="#fbbf24" variant="Bulk" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#fbbf24' }}>บัญชีถูกระงับชั่วคราว</Typography>
                    <Typography variant="body2" color="text.secondary">
                        บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถใช้งาน My Signals ได้ กรุณาติดต่อผู้ดูแลระบบ
                    </Typography>
                </Paper>
            </Container>
        );
    }

    // Sort signals: analyzed first, then by confidence
    const sortedWatchlist = [...watchlist].sort((a, b) => {
        const sa = signals[a.symbol];
        const sb = signals[b.symbol];
        if (sa && !sb) return -1;
        if (!sa && sb) return 1;
        if (sa && sb) return parseFloat(sb.confidence) - parseFloat(sa.confidence);
        return 0;
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
            {/* Background Blobs */}
            <Box sx={{
                position: 'fixed', top: -100, right: -100, width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)',
                zIndex: -1, pointerEvents: 'none'
            }} />

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.3)' } }}>
                    <Link href="/" passHref style={{ textDecoration: 'none' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>Home</Typography>
                    </Link>
                    <Typography variant="caption" color="text.primary">My Signals</Typography>
                </Breadcrumbs>

                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ p: 0.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)' }}>
                                <Box component="img" src="/images/logo.png" alt="Logo" sx={{ width: 36, height: 'auto', mixBlendMode: 'screen' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                                    My Signals
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    สแกนหุ้นใน Watchlist ของคุณเพื่อดูสัญญาณ Quantitative แบบ Real-time
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="contained"
                            onClick={handleScanAll}
                            disabled={scanningAll || watchlist.length === 0}
                            startIcon={scanningAll ? <CircularProgress size={18} color="inherit" /> : <Flash size="20" variant="Bold" color="#000" />}
                            sx={{
                                bgcolor: '#0ea5e9',
                                fontWeight: 800,
                                borderRadius: 2,
                                px: 3,
                                height: 48,
                                boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                                '&:hover': { bgcolor: '#0284c7' }
                            }}
                        >
                            {scanningAll
                                ? `กำลังสแกน ${scannedCount}/${watchlist.length}...`
                                : `สแกนทั้งหมด (${watchlist.length} หุ้น)`
                            }
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Scan Progress */}
            {scanningAll && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress
                        variant="determinate"
                        value={(scannedCount / watchlist.length) * 100}
                        sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: 'rgba(14, 165, 233, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#0ea5e9',
                                borderRadius: 3,
                            }
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        กำลังวิเคราะห์ {scannedCount} จาก {watchlist.length} หุ้น...
                    </Typography>
                </Box>
            )}

            {/* Empty State */}
            {watchlist.length === 0 && (
                <Card sx={{
                    p: 6, textAlign: 'center', borderRadius: 4,
                    bgcolor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Star1 size="48" color="#f59e0b" variant="Bold" />
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>
                        ยังไม่มีหุ้นใน Watchlist
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        กลับไปที่หน้าหลักแล้วค้นหาหุ้นที่คุณสนใจ กดไอคอนดาวเพื่อเพิ่มเข้า Watchlist
                    </Typography>
                    <Link href="/" passHref style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" sx={{ borderColor: '#0ea5e9', color: '#0ea5e9', fontWeight: 700, borderRadius: 2 }}>
                            ไปค้นหาหุ้น
                        </Button>
                    </Link>
                </Card>
            )}

            {/* Signal Cards Grid */}
            {watchlist.length > 0 && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                    gap: 3,
                }}>
                    {sortedWatchlist.map((item) => {
                        const sig = signals[item.symbol];
                        if (sig) {
                            return <SignalCard key={item.symbol} signal={sig} onRefresh={analyzeOne} />;
                        }
                        // Not yet analyzed — show placeholder
                        return (
                            <Card
                                key={item.symbol}
                                sx={{
                                    p: 3, borderRadius: 2,
                                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    textAlign: 'center', minHeight: 200,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: 'rgba(14, 165, 233, 0.3)', bgcolor: 'rgba(255,255,255,0.02)' }
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                                    {item.symbol}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                                    {item.name || 'ยังไม่ได้วิเคราะห์'}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => analyzeOne(item.symbol)}
                                    startIcon={<SearchNormal1 size="16" variant="Linear" color="#0ea5e9" />}
                                    sx={{
                                        borderColor: 'rgba(14, 165, 233, 0.3)', color: '#0ea5e9',
                                        fontWeight: 700, borderRadius: 2, textTransform: 'none',
                                        '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.05)' }
                                    }}
                                >
                                    วิเคราะห์ตอนนี้
                                </Button>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Info Box */}
            {watchlist.length > 0 && (
                <Box sx={{
                    mt: 4, p: 2.5, borderRadius: 2,
                    bgcolor: 'rgba(14, 165, 233, 0.04)',
                    border: '1px solid rgba(14, 165, 233, 0.1)',
                    display: 'flex', gap: 1.5, alignItems: 'flex-start'
                }}>
                    <InfoCircle size="20" color="#0ea5e9" variant="Bold" />
                    <Box>
                        <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 700, display: 'block', mb: 0.5 }}>
                            วิธีใช้งาน My Signals
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            กด <strong>"สแกนทั้งหมด"</strong> เพื่อให้ระบบวิเคราะห์หุ้นทุกตัวใน Watchlist ของคุณ หรือกดวิเคราะห์ทีละตัวก็ได้ครับ
                            ข้อมูลจะถูกคำนวณแบบ Real-time จากตัวชี้วัดทางเทคนิคกว่า 13 หมวด เช่น RSI, MACD, SMA, Bollinger, Volume
                            หุ้นที่ต้องการติดตาม สามารถเพิ่มจากหน้าหลักโดยกดเครื่องหมายดาว ★
                        </Typography>
                    </Box>
                </Box>
            )}
        </Container>
    );
}
