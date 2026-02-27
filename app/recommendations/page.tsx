'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
    Tooltip,
    Divider,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import {
    Ranking,
    TrendUp,
    TrendDown,
    Activity,
    Cpu,
    Flash,
    Chart,
    Star,
    InfoCircle,
    ArrowRight2,
    Refresh2,
} from 'iconsax-react';
import Link from 'next/link';

interface RecommendedStock {
    id: number;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    rsi: number | null;
    sma20: number | null;
    predictionTrend: string | null;
    predictionConfidence: number | null;
    predictionTarget: number | null;
    predictionReasoning: string | null;
    date: string;
}

const StockItem = ({ stock }: { stock: RecommendedStock }) => (
    <Card
        sx={{
            p: 0,
            borderRadius: 2,
            bgcolor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                bgcolor: 'rgba(255,255,255,0.04)',
                borderColor: stock.predictionTrend === 'UP' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255,255,255,0.12)',
                boxShadow: stock.predictionTrend === 'UP' ? '0 10px 40px rgba(34, 197, 94, 0.12)' : '0 10px 40px rgba(0,0,0,0.2)'
            }
        }}
    >
        <Box sx={{ p: 2, pb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#0ea5e9', fontSize: '0.75rem' }}>
                            {stock.symbol}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                            {stock.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {new Date(stock.date).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                        ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                        <Typography variant="caption" sx={{ color: stock.change >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Typography>
                    </Stack>
                </Box>
            </Stack>

            <Divider sx={{ opacity: 0.05, mb: 1.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                        Trend
                    </Typography>
                    <Chip
                        label={stock.predictionTrend === 'UP' ? 'BULLISH' : 'BEARISH'}
                        size="small"
                        sx={{
                            bgcolor: stock.predictionTrend === 'UP' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: stock.predictionTrend === 'UP' ? '#4ade80' : '#f87171',
                            fontWeight: 900,
                            fontSize: '0.6rem',
                            height: 20
                        }}
                    />
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                        Confidence
                    </Typography>
                    <Typography variant="subtitle2" className="font-mono" sx={{ fontWeight: 800 }}>
                        {stock.predictionConfidence?.toFixed(1)}%
                    </Typography>
                </Box>
            </Box>

            {stock.predictionReasoning && (
                <Typography
                    className="reasoning-text"
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        bgcolor: 'rgba(14, 165, 233, 0.03)',
                        p: 1.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        border: '1px solid rgba(14, 165, 233, 0.08)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1.5,
                    }}
                >
                    {stock.predictionReasoning}
                </Typography>
            )}
        </Box>

        <Box
            sx={{
                p: 1.5,
                px: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <Stack direction="row" spacing={2}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Target</Typography>
                    <Typography variant="body2" className="font-mono" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                        ${stock.predictionTarget?.toFixed(2)}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>RSI</Typography>
                    <Typography variant="body2" className="font-mono" sx={{ fontWeight: 800, color: (stock.rsi && stock.rsi > 70) ? '#f87171' : (stock.rsi && stock.rsi < 30) ? '#4ade80' : 'white' }}>
                        {stock.rsi?.toFixed(1) || '-'}
                    </Typography>
                </Box>
            </Stack>

            <Link href={`/?symbol=${stock.symbol}`} style={{ textDecoration: 'none' }}>
                <Button
                    variant="text"
                    endIcon={<ArrowRight2 size="16" variant='Bold' color='#0ea5e9' />}
                    sx={{
                        color: '#0ea5e9',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' }
                    }}
                >
                    ดูการวิเคราะห์
                </Button>
            </Link>
        </Box>
    </Card>
);

export default function RecommendationsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.email === 'l3onsaiii@gmail.com';

    const [stocks, setStocks] = useState<RecommendedStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'OVERSOLD' | 'HIGH_CONFIDENCE' | 'BULLISH'>('ALL');

    useEffect(() => {
        setMounted(true);
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stocks');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStocks(data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!isAdmin) return;
        setSyncing(true);
        try {
            const res = await fetch('/api/cron/sync');
            const data = await res.json();
            if (data.message) {
                alert(`อัปเดตเรียบร้อย: ${data.count} รายการ`);
                fetchStocks();
            }
        } catch (error) {
            console.error('Sync failed:', error);
            alert('การอัปเดตล้มเหลว');
        } finally {
            setSyncing(false);
        }
    };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];

        switch (filter) {
            case 'OVERSOLD':
                result = result.filter(s => (s.rsi && s.rsi < 40) && s.predictionTrend === 'UP');
                break;
            case 'HIGH_CONFIDENCE':
                result = result.filter(s => (s.predictionConfidence || 0) >= 80);
                break;
            case 'BULLISH':
                result = result.filter(s => s.predictionTrend === 'UP');
                break;
            default:
                // Sort by confidence by default
                result.sort((a, b) => (b.predictionConfidence || 0) - (a.predictionConfidence || 0));
                break;
        }

        return result;
    }, [stocks, filter]);

    const groupedStocks = useMemo(() => {
        const bull = filteredStocks.filter((s: RecommendedStock) => s.predictionTrend === 'UP');
        const bear = filteredStocks.filter((s: RecommendedStock) => s.predictionTrend !== 'UP');
        return { bull, bear };
    }, [filteredStocks]);

    if (!mounted) return null;

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Background Blobs */}
            <Box sx={{
                position: 'fixed', top: -100, right: -100, width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
                zIndex: -1, pointerEvents: 'none'
            }} />
            <Box sx={{
                position: 'fixed', bottom: -100, left: -100, width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                zIndex: -1, pointerEvents: 'none'
            }} />

            <Container maxWidth="lg" sx={{ py: 6, position: 'relative' }}>

                {/* Header Section */}
                <Box sx={{ mb: 6 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ mb: { xs: 3, md: 1 } }}
                    >
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>
                                Quantitative <span style={{ color: '#0284c7' }}>Top Picks</span>
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                                รวมสุดยอดหุ้นที่มีสัญญาณทางเทคนิคแม่นยำที่สุดจากระบบ Quantitative ล่าสุด
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', animation: 'pulse 2s infinite' }} />
                                <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 800, letterSpacing: 1 }}>
                                    LIVE SYSTEM SIGNALS (GLOBAL)
                                </Typography>
                            </Stack>
                        </Box>

                        {isAdmin && (
                            <Box sx={{ ml: 'auto' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleSync}
                                    disabled={syncing}
                                    startIcon={syncing ? <CircularProgress size={16} /> : <Refresh2 size="18" />}
                                    sx={{
                                        borderRadius: 2,
                                        borderColor: 'rgba(14, 165, 233, 0.3)',
                                        color: '#0ea5e9',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.05)' }
                                    }}
                                >
                                    {syncing ? 'กำลังอัปเดตระบบ...' : 'Sync Global Data (Admin)'}
                                </Button>
                            </Box>
                        )}
                    </Stack>

                    {/* Filter Section */}
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            mt: { xs: 2, md: 4 },
                            overflowX: 'auto',
                            pb: 1.5,
                            mx: { xs: -2, md: 0 },
                            px: { xs: 2, md: 0 },
                            '&::-webkit-scrollbar': { display: 'none' },
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <Button
                            onClick={() => setFilter('ALL')}
                            startIcon={<Activity size="18" variant={filter === 'ALL' ? 'Bold' : 'Outline'} color="#0ea5e9" />}
                            sx={{
                                borderRadius: 10, px: 3, py: 1, whiteSpace: 'nowrap',
                                bgcolor: filter === 'ALL' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                                color: filter === 'ALL' ? '#0ea5e9' : 'text.secondary',
                                border: `1px solid ${filter === 'ALL' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.05)' }
                            }}
                        >
                            ทั้งหมด
                        </Button>
                        <Button
                            onClick={() => setFilter('OVERSOLD')}
                            startIcon={<TrendUp size="18" variant={filter === 'OVERSOLD' ? 'Bold' : 'Outline'} color="#4ade80" />}
                            sx={{
                                borderRadius: 10, px: 3, py: 1, whiteSpace: 'nowrap',
                                bgcolor: filter === 'OVERSOLD' ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                color: filter === 'OVERSOLD' ? '#4ade80' : 'text.secondary',
                                border: `1px solid ${filter === 'OVERSOLD' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.05)' }
                            }}
                        >
                            หุ้นราคาถูก (RSI &lt; 40)
                        </Button>
                        <Button
                            onClick={() => setFilter('HIGH_CONFIDENCE')}
                            startIcon={<Star size="18" variant={filter === 'HIGH_CONFIDENCE' ? 'Bold' : 'Outline'} color="#fcd34d" />}
                            sx={{
                                borderRadius: 10, px: 3, py: 1, whiteSpace: 'nowrap',
                                bgcolor: filter === 'HIGH_CONFIDENCE' ? 'rgba(252, 211, 77, 0.1)' : 'transparent',
                                color: filter === 'HIGH_CONFIDENCE' ? '#fcd34d' : 'text.secondary',
                                border: `1px solid ${filter === 'HIGH_CONFIDENCE' ? 'rgba(252, 211, 77, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: 'rgba(252, 211, 77, 0.05)' }
                            }}
                        >
                            ความแม่นยำสูง (&gt; 80%)
                        </Button>
                        <Button
                            onClick={() => setFilter('BULLISH')}
                            startIcon={<Flash size="18" variant={filter === 'BULLISH' ? 'Bold' : 'Outline'} color="#0ea5e9" />}
                            sx={{
                                borderRadius: 10, px: 3, py: 1, whiteSpace: 'nowrap',
                                bgcolor: filter === 'BULLISH' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                                color: filter === 'BULLISH' ? '#0ea5e9' : 'text.secondary',
                                border: `1px solid ${filter === 'BULLISH' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.05)' }
                            }}
                        >
                            ขาขึ้น (BULLISH)
                        </Button>
                    </Stack>
                </Box>


                {loading ? (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <LinearProgress sx={{ borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.05)' }} />
                    </Box>
                ) : filteredStocks.length === 0 ? (
                    <Card
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.02)',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <Activity size="64" color="rgba(255,255,255,0.1)" />
                        <Typography variant="h6" sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>
                            ไม่พบหุ้นที่ตรงตามเงื่อนไข
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            ลองปรับเปลี่ยนตัวกรอง หรือวิเคราะห์หุ้นตัวใหม่ๆ เพิ่มเติม
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setFilter('ALL')}
                            sx={{ borderRadius: 10, px: 4, py: 1, fontWeight: 700 }}
                        >
                            ล้างตัวกรองทั้งหมด
                        </Button>
                    </Card>
                ) : (
                    <Stack spacing={6}>
                        {/* Bull Section */}
                        {groupedStocks.bull.length > 0 && (
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                                    <TrendUp size="24" color="#4ade80" variant="Bold" />
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                                        หุ้นแนะนำฝั่งขาขึ้น (Bullish)
                                        <Typography component="span" variant="caption" sx={{ ml: 1.5, color: '#4ade80', fontWeight: 700, bgcolor: 'rgba(74, 222, 128, 0.1)', px: 1, py: 0.3, borderRadius: 1.5 }}>
                                            {groupedStocks.bull.length} รายการ
                                        </Typography>
                                    </Typography>
                                </Stack>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                                    gap: 2
                                }}>
                                    {groupedStocks.bull.map((stock: RecommendedStock) => (
                                        <StockItem key={stock.id} stock={stock} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Bear Section */}
                        {groupedStocks.bear.length > 0 && (
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                                    <TrendDown size="24" color="#ef4444" variant="Bold" />
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                                        หุ้นแนะนำฝั่งขาลง (Bearish)
                                        <Typography component="span" variant="caption" sx={{ ml: 1.5, color: '#ef4444', fontWeight: 700, bgcolor: 'rgba(239, 68, 68, 0.1)', px: 1, py: 0.3, borderRadius: 1.5 }}>
                                            {groupedStocks.bear.length} รายการ
                                        </Typography>
                                    </Typography>
                                </Stack>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                                    gap: 2
                                }}>
                                    {groupedStocks.bear.map((stock: RecommendedStock) => (
                                        <StockItem key={stock.id} stock={stock} />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Stack>
                )}


                {/* Disclaimer */}
                <Box sx={{
                    mt: 8, p: 3, borderRadius: 4,
                    bgcolor: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <InfoCircle size="22" color="#0ea5e9" variant="Bulk" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>
                            Quantitative Analysis Disclaimer
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.85rem' }}>
                        ข้อมูลที่แสดงเป็นการประมวลผลเชิงปริมาณผ่าน Algorithm เท่านั้น ไม่ใช่คำแนะนำทางการเงิน การลงทุนมีความเสี่ยง ผู้ลงทุนควรใช้ดุลยพินิจและรับผิดชอบความเสี่ยงด้วยตนเอง ระบบนี้เป็นเพียงเครื่องมือช่วยคัดกรองสัญญาณเทคนิคทางสถิติเบื้องต้น
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
