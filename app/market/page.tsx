'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    Stack,
    CircularProgress,
    Divider,
    Paper,
    Chip,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    CloudChange,
    Cpu,
    WalletMoney,
    MedalStar,
    LampCharge,
    House,
    Category,
    Setting2,
    Shop,
    Building4,
    TruckFast,
    Activity,
    TrendUp,
    TrendDown,
    Global,
    Flash
} from 'iconsax-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- MOCK DATA / TYPES ---
interface MarketMetric {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
}

const GAUGE_DATA = [
    { name: 'Extreme Fear', value: 20, color: '#ef4444' }, // Red
    { name: 'Fear', value: 20, color: '#f97316' },        // Orange
    { name: 'Neutral', value: 20, color: '#eab308' },     // Yellow
    { name: 'Greed', value: 20, color: '#84cc16' },       // Light Green
    { name: 'Extreme Greed', value: 20, color: '#22c55e' } // Dark Green
];

interface SectorResult {
    name: string;
    symbol: string;
    change: number;
    icon: any;
    color: string;
}

const SECTOR_MAP: Record<string, { name: string, icon: any, color: string }> = {
    'XLK': { name: 'เทคโนโลยี (Technology)', icon: Cpu, color: '#38bdf8' },
    'XLF': { name: 'การเงิน (Financials)', icon: WalletMoney, color: '#fbbf24' },
    'XLE': { name: 'พลังงาน (Energy)', icon: LampCharge, color: '#f97316' },
    'XLV': { name: 'สุขภาพ (Healthcare)', icon: MedalStar, color: '#f87171' },
    'XLY': { name: 'อุปโภคบริโภค (Discretionary)', icon: Shop, color: '#a78bfa' },
    'XLP': { name: 'สินค้าจำเป็น (Staples)', icon: Category, color: '#4ade80' },
    'XLI': { name: 'อุตสาหกรรม (Industrials)', icon: Setting2, color: '#94a3b8' },
    'XLRE': { name: 'อสังหาริมทรัพย์ (Real Estate)', icon: House, color: '#ec4899' },
    'XLU': { name: 'สาธารณูปโภค (Utilities)', icon: Building4, color: '#0ea5e9' },
    'XLB': { name: 'วัสดุก่อสร้าง (Materials)', icon: Box, color: '#8b5cf6' },
    'XLC': { name: 'การสื่อสาร (Communication)', icon: TruckFast, color: '#6366f1' }
};

const COMPANY_NAMES: Record<string, string> = {
    'SPY': 'S&P 500 Index',
    'QQQ': 'NASDAQ 100 Index',
    'DIA': 'Dow Jones Index',
    'TSLA': 'Tesla, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'META': 'Meta Platforms',
    'AMZN': 'Amazon.com, Inc.',
    'GOOGL': 'Alphabet Inc.',
    'BRK.B': 'Berkshire Hathaway',
    'JNJ': 'Johnson & Johnson',
    'JPM': 'JPMorgan Chase',
    'V': 'Visa Inc.',
    'PG': 'Procter & Gamble'
};


// --- COMPONENTS ---

const SentimentGauge = ({ score }: { score: number }) => {
    // Score is 0 - 100
    // We map score to angle in a half-pie
    const chartData = [
        { value: score },
        { value: 100 - score }
    ];

    const getSentimentText = (s: number) => {
        if (s < 20) return { label: 'Extremely Fearful', code: 'กลัวสุดขีด', color: '#ef4444' };
        if (s < 40) return { label: 'Fearful', code: 'กลัว', color: '#f97316' };
        if (s < 60) return { label: 'Neutral', code: 'คงที่ / รอดู', color: '#eab308' };
        if (s < 80) return { label: 'Greed', code: 'โลภ', color: '#84cc16' };
        return { label: 'Extreme Greed', code: 'โลภสุดขีด', color: '#22c55e' };
    };

    const sentiment = getSentimentText(score);

    return (
        <Box sx={{ position: 'relative', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={GAUGE_DATA}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {GAUGE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.3} />
                        ))}
                    </Pie>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={180 - (180 * (score / 100))}
                        innerRadius={80}
                        outerRadius={105}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell key="active" fill={sentiment.color} />
                        <Cell key="inactive" fill="transparent" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: sentiment.color, lineHeight: 1 }}>{Math.round(score)}</Typography>
                <Typography variant="overline" sx={{ display: 'block', mt: 1, fontWeight: 700, color: 'text.secondary' }}>{sentiment.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: sentiment.color }}>{sentiment.code}</Typography>
            </Box>
        </Box>
    );
};

