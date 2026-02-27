'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Card, Stack, CircularProgress,
    Chip, LinearProgress, Divider, ToggleButton, ToggleButtonGroup,
    TextField, Paper, Autocomplete, InputAdornment, Skeleton, TablePagination
} from '@mui/material';
import { TrendUp, TrendDown, Activity, Chart, SearchNormal1, InfoCircle, Star } from 'iconsax-react';

const PERIODS = [
    { label: '15 วัน', days: 15 },
    { label: '1 เดือน', days: 30 },
    { label: '3 เดือน', days: 90 },
    { label: '6 เดือน', days: 180 },
];



function AccuracyGauge({ value, label, count }: { value: number | null; label: string; count?: number }) {
    if (value === null) return null;
    const color = value >= 70 ? '#4ade80' : value >= 55 ? '#fbbf24' : '#f87171';
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 0.5 }}>
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    thickness={4}
                    sx={{ color: 'rgba(255,255,255,0.06)', position: 'absolute' }}
                />
                <CircularProgress
                    variant="determinate"
                    value={value}
                    size={80}
                    thickness={4}
                    sx={{ color }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography className="font-mono" sx={{ fontWeight: 800, fontSize: '1.1rem', color }}>{value}%</Typography>
                </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>{label}</Typography>
            {count !== undefined && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{count} ครั้ง</Typography>
            )}
        </Box>
    );
}

