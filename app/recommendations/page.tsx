'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
    Container, Box, Typography, Card, Stack, Chip,
    Button, Divider, LinearProgress,
} from '@mui/material';
import {
    TrendUp, TrendDown, Activity, Flash, Star,
    InfoCircle, ArrowRight2, Setting2,
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

// ─── Stock Card ───────────────────────────────────────────────────────────────
const StockItem = ({ stock }: { stock: RecommendedStock }) => {
    const isUp = stock.predictionTrend === 'UP';
    const movePercent = stock.predictionTarget && stock.price
        ? (((stock.predictionTarget - stock.price) / stock.price) * 100)
        : null;

    return (
        <Card
            sx={{
                p: 0,
                borderRadius: 3,
                bgcolor: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                '&:hover': {
                    transform: { sm: 'translateY(-3px)' },
                    borderColor: isUp ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.25)',
                    boxShadow: isUp
                        ? '0 8px 32px rgba(34,197,94,0.1)'
                        : '0 8px 32px rgba(239,68,68,0.08)',
                },
            }}
        >
            {/* Top accent bar */}
            <Box sx={{
                height: 3,
                background: isUp
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
            }} />

            {/* Card Body */}
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                {/* Row 1: Symbol + Price */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {/* Avatar */}
                        <Box sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0,
                        }}>
                            <Typography sx={{ fontWeight: 900, color: '#0ea5e9', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {stock.symbol.slice(0, 4)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1rem' }, letterSpacing: -0.3, lineHeight: 1.2 }}>
                                {stock.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {new Date(stock.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Price block */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1rem' }, color: 'white', lineHeight: 1.2 }}>
                            ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: stock.changePercent >= 0 ? '#22c55e' : '#ef4444',
                            fontWeight: 700, fontSize: '0.72rem',
                        }}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ opacity: 0.05, mb: 1.5 }} />

                {/* Row 2: Trend + Confidence */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.6rem' }}>
                            Trend
                        </Typography>
                        <Chip
                            label={isUp ? 'BULLISH' : 'BEARISH'}
                            size="small"
                            sx={{
                                bgcolor: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: isUp ? '#4ade80' : '#f87171',
                                fontWeight: 900, fontSize: '0.58rem', height: 20,
                            }}
                        />
                    </Box>
                    <Box sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.6rem' }}>
                            Confidence
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                            {stock.predictionConfidence?.toFixed(1)}%
                        </Typography>
                    </Box>
                </Box>

                {/* Reasoning */}
                {stock.predictionReasoning && (
                    <Typography variant="caption" sx={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', color: 'text.secondary',
                        bgcolor: 'rgba(14,165,233,0.03)', p: 1.5, borderRadius: 2,
                        fontSize: '0.72rem', lineHeight: 1.45,
                        border: '1px solid rgba(14,165,233,0.07)',
                    }}>
                        {stock.predictionReasoning}
                    </Typography>
                )}
            </Box>

            {/* Card Footer */}
            <Box sx={{
                px: { xs: 1.5, sm: 2 }, py: 1.25,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Stats */}
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', mb: 0.1 }}>
                            Est. Move (1D)
                        </Typography>
                        <Typography sx={{
                            fontWeight: 800, fontSize: { xs: '0.82rem', sm: '0.88rem' },
                            color: movePercent !== null
                                ? (movePercent >= 0 ? '#4ade80' : '#f87171')
                                : '#38bdf8',
                        }}>
                            {movePercent !== null
                                ? `${movePercent >= 0 ? '+' : ''}${movePercent.toFixed(2)}%`
                                : '-'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', mb: 0.1 }}>
                            RSI
                        </Typography>
                        <Typography sx={{
                            fontWeight: 800, fontSize: { xs: '0.82rem', sm: '0.88rem' },
                            color: (stock.rsi && stock.rsi > 70) ? '#f87171'
                                : (stock.rsi && stock.rsi < 30) ? '#4ade80'
                                    : 'white',
                        }}>
                            {stock.rsi?.toFixed(1) || '-'}
                        </Typography>
                    </Box>
                </Stack>

                {/* CTA */}
                <Link href={`/?symbol=${stock.symbol}`} style={{ textDecoration: 'none' }}>
                    <Button
                        size="small"
                        endIcon={<ArrowRight2 size={14} variant="Bold" color="#0ea5e9" />}
                        sx={{
                            color: '#0ea5e9', fontWeight: 700,
                            textTransform: 'none',
                            fontSize: { xs: '0.75rem', sm: '0.82rem' },
                            px: { xs: 1, sm: 1.5 }, py: 0.5,
                            minWidth: 0,
                            '&:hover': { bgcolor: 'rgba(14,165,233,0.08)' },
                        }}
                    >
                        วิเคราะห์
                    </Button>
                </Link>
            </Box>
        </Card>
    );
};

// ─── Filter Button ────────────────────────────────────────────────────────────
const FilterBtn = ({
    active, color, icon, label, onClick,
}: {
    active: boolean; color: string; icon: React.ReactNode; label: string; onClick: () => void;
}) => (
    <Button
        onClick={onClick}
        startIcon={icon}
        sx={{
            borderRadius: 10, px: { xs: 2, sm: 3 }, py: 0.85,
            whiteSpace: 'nowrap', flexShrink: 0,
            bgcolor: active ? `${color}18` : 'transparent',
            color: active ? color : 'text.secondary',
            border: `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.06)'}`,
            fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.8rem' },
            '&:hover': { bgcolor: `${color}10` },
        }}
    >
        {label}
    </Button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const [stocks, setStocks] = useState<RecommendedStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'OVERSOLD' | 'HIGH_CONFIDENCE' | 'BULLISH'>('ALL');

    useEffect(() => { setMounted(true); fetchStocks(); }, []);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stocks');
            const data = await res.json();
            if (Array.isArray(data)) setStocks(data);
        } catch (e) {
            console.error('Failed to fetch recommendations:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!isAdmin) return;
        try {
            const res = await fetch('/api/cron/sync');
            const data = await res.json();
            if (data.message) { alert(`อัปเดตเรียบร้อย: ${data.count} รายการ`); fetchStocks(); }
        } catch { alert('การอัปเดตล้มเหลว'); }
    };

    const filteredStocks = useMemo(() => {
        let r = [...stocks];
        if (filter === 'OVERSOLD') r = r.filter(s => (s.rsi && s.rsi < 40) && s.predictionTrend === 'UP');
        else if (filter === 'HIGH_CONFIDENCE') r = r.filter(s => (s.predictionConfidence || 0) >= 80);
        else if (filter === 'BULLISH') r = r.filter(s => s.predictionTrend === 'UP');
        else r.sort((a, b) => (b.predictionConfidence || 0) - (a.predictionConfidence || 0));
        return r;
    }, [stocks, filter]);

    const { bull, bear } = useMemo(() => ({
        bull: filteredStocks.filter(s => s.predictionTrend === 'UP'),
        bear: filteredStocks.filter(s => s.predictionTrend !== 'UP'),
    }), [filteredStocks]);

    if (!mounted) return null;

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            {/* BG blobs */}
            <Box sx={{ position: 'fixed', top: -80, right: -80, width: { xs: 250, md: 400 }, height: { xs: 250, md: 400 }, background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: -80, left: -80, width: { xs: 250, md: 400 }, height: { xs: 250, md: 400 }, background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, px: { xs: 1.5, sm: 3 } }}>

                {/* ── Header ─────────────────────────────────── */}
                <Box sx={{ mb: { xs: 3, md: 5 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: { xs: 2, md: 1 } }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{
                                fontWeight: 900, color: 'white',
                                fontSize: { xs: '1.65rem', sm: '2.2rem', md: '2.75rem' },
                                lineHeight: 1.1, mb: 0.75,
                            }}>
                                Quantitative <span style={{ color: '#0284c7' }}>Stock Scanner</span>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.55 }}>
                                หุ้นที่มีสัญญาณทางเทคนิคโดดเด่นจากระบบ Quantitative — ข้อมูลเพื่อประกอบการตัดสินใจเท่านั้น
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', animation: 'pulse 2s infinite' }} />
                                <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 800, letterSpacing: 0.8, fontSize: '0.7rem' }}>
                                    LIVE SYSTEM SIGNALS
                                </Typography>
                            </Stack>
                        </Box>

                        {isAdmin && (
                            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Setting2 size={16} variant="Bold" color="#0ea5e9" />}
                                        sx={{
                                            borderRadius: 2, borderColor: 'rgba(14,165,233,0.3)',
                                            color: '#0ea5e9', fontWeight: 800, textTransform: 'none',
                                            width: { xs: '100%', sm: 'auto' }, fontSize: '0.82rem',
                                            '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14,165,233,0.05)' },
                                        }}
                                    >
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            </Box>
                        )}
                    </Stack>

                    {/* Filter chips — horizontal scroll on mobile */}
                    <Box sx={{
                        mt: { xs: 2, md: 3 },
                        mx: { xs: -1.5, sm: 0 },
                        px: { xs: 1.5, sm: 0 },
                        display: 'flex', gap: 1,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        WebkitOverflowScrolling: 'touch',
                    }}>
                        <FilterBtn active={filter === 'ALL'} color="#0ea5e9" onClick={() => setFilter('ALL')} label="ทั้งหมด" icon={<Activity size={16} variant={filter === 'ALL' ? 'Bold' : 'Outline'} color="#0ea5e9" />} />
                        <FilterBtn active={filter === 'OVERSOLD'} color="#4ade80" onClick={() => setFilter('OVERSOLD')} label="RSI < 40 + Bullish" icon={<TrendUp size={16} variant={filter === 'OVERSOLD' ? 'Bold' : 'Outline'} color="#4ade80" />} />
                        <FilterBtn active={filter === 'HIGH_CONFIDENCE'} color="#fcd34d" onClick={() => setFilter('HIGH_CONFIDENCE')} label="Confidence > 80%" icon={<Star size={16} variant={filter === 'HIGH_CONFIDENCE' ? 'Bold' : 'Outline'} color="#fcd34d" />} />
                        <FilterBtn active={filter === 'BULLISH'} color="#38bdf8" onClick={() => setFilter('BULLISH')} label="Bullish" icon={<Flash size={16} variant={filter === 'BULLISH' ? 'Bold' : 'Outline'} color="#38bdf8" />} />
                    </Box>
                </Box>

                {/* ── Content ────────────────────────────────── */}
                {loading ? (
                    <Box sx={{ mt: 4 }}>
                        <LinearProgress sx={{ borderRadius: 5, height: 5, bgcolor: 'rgba(255,255,255,0.05)' }} />
                    </Box>
                ) : filteredStocks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 12 } }}>
                        <Activity size={48} color="rgba(255,255,255,0.1)" />
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            ไม่พบหุ้นที่ตรงตามเงื่อนไข
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.82rem' }}>
                            ลองปรับเปลี่ยนตัวกรอง หรือวิเคราะห์หุ้นตัวใหม่เพิ่มเติม
                        </Typography>
                        <Button variant="outlined" onClick={() => setFilter('ALL')} sx={{ borderRadius: 10, px: 4, fontWeight: 700, fontSize: '0.82rem' }}>
                            ล้างตัวกรอง
                        </Button>
                    </Box>
                ) : (
                    <Stack spacing={{ xs: 4, md: 6 }}>
                        {/* Bull */}
                        {bull.length > 0 && (
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2, sm: 3 } }}>
                                    <TrendUp size={22} color="#4ade80" variant="Bold" />
                                    <Typography sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '1.05rem', sm: '1.35rem' } }}>
                                        สัญญาณ Bullish
                                    </Typography>
                                    <Chip label={`${bull.length} รายการ`} size="small" sx={{ color: '#4ade80', fontWeight: 700, bgcolor: 'rgba(74,222,128,0.1)', fontSize: '0.7rem' }} />
                                </Stack>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: { xs: 1.5, sm: 2 } }}>
                                    {bull.map(s => <StockItem key={s.id} stock={s} />)}
                                </Box>
                            </Box>
                        )}

                        {/* Bear */}
                        {bear.length > 0 && (
                            <Box>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2, sm: 3 } }}>
                                    <TrendDown size={22} color="#ef4444" variant="Bold" />
                                    <Typography sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '1.05rem', sm: '1.35rem' } }}>
                                        สัญญาณ Bearish
                                    </Typography>
                                    <Chip label={`${bear.length} รายการ`} size="small" sx={{ color: '#ef4444', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', fontSize: '0.7rem' }} />
                                </Stack>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: { xs: 1.5, sm: 2 } }}>
                                    {bear.map(s => <StockItem key={s.id} stock={s} />)}
                                </Box>
                            </Box>
                        )}
                    </Stack>
                )}

                {/* ── Disclaimer ─────────────────────────────── */}
                <Box sx={{ mt: { xs: 5, md: 8 }, p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                        <InfoCircle size={18} color="#0ea5e9" variant="Bulk" />
                        <Typography sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            Disclaimer
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
                        ข้อมูลที่แสดงเป็นการประมวลผลเชิงปริมาณผ่าน Algorithm เท่านั้น ไม่ใช่คำแนะนำทางการเงิน การลงทุนมีความเสี่ยง ผู้ลงทุนควรใช้ดุลยพินิจและรับผิดชอบความเสี่ยงด้วยตนเอง
                    </Typography>
                </Box>

            </Container>
        </Box>
    );
}