export default function MarketPulsePage() {
    const [loading, setLoading] = useState(true);
    const [sentimentScore, setSentimentScore] = useState(50);
    const [gainers, setGainers] = useState<MarketMetric[]>([]);
    const [losers, setLosers] = useState<MarketMetric[]>([]);
    const [sectors, setSectors] = useState<SectorResult[]>([]);
    const [marketStats, setMarketStats] = useState({ spy: 0, qqq: 0, dia: 0 });

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/market');
            const allData = await res.json();

            if (allData.error) throw new Error(allData.error);

            // 1. Process Main Symbols (Indices & Movers)
            const mainSymbols = ['SPY', 'QQQ', 'DIA', 'TSLA', 'NVDA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'BRK.B', 'JNJ', 'JPM', 'V', 'PG'];
            const stockData = allData
                .filter((item: any) => mainSymbols.includes(item.symbol))
                .map((item: any) => ({
                    symbol: item.symbol,
                    name: COMPANY_NAMES[item.symbol] || item.symbol,
                    price: item.data?.c || 0,
                    changePercent: item.data?.dp || 0
                }));

            const indices = stockData.filter((d: any) => ['SPY', 'QQQ', 'DIA'].includes(d.symbol));
            const avgIndexChange = indices.length > 0 ? indices.reduce((acc: number, curr: any) => acc + curr.changePercent, 0) / indices.length : 0;

            let score = 50 + (avgIndexChange * 15);
            score = Math.max(0, Math.min(100, score));
            setSentimentScore(score);

            setMarketStats({
                spy: stockData.find((d: any) => d.symbol === 'SPY')?.changePercent || 0,
                qqq: stockData.find((d: any) => d.symbol === 'QQQ')?.changePercent || 0,
                dia: stockData.find((d: any) => d.symbol === 'DIA')?.changePercent || 0
            });

            const sortedByPercent = [...stockData].sort((a: any, b: any) => b.changePercent - a.changePercent);
            setGainers(sortedByPercent.slice(0, 5));
            setLosers([...sortedByPercent].reverse().slice(0, 5));

            // 2. Process Sectors
            const sectorSymbols = Object.keys(SECTOR_MAP);
            const sectorResults = allData
                .filter((item: any) => sectorSymbols.includes(item.symbol))
                .map((item: any) => ({
                    symbol: item.symbol,
                    name: SECTOR_MAP[item.symbol].name,
                    change: item.data?.dp || 0,
                    icon: SECTOR_MAP[item.symbol].icon,
                    color: SECTOR_MAP[item.symbol].color
                }));

            setSectors(sectorResults.sort((a: any, b: any) => b.change - a.change));

        } catch (e) {
            console.error('Failed to fetch market pulse:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 20 }}>
                <CircularProgress color="primary" />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>จูนคลื่นความถี่ตลาดหุ้นสหรัฐฯ...</Typography>
            </Box>
        );
    }

    const sentiment = sentimentScore > 60 ? 'POSITIVE' : sentimentScore < 40 ? 'NEGATIVE' : 'NEUTRAL';

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>
                    Market <span style={{ color: '#0284c7' }}>Pulse</span>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    เช็กความนิ่งก่อนลุย ภาพรวมตลาดสหรัฐฯ แบบเรียลไทม์ในสไตล์ TradingChill
                </Typography>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                gap: 4
            }}>
                {/* Sentiment & Gauge UI */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <CloudChange size="24" color="#0284c7" variant="Bulk" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Fear & Greed Index</Typography>
                        </Stack>

                        <SentimentGauge score={sentimentScore} />

                        <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#94a3b8', fontWeight: 700 }}>
                                ☕ TradingChill ของวันนี้:
                            </Typography>
                            <Typography variant="h5" sx={{
                                fontWeight: 900,
                                color: sentiment === 'POSITIVE' ? '#4ade80' : sentiment === 'NEGATIVE' ? '#f87171' : '#eab308'
                            }}>
                                {sentiment === 'POSITIVE' ? '🚀 ลุยได้ ตลาดมีกำลัง!' : sentiment === 'NEGATIVE' ? '⚠️ ระวัง ตลาดผันผวนสูง' : '⚖️ รอดูท่าที ตลาดยังนิ่ง'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.6 }}>
                                {sentiment === 'POSITIVE' ? 'แรงซื้อครอบคลุมตลาด เหมาะกับการเลือกหุ้นที่มีสัญญาณ Bullish ต่อ' :
                                    sentiment === 'NEGATIVE' ? 'แรงขายเริ่มกระจายไปหลายกลุ่ม แนะนำให้ถือเงินสดเพิ่มหรือเลือกหุ้นที่มี RSI ต่ำมาก' :
                                        'ราคาแกว่งในกรอบแคบ เหมาะกับสายรอจุดเบรคเอ้าท์'}
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* Index & Movers */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
                    <Stack spacing={4}>
                        {/* Major Indices Mini Cards */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 2
                        }}>
                            {[
                                { label: 'S&P 500', val: marketStats.spy, icon: <Global size="20" variant='Bulk' color='#0284c7' /> },
                                { label: 'NASDAQ', val: marketStats.qqq, icon: <Flash size="20" variant='Bulk' color='#0284c7' /> },
                                { label: 'DOW JONES', val: marketStats.dia, icon: <Activity size="20" variant='Bulk' color='#0284c7' /> }
                            ].map((item, i) => (
                                <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: item.val >= 0 ? '#4ade80' : '#f87171' }}>{item.icon}</Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>{item.label}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: item.val >= 0 ? '#4ade80' : '#f87171' }}>
                                        {item.val >= 0 ? '+' : ''}{item.val.toFixed(2)}%
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Gainers & Losers Lists */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 3
                        }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendUp size="18" /> TOP GAINERS
                                </Typography>
                                <Stack spacing={1.5}>
                                    {gainers.map((stock) => (
                                        <Paper key={stock.symbol} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{stock.symbol}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stock.name.length > 20 ? stock.name.substring(0, 20) + '...' : stock.name}</Typography>
                                            </Box>
                                            <Typography sx={{ color: '#4ade80', fontWeight: 800, fontSize: '0.9rem' }}>+{stock.changePercent.toFixed(2)}%</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendDown size="18" /> TOP LOSERS
                                </Typography>
                                <Stack spacing={1.5}>
                                    {losers.map((stock) => (
                                        <Paper key={stock.symbol} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{stock.symbol}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stock.name.length > 20 ? stock.name.substring(0, 20) + '...' : stock.name}</Typography>
                                            </Box>
                                            <Typography sx={{ color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>{stock.changePercent.toFixed(2)}%</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>

                        {/* Sectors Analysis */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Category size="20" variant="Bulk" color="#38bdf8" /> ทิศทางเม็ดเงินรายอุตสาหกกรม (Money Flow)
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, fontSize: '0.75rem' }}>
                                วิเคราะห์ความแข็งแกร่งของแต่ละกลุ่มธุรกิจ เพื่อหาจังหวะการเข้าซื้อหุ้นในกลุ่มที่เป็นผู้นำตลาด (Leading Sectors)
                            </Typography>
                            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                                    {sectors.map((sector) => {
                                        const Icon = sector.icon;
                                        return (
                                            <Box key={sector.symbol}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Icon size="16" color={sector.color} variant="Bulk" />
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{sector.name}</Typography>
                                                    </Stack>
                                                    <Typography variant="caption" sx={{ fontWeight: 900, color: sector.change >= 0 ? '#4ade80' : '#f87171' }}>
                                                        {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                                                    </Typography>
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(100, Math.max(0, 50 + (sector.change * 10)))}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: sector.change >= 0 ? '#4ade80' : '#f87171',
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Box>
                                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4ade80' }} />
                                        <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 800 }}>ผู้นำตลาด (Leading) - เงินไหลเข้า</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f87171' }} />
                                        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 800 }}>ผู้ล้าหลัง (Lagging) - เงินไหลออก</Typography>
                                    </Stack>
                                </Stack>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center', fontSize: '0.65rem', opacity: 0.6 }}>
                                    * เปรียบเทียบความแข็งแกร่งของแต่ละกลุ่มอุตสาหกรรมด้วย Sector ETFs (S&P 500)
                                </Typography>
                            </Paper>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
}