export default function BacktestPage() {
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState(180);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [searchOptions, setSearchOptions] = useState<any[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Fetch watchlist favorites on mount
    useEffect(() => {
        const fetchFavorites = async () => {
            setFavoritesLoading(true);
            try {
                const res = await fetch('/api/watchlist');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const syms = data.map((item: any) => item.symbol);
                    setFavorites(syms);
                    setSymbol(syms[0]); // auto-select first favorite
                }
            } catch (e) {
                console.error('Failed to fetch watchlist:', e);
            } finally {
                setFavoritesLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    // Search symbols via Finnhub
    const searchSymbols = async (query: string) => {
        if (!query || query.length < 1) {
            setSearchOptions([]);
            return;
        }
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSearchOptions(data);
            }
        } catch (e) {
            console.error('Search error:', e);
        }
    };

    const runBacktest = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        setPage(0); // Reset page on new run
        try {
            const res = await fetch(`/api/backtest?symbol=${symbol.toUpperCase()}&days=${days}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Title */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2,
                        background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(167, 139, 250, 0.3)',
                    }}>
                        <Activity size="22" color="white" variant="Bold" />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Backtest Accuracy
                    </Typography>
                    <Chip label="BETA" size="small" sx={{
                        bgcolor: 'rgba(167, 139, 250, 0.15)',
                        color: '#a78bfa',
                        fontSize: '0.65rem',
                        height: 22,
                        fontWeight: 700,
                    }} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    จำลองการทำนายด้วย Algorithm logic ย้อนหลัง เพื่อตรวจสอบความแม่นยำ
                </Typography>
            </Box>

            {/* Controls Card */}
            <div className="glass-card" style={{ marginBottom: 32 }}>
                <Stack spacing={3}>
                    {/* Symbol Selection */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{
                                textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', fontWeight: 600
                            }}>
                                ⭐ หุ้นจากรายการโปรด
                            </Typography>
                            {!favoritesLoading && favorites.length > 0 && (
                                <Chip
                                    label={`${favorites.length} รายการ`}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.58rem', bgcolor: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 600 }}
                                />
                            )}
                        </Stack>

                        {/* Favorites chips or Skeleton */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 2.5 }}>
                            {favoritesLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rounded"
                                        width={70 + i * 8}
                                        height={34}
                                        sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
                                    />
                                ))
                            ) : favorites.length > 0 ? (
                                favorites.map(s => (
                                    <Button
                                        key={s}
                                        size="small"
                                        variant={symbol === s ? 'contained' : 'outlined'}
                                        onClick={() => { setSymbol(s); setSearchInput(''); }}
                                        startIcon={<Star size="12" color={symbol === s ? 'white' : '#fbbf24'} variant="Bold" />}
                                        sx={{
                                            minWidth: 0, px: 1.8, py: 0.6, fontSize: '0.75rem',
                                            borderRadius: 2,
                                            borderColor: symbol === s ? 'primary.main' : 'rgba(255,255,255,0.1)',
                                            color: symbol === s ? 'white' : 'text.secondary',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: '#0ea5e9', color: '#0ea5e9', bgcolor: 'rgba(14,165,233,0.05)' }
                                        }}
                                    >
                                        {s}
                                    </Button>
                                ))
                            ) : (
                                <Typography variant="caption" color="text.secondary" sx={{ py: 1, fontSize: '0.75rem' }}>
                                    ยังไม่มีรายการโปรด — ค้นหาหุ้นด้านล่าง หรือเพิ่มจากหน้าวิเคราะห์
                                </Typography>
                            )}
                        </Stack>

                        {/* Search Box */}
                        <Box sx={{
                            p: 2, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <Typography variant="caption" color="text.secondary" sx={{
                                display: 'block', mb: 1.5, fontSize: '0.65rem',
                                textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
                            }}>
                                🔍 ค้นหาหุ้นอื่น
                            </Typography>
                            <Autocomplete
                                freeSolo
                                options={searchOptions}
                                getOptionLabel={(option: any) => typeof option === 'string' ? option : `${option.symbol} — ${option.description}`}
                                inputValue={searchInput}
                                onInputChange={(_, value) => {
                                    const upperValue = value.toUpperCase();
                                    setSearchInput(upperValue);
                                    searchSymbols(upperValue);
                                }}
                                onChange={(_, value) => {
                                    if (value) {
                                        const sym = typeof value === 'string' ? value.toUpperCase() : value.symbol;
                                        setSymbol(sym);
                                        setSearchInput('');
                                    }
                                }}
                                renderOption={(props, option: any) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <Box key={key} component="li" {...optionProps} sx={{
                                            display: 'flex', justifyContent: 'space-between', gap: 2,
                                            py: 1.2, px: 2,
                                            '&:hover': { bgcolor: 'rgba(14,165,233,0.08) !important' }
                                        }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>{option.symbol}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {option.description}
                                                </Typography>
                                            </Box>
                                            <Chip label={option.type} size="small" sx={{ fontSize: '0.55rem', height: 18, bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />
                                        </Box>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="พิมพ์ชื่อหุ้น เช่น GOOGL, AMD, SOFI..."
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchNormal1 size="18" color="#64748b" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            maxWidth: 500,
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.04)',
                                                borderRadius: 2.5,
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                                '&:hover fieldset': { borderColor: 'rgba(14,165,233,0.3)' },
                                                '&.Mui-focused fieldset': { borderColor: '#0ea5e9', borderWidth: 1 },
                                            },
                                        }}
                                    />
                                )}
                                sx={{
                                    '& .MuiAutocomplete-paper': {
                                        bgcolor: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        mt: 0.5,
                                    }
                                }}
                            />

                            {/* Currently selected indicator (if custom symbol) */}
                            {symbol && !favorites.includes(symbol) && (
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>เลือกแล้ว:</Typography>
                                    <Chip
                                        label={symbol}
                                        size="small"
                                        onDelete={() => { setSymbol(favorites[0] || ''); }}
                                        sx={{
                                            bgcolor: 'rgba(14,165,233,0.12)', color: '#38bdf8',
                                            fontWeight: 700, fontSize: '0.75rem',
                                            '& .MuiChip-deleteIcon': { color: 'rgba(56,189,248,0.5)', '&:hover': { color: '#38bdf8' } }
                                        }}
                                    />
                                </Stack>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.08 }} />

                    {/* Period Selection */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{
                            mb: 1.5, display: 'block', textTransform: 'uppercase',
                            letterSpacing: 1, fontSize: '0.65rem', fontWeight: 600
                        }}>
                            ช่วงเวลา
                        </Typography>
                        <ToggleButtonGroup
                            value={days}
                            exclusive
                            onChange={(_, v) => v && setDays(v)}
                            size="small"
                            sx={{ gap: 0.5 }}
                        >
                            {PERIODS.map(p => (
                                <ToggleButton
                                    key={p.days}
                                    value={p.days}
                                    sx={{
                                        color: 'text.secondary',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        fontSize: '0.75rem',
                                        px: 2.5,
                                        borderRadius: '8px !important',
                                        transition: 'all 0.2s',
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(14,165,233,0.15)',
                                            color: '#0ea5e9',
                                            borderColor: 'rgba(14,165,233,0.3)',
                                            fontWeight: 700,
                                        }
                                    }}
                                >
                                    {p.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    <Divider sx={{ opacity: 0.08 }} />

                    {/* Run Button */}
                    <Box>
                        <Button
                            variant="contained"
                            onClick={runBacktest}
                            disabled={loading || !symbol}
                            startIcon={loading ? <CircularProgress size={16} /> : <Activity size={18} color="white" variant="Bold" />}
                            sx={{
                                bgcolor: '#0ea5e9',
                                '&:hover': { bgcolor: '#0284c7', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)' },
                                fontWeight: 700, px: 5, py: 1.2, borderRadius: 2.5,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? 'กำลังวิเคราะห์...' : symbol ? `Run Backtest — ${symbol}` : 'เลือกหุ้นก่อน'}
                        </Button>
                        {loading && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontSize: '0.7rem' }}>
                                กำลังจำลองการทำนายทุกวันย้อนหลัง {days} วัน...
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </div>

            {/* Error */}
            {error && (
                <Paper elevation={0} sx={{
                    p: 2.5, bgcolor: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)', mb: 3, borderRadius: 3
                }}>
                    <Typography color="#f87171" variant="body2">❌ {error}</Typography>
                </Paper>
            )}

            {/* Results */}
            {result && (
                <Box>
                    {/* Summary Header */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {result.symbol}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">—</Typography>
                        <Typography variant="body2" color="text.secondary">ย้อนหลัง {result.period}</Typography>
                        <Chip
                            label={`${result.totalPredictions} การทำนาย`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', fontSize: '0.65rem', fontWeight: 600 }}
                        />
                    </Stack>

                    {/* Main Accuracy Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        {/* Overall */}
                        <div className="glass-card">
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>Overall Accuracy</Typography>
                            <Typography variant="h3" className="font-mono" sx={{ fontWeight: 900, color: result.overallAccuracy >= 60 ? '#4ade80' : '#fbbf24', mt: 1 }}>
                                {result.overallAccuracy}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={result.overallAccuracy}
                                sx={{
                                    mt: 1.5, height: 4, borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '& .MuiLinearProgress-bar': { bgcolor: result.overallAccuracy >= 60 ? '#4ade80' : '#fbbf24' }
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                                ถูก {Math.round(result.totalPredictions * result.overallAccuracy / 100)} / {result.totalPredictions} ครั้ง
                            </Typography>
                        </div>

                        {/* Price Error */}
                        <div className="glass-card">
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>Avg Price Error</Typography>
                            <Typography variant="h3" className="font-mono" sx={{ fontWeight: 900, color: result.avgPriceError < 2 ? '#4ade80' : result.avgPriceError < 4 ? '#fbbf24' : '#f87171', mt: 1 }}>
                                {result.avgPriceError}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                                ความคลาดเคลื่อนของ Target Price เฉลี่ย
                            </Typography>
                        </div>

                        {/* High Confidence */}
                        <div className="glass-card">
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>High Confidence (≥75%)</Typography>
                            <Typography variant="h3" className="font-mono" sx={{ fontWeight: 900, color: '#a78bfa', mt: 1 }}>
                                {result.highConfAccuracy ?? 'N/A'}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                                {result.highConfCount} สัญญาณที่ระบบมั่นใจสูง
                            </Typography>
                        </div>

                        {/* Direction Detail */}
                        <div className="glass-card">
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>สัญญาณ UP vs DOWN</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography className="font-mono" sx={{ color: '#4ade80', fontWeight: 800, fontSize: '1.4rem' }}>{result.upAccuracy ?? '-'}%</Typography>
                                    <Typography variant="caption" sx={{ color: '#4ade80', fontSize: '0.6rem' }}>UP ({result.upCount})</Typography>
                                </Box>
                                <Typography color="text.secondary">/</Typography>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography className="font-mono" sx={{ color: '#f87171', fontWeight: 800, fontSize: '1.4rem' }}>{result.downAccuracy ?? '-'}%</Typography>
                                    <Typography variant="caption" sx={{ color: '#f87171', fontSize: '0.6rem' }}>DOWN ({result.downCount})</Typography>
                                </Box>
                            </Stack>
                        </div>
                    </Box>

                    {/* Confidence Breakdown */}
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5 }}>Accuracy แยกตาม Confidence Level</Typography>
                        <Stack direction="row" spacing={4} justifyContent="center">
                            <AccuracyGauge value={result.highConfAccuracy} label="High ≥75%" count={result.highConfCount} />
                            <AccuracyGauge value={result.midConfAccuracy} label="Mid 60–75%" />
                            <AccuracyGauge value={result.lowConfAccuracy} label="Low <60%" />
                        </Stack>
                        <Box sx={{ mt: 2.5, p: 2, bgcolor: 'rgba(14,165,233,0.05)', borderRadius: 2, border: '1px solid rgba(14,165,233,0.1)' }}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <InfoCircle size="14" color="#0ea5e9" />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    <strong style={{ color: '#0ea5e9' }}>แนะนำ:</strong> ควรซื้อขายเมื่อ Confidence ≥75% เท่านั้น เพราะความแม่นยำสูงกว่ามาก
                                </Typography>
                            </Stack>
                        </Box>
                    </div>

                    {/* Results Table */}
                    <div className="glass-card">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>รายละเอียดการทำนายทั้งหมด ({result.results.length} วัน)</Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        {['วันที่', 'ราคา', 'ระบบทำนาย', 'Confidence', 'Target', 'ราคาจริง (+1วัน)', 'เปลี่ยน%', 'ผล'].map(h => (
                                            <Box component="th" key={h} sx={{ py: 1.2, px: 1.5, textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    {[...result.results]
                                        .reverse()
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((r: any, i: number) => (
                                            <Box component="tr" key={i} sx={{
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                transition: 'background 0.15s',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                                            }}>
                                                <Box component="td" sx={{ py: 1, px: 1.5, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{r.date}</Box>
                                                <Box component="td" className="font-mono" sx={{ py: 1, px: 1.5, fontWeight: 600 }}>${r.price}</Box>
                                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                                    <Chip
                                                        size="small"
                                                        label={r.predictedTrend}
                                                        sx={{
                                                            bgcolor: r.predictedTrend === 'UP' ? 'rgba(74,222,128,0.12)' : r.predictedTrend === 'DOWN' ? 'rgba(248,113,113,0.12)' : 'rgba(148,163,184,0.12)',
                                                            color: r.predictedTrend === 'UP' ? '#4ade80' : r.predictedTrend === 'DOWN' ? '#f87171' : '#94a3b8',
                                                            fontSize: '0.6rem', height: 20, fontWeight: 700
                                                        }}
                                                    />
                                                </Box>
                                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                                    <Typography className="font-mono" sx={{ fontSize: '0.7rem', color: r.confidence >= 75 ? '#a78bfa' : r.confidence >= 60 ? '#fbbf24' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                                        {r.confidence}%
                                                    </Typography>
                                                </Box>
                                                <Box component="td" className="font-mono" sx={{ py: 1, px: 1.5, color: 'rgba(255,255,255,0.6)' }}>${r.targetPrice.toFixed(2)}</Box>
                                                <Box component="td" className="font-mono" sx={{ py: 1, px: 1.5, fontWeight: 600 }}>${r.actualPrice}</Box>
                                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                                    <Typography className="font-mono" sx={{ fontSize: '0.7rem', color: r.actualChangePct > 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                                                        {r.actualChangePct > 0 ? '+' : ''}{r.actualChangePct}%
                                                    </Typography>
                                                </Box>
                                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
                                                        {r.correct ? '✅' : '❌'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                </Box>
                            </Box>
                        </Box>
                        <TablePagination
                            rowsPerPageOptions={[15, 30, 50, 100]}
                            component="div"
                            count={result.results.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                color: 'text.secondary',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s',
                                '.MuiTablePagination-selectIcon': { color: 'rgba(255,255,255,0.5)' },
                                '.MuiTablePagination-actions': { color: '#0ea5e9' }
                            }}
                        />
                    </div>
                </Box>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
                <Box sx={{ textAlign: 'center', py: 12, color: 'rgba(255,255,255,0.15)' }}>
                    <Box sx={{
                        width: 80, height: 80, borderRadius: 3, mx: 'auto', mb: 3,
                        bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Activity size="36" color="currentColor" />
                    </Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 0.5 }}>เลือก Symbol และ Period แล้วกด Run Backtest</Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                        ระบบจะจำลองการทำนายทุกวันย้อนหลัง แล้วตรวจสอบว่าถูกกี่ %
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
