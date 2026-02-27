'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Box,
    Typography,
    Stack,
    Button,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
    Tooltip,
    LinearProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { useSession, signIn } from 'next-auth/react';
import {
    Add,
    Trash,
    TrendUp,
    TrendDown,
    WalletMoney,
    ChartSquare,
    InfoCircle,
    Receipt2,
    Activity,
    CloseCircle,
    Category
} from 'iconsax-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface PortfolioItem {
    id: number;
    symbol: string;
    name: string;
    shares: number;
    buyPrice: number;
    buyDate: string;
    currentPrice?: number;
    predictionTrend?: string;
    sector?: string;
}

const COLORS = ['#38bdf8', '#fbbf24', '#f97316', '#f87171', '#a78bfa', '#4ade80', '#94a3b8', '#ec4899', '#0ea5e9', '#8b5cf6', '#6366f1'];

export default function PortfolioPage() {
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [newStock, setNewStock] = useState({ symbol: '', shares: '', buyPrice: '' });
    const [saving, setSaving] = useState(false);
    const [thbAmount, setThbAmount] = useState('');
    const [rate, setRate] = useState('');
    const [fetchingPrice, setFetchingPrice] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, item?: PortfolioItem }>({ open: false });

    const { data: session, status } = useSession();

    useEffect(() => {
        if (session) {
            fetchPortfolio();
            fetchExchangeRate();
        }
    }, [session]);

    const fetchExchangeRate = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            if (data.rates?.THB) {
                setRate(data.rates.THB.toString());
            }
        } catch (e) {
            console.error('Failed to fetch exchange rate:', e);
        }
    };

    const fetchPortfolio = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();

            // Get current prices and signals
            const updatedData = await Promise.all(data.map(async (item: PortfolioItem) => {
                try {
                    const bundleRes = await fetch(`/api/stock-bundle?symbol=${item.symbol}`);
                    const bundleData = await bundleRes.json();
                    return {
                        ...item,
                        currentPrice: bundleData.quote?.c,
                        name: bundleData.profile?.name || item.name,
                        predictionTrend: bundleData.prediction?.trend,
                        sector: bundleData.profile?.finnhubIndustry || 'Other'
                    };
                } catch {
                    return item;
                }
            }));

            setPortfolio(updatedData);
            setLastUpdated(new Date());
        } catch (e) {
            console.error('Error fetching portfolio:', e);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        fetchPortfolio();
        fetchExchangeRate();
    };

    const fetchCurrentPrice = async (symbol: string) => {
        if (!symbol || symbol.length < 2) return;
        setFetchingPrice(true);
        try {
            const res = await fetch(`/api/stock-bundle?symbol=${symbol.toUpperCase()}`);
            const data = await res.json();
            if (data.quote?.c) {
                setNewStock(prev => ({ ...prev, buyPrice: data.quote.c.toString() }));
            }
        } catch (e) {
            console.error('Failed to fetch price:', e);
        } finally {
            setFetchingPrice(false);
        }
    };

    const handleAdd = async () => {
        if (!newStock.symbol || !newStock.buyPrice) return;
        setSaving(true);
        try {
            const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: newStock.symbol.toUpperCase(),
                    shares: newStock.shares,
                    buyPrice: newStock.buyPrice
                })
            });
            if (res.ok) {
                setOpenAdd(false);
                setNewStock({ symbol: '', shares: '', buyPrice: '' });
                setThbAmount(''); // Reset
                setSnackbar({ open: true, message: `ซื้อหุ้น ${newStock.symbol.toUpperCase()} เข้าพอร์ตเรียบร้อย!`, severity: 'success' });
                fetchPortfolio();
            } else {
                setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการซื้อหุ้น', severity: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    // Calculate shares whenever THB, Rate, or BuyPrice changes
    useEffect(() => {
        if (thbAmount && rate && newStock.buyPrice) {
            const amountThb = parseFloat(thbAmount);
            const exchangeRate = parseFloat(rate);
            const priceUsd = parseFloat(newStock.buyPrice);
            if (exchangeRate > 0 && priceUsd > 0) {
                const calculatedShares = (amountThb / exchangeRate) / priceUsd;
                setNewStock(prev => ({ ...prev, shares: calculatedShares.toFixed(4) }));
            }
        }
    }, [thbAmount, rate, newStock.buyPrice]);

    const preventScroll = (e: any) => {
        e.target.blur();
    };

    const handleDeleteClick = (item: PortfolioItem) => {
        setDeleteConfirm({ open: true, item });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.item) return;
        try {
            const res = await fetch('/api/portfolio', {
                method: 'DELETE',
                body: JSON.stringify({ id: deleteConfirm.item.id })
            });
            if (res.ok) {
                setPortfolio(portfolio.filter(p => p.id !== deleteConfirm.item?.id));
                setSnackbar({ open: true, message: `ขายหุ้น ${deleteConfirm.item.symbol} ออกจากพอร์ตแล้ว!`, severity: 'success' });
            }
        } catch (e) {
            setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการขายหุ้น', severity: 'error' });
        } finally {
            setDeleteConfirm({ open: false });
        }
    };

    const totalInvestment = portfolio.reduce((acc, curr) => acc + (curr.buyPrice * curr.shares), 0);
    const currentValue = portfolio.reduce((acc, curr) => acc + ((curr.currentPrice || curr.buyPrice) * curr.shares), 0);
    const totalProfit = currentValue - totalInvestment;
    const profitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    // Simulation Data for Chart (Mock growth)
    const chartData = useMemo(() => {
        const days = 7;
        let runningValue = totalInvestment * 0.95; // Start a bit lower
        return Array.from({ length: days }).map((_, i) => {
            const step = (currentValue - runningValue) / (days - i);
            runningValue += step + (Math.random() - 0.5) * (totalInvestment * 0.02);
            return {
                date: `Day ${i + 1}`,
                value: runningValue
            };
        });
    }, [totalInvestment, currentValue]);

    const sectorData = useMemo(() => {
        const sectors: Record<string, number> = {};
        portfolio.forEach(item => {
            const val = (item.currentPrice || item.buyPrice) * item.shares;
            const sector = item.sector || 'Uncategorized';
            sectors[sector] = (sectors[sector] || 0) + val;
        });

        return Object.entries(sectors).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);
    }, [portfolio]);

    if (status === 'loading') {
        return <Box sx={{ textAlign: 'center', py: 20 }}><CircularProgress /><Typography sx={{ mt: 2, color: 'text.secondary' }}>กำลังตรวจสอบสิทธิ์...</Typography></Box>;
    }

    if (!session) {
        return (
            <Container maxWidth="sm" sx={{ py: 20 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 6, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', width: 80, height: 80, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WalletMoney size="40" color="#0ea5e9" variant="Bulk" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>เข้าสู่ระบบเพื่อใช้งานพอร์ตจำลอง</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>คุณจำเป็นต้องเข้าสู่ระบบเพื่อบันทึกและติดตามข้อมูลพอร์ตหุ้นของคุณส่วนตัว</Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => signIn('google')}
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
                    >
                        เข้าสู่ระบบด้วย Google
                    </Button>
                </Paper>
            </Container>
        );
    }

    if ((session?.user as any)?.status === 'suspended') {
        return (
            <Container maxWidth="sm" sx={{ py: 20 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 6, bgcolor: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                    <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', width: 80, height: 80, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WalletMoney size="40" color="#fbbf24" variant="Bulk" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#fbbf24' }}>บัญชีถูกระงับชั่วคราว</Typography>
                    <Typography variant="body2" color="text.secondary">
                        บัญชีของคุณถูกระงับชั่วคราว ไม่สามารถใช้งาน Portfolio Simulator ได้ กรุณาติดต่อผู้ดูแลระบบ
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (loading) {
        return <Box sx={{ textAlign: 'center', py: 20 }}><CircularProgress /><Typography sx={{ mt: 2, color: 'text.secondary' }}>กำลังรวบรวมทรัพย์สินของคุณ...</Typography></Box>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Box sx={{
                mb: 6,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'flex-end' },
                gap: 2
            }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>
                        Portfolio <span style={{ color: '#0284c7' }}>Simulator</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        พอร์ตจำลองสำหรับทดสอบกลยุทธ์ TradingChill แบบไม่เจ็บตัว
                    </Typography>
                </Box>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                        width: { xs: '100%', md: 'auto' },
                        justifyContent: { xs: 'space-between', md: 'flex-end' }
                    }}
                >
                    {lastUpdated && (
                        <Box sx={{ textAlign: 'right', mr: { xs: 0, md: 2 } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', fontWeight: 600 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ade80', animation: 'pulse 2s infinite' }} />
                                LIVE
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                                {lastUpdated.toLocaleTimeString('th-TH')}
                            </Typography>
                        </Box>
                    )}
                    <Stack direction="row" spacing={1.5} flex={1} justifyContent="flex-end">
                        <IconButton
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                width: 45, height: 45
                            }}
                        >
                            {isRefreshing ? <CircularProgress size={20} color="inherit" /> : <Activity size="20" color="#38bdf8" />}
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<Add variant="Bold" />}
                            onClick={() => setOpenAdd(true)}
                            sx={{
                                borderRadius: 3,
                                px: { xs: 2.5, md: 3 },
                                py: 1.2,
                                height: 45,
                                fontWeight: 800,
                                bgcolor: '#0284c7',
                                '&:hover': { bgcolor: '#0369a1' },
                                whiteSpace: 'nowrap'
                            }}
                        >
                            เพิ่มหุ้น
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
            `}</style>

            {/* Summary Cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 3,
                mb: 4
            }}>
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <WalletMoney size="24" color="#38bdf8" variant="Bulk" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>เงินลงทุนทั้งหมด</Typography>
                    </Stack>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
                        ${totalInvestment.toLocaleString()}
                    </Typography>
                    {rate && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ({(totalInvestment * parseFloat(rate)).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB)
                        </Typography>
                    )}
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <ChartSquare size="24" color="#0284c7" variant="Bulk" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>มูลค่าปัจจุบัน</Typography>
                    </Stack>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
                        ${currentValue.toLocaleString()}
                    </Typography>
                    {rate && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            ({(currentValue * parseFloat(rate)).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB)
                        </Typography>
                    )}
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        {totalProfit >= 0 ? <TrendUp size="24" color="#4ade80" variant="Bulk" /> : <TrendDown size="24" color="#f87171" variant="Bulk" />}
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>กำไร / ขาดทุน</Typography>
                    </Stack>
                    <Stack direction="column" spacing={0}>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography variant="h4" sx={{ fontWeight: 900, color: totalProfit >= 0 ? '#4ade80' : '#f87171' }}>
                                ${Math.abs(totalProfit).toLocaleString()}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: totalProfit >= 0 ? '#4ade80' : '#f87171', opacity: 0.8 }}>
                                ({totalProfit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                            </Typography>
                        </Stack>
                        {rate && (
                            <Typography variant="caption" sx={{ color: totalProfit >= 0 ? '#4ade80' : '#f87171', fontWeight: 600, opacity: 0.8 }}>
                                ({totalProfit >= 0 ? '+' : '-'}{(Math.abs(totalProfit) * parseFloat(rate)).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB)
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4, textAlign: 'right', opacity: 0.6 }}>
                ⚠️ อัตราแลกเปลี่ยนเป็นราคาตลาดโดยประมาณ ราคาจริงอาจแตกต่างกันตามแต่ละ Exchange หรือโบรกเกอร์ที่คุณใช้งาน
            </Typography>

            {/* Growth Chart & Asset List */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
                {/* Growth Chart */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Activity size="24" color="#0284c7" variant="Bulk" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Portfolio Growth</Typography>
                        </Stack>
                        <Box sx={{ height: { xs: 240, md: 300 }, width: '100%', mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: 'white' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Box>

                {/* Diversification Chart */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Category size="24" color="#fbbf24" variant="Bulk" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Diversification</Typography>
                        </Stack>
                        <Box sx={{ height: 200, width: '100%', mt: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sectorData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sectorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                        formatter={(val: any) => `$${Number(val || 0).toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {sectorData.slice(0, 4).map((entry, index) => (
                                <Stack key={entry.name} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{entry.name}</Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                        {((entry.value / currentValue) * 100).toFixed(1)}%
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                {/* Asset List */}
                <Box sx={{ gridColumn: 'span 12' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt2 size="24" color="#0284c7" variant="Bulk" /> สินทรัพย์ในพอร์ต
                    </Typography>
                    {portfolio.length === 0 ? (
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <Typography color="text.secondary">ยังไม่มีข้อมูลหุ้นในพอร์ตจำลอง</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {portfolio.map((item) => {
                                const gain = (item.currentPrice ? (item.currentPrice - item.buyPrice) : 0) * item.shares;
                                const gainP = item.currentPrice ? ((item.currentPrice - item.buyPrice) / item.buyPrice) * 100 : 0;
                                return (
                                    <Paper
                                        key={item.id}
                                        sx={{
                                            p: { xs: 2.5, md: 3 },
                                            borderRadius: 4,
                                            bgcolor: 'rgba(30, 41, 59, 0.4)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Background Decoration */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            width: 100,
                                            height: 100,
                                            bgcolor: gain >= 0 ? 'rgba(74, 222, 128, 0.03)' : 'rgba(248, 113, 113, 0.03)',
                                            borderRadius: '50%',
                                            filter: 'blur(30px)'
                                        }} />

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, alignItems: 'center', gap: { xs: 3, md: 2 } }}>
                                            {/* Symbol & Name */}
                                            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{item.symbol}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>{item.name}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                                        <IconButton onClick={() => handleDeleteClick(item)} size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                                            <Trash variant="Bold" size="18" />
                                                        </IconButton>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* Data Points */}
                                            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                                                    gap: { xs: 3, md: 2 }
                                                }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>Shares</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.shares.toLocaleString()}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>Avg. Price</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${item.buyPrice.toFixed(2)}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>Market Price</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: (item.currentPrice || 0) >= item.buyPrice ? '#4ade80' : '#f87171' }}>
                                                            ${item.currentPrice?.toFixed(2) || '---'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>Signal</Typography>
                                                        <Box component="span" sx={{
                                                            px: 1, py: 0.4, borderRadius: 1.5,
                                                            fontSize: '0.65rem', fontWeight: 900,
                                                            bgcolor: item.predictionTrend === 'UP' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                            color: item.predictionTrend === 'UP' ? '#4ade80' : '#f87171',
                                                            border: `1px solid ${item.predictionTrend === 'UP' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 0.5
                                                        }}>
                                                            {item.predictionTrend === 'UP' ? '🚀 BULLISH' : item.predictionTrend === 'DOWN' ? '⚠️ BEARISH' : 'NO DATA'}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* P/L & Actions */}
                                            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' }, display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-end' }, gap: 3 }}>
                                                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>Profit/Loss</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 950, color: gain >= 0 ? '#4ade80' : '#f87171', lineHeight: 1 }}>
                                                        {gain >= 0 ? '+' : ''}${Math.abs(gain).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: gain >= 0 ? '#4ade80' : '#f87171', fontWeight: 800, opacity: 0.9 }}>
                                                        {gain >= 0 ? '+' : ''}{gainP.toFixed(2)}%
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                    <IconButton onClick={() => handleDeleteClick(item)} sx={{ color: 'rgba(239, 68, 68, 0.4)', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                                        <Trash variant="Bulk" size="24" color="#ef4444" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* Add Stock Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: 2, backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' } }}>
                <DialogTitle sx={{ p: 3, pb: 0 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex' }}>
                            <WalletMoney size="24" color="#0284c7" variant="Bulk" />
                        </Box>
                        <Typography variant="h6" component="span" sx={{ fontWeight: 900, color: 'white' }}>ซื้อหุ้นเข้าพอร์ตจำลอง</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1, minWidth: 350 }}>
                        <TextField
                            fullWidth
                            label="Ticker Symbol"
                            placeholder="เช่น NVDA"
                            value={newStock.symbol}
                            onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                            onBlur={() => fetchCurrentPrice(newStock.symbol)}
                            variant="outlined"
                            InputProps={{
                                endAdornment: fetchingPrice && <CircularProgress size={16} />
                            }}
                        />

                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(2, 132, 199, 0.05)', border: '1px dashed rgba(2, 132, 199, 0.2)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                <InfoCircle size="14" variant="Bulk" /> เครื่องช่วยคำนวณเงินบาท (THB)
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="จำนวนเงิน (บาท)"
                                    type="number"
                                    value={thbAmount}
                                    onChange={(e) => setThbAmount(e.target.value)}
                                    onWheel={preventScroll}
                                    size="small"
                                />
                                <TextField
                                    label="เรท (บาท/$)"
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    onWheel={preventScroll}
                                    size="small"
                                    sx={{ width: 100 }}
                                />
                            </Stack>
                            {thbAmount && (
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                                    คิดเป็นประมาณ: <b>${((parseFloat(thbAmount) || 0) / (parseFloat(rate) || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(245, 158, 11, 0.6)', fontSize: '0.65rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                                * ราคาจริงอาจต่างกันเล็กน้อยตามค่าธรรมเนียมและเรทของแต่ละ Exchange
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            label="ราคาทุน ($)"
                            type="number"
                            value={newStock.buyPrice}
                            onChange={(e) => setNewStock({ ...newStock, buyPrice: e.target.value })}
                            onWheel={preventScroll}
                        />

                        <TextField
                            fullWidth
                            label="จำนวนหุ้นที่ได้"
                            type="number"
                            value={newStock.shares}
                            onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                            onWheel={preventScroll}
                            helperText={thbAmount ? "คำนวณให้อัตโนมัติจากเงินบาท" : ""}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAdd(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>ยกเลิก</Button>
                    <Button
                        onClick={handleAdd}
                        disabled={saving}
                        variant="contained"
                        sx={{ borderRadius: 2, bgcolor: '#0284c7', fontWeight: 800, '&:hover': { bgcolor: '#0369a1' } }}
                    >
                        {saving ? <CircularProgress size={20} /> : 'บันทึกรายการ'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false })}
                PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', minWidth: { xs: '90%', sm: 400 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, p: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex' }}>
                        <Trash size="22" color="#ef4444" variant="Bulk" />
                    </Box>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: 'white' }}>ยืนยันการขายหุ้น</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Typography color="text.secondary">
                        คุณต้องการยืนยันการขาย (ลบ) หุ้น <b style={{ color: 'white' }}>{deleteConfirm.item?.symbol}</b> ออกจากพอร์ตจำลองใช่หรือไม่?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false })} sx={{ color: 'text.secondary', fontWeight: 700 }}>ยกเลิก</Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        sx={{ bgcolor: '#ef4444', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#dc2626' } }}
                    >
                        ยืนยันการขาย
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 3, fontWeight: 700, bgcolor: snackbar.severity === 'success' ? '#064e3b' : '#450a0a', color: 'white' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
