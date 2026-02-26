'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Breadcrumbs,
    Link as MuiLink,
    TablePagination,
    Stack,
    TextField,
    Autocomplete
} from '@mui/material';
import {
    ArrowLeft2,
    Calendar,
    TickCircle,
    CloseCircle,
    TrendUp,
    TrendDown,
    Activity,
    SearchNormal1
} from 'iconsax-react';
import Link from 'next/link';

interface PredictionRecord {
    id: number;
    symbol: string;
    date: string;
    trend: 'UP' | 'DOWN' | 'Neutral';
    confidence: number;
    targetPrice: number;
    actualPrice: number;
    reasoning: string;
}

export default function PredictionHistoryPage() {
    const [history, setHistory] = useState<PredictionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    const historyArray = Array.isArray(history) ? history : [];

    const filteredHistory = searchTerm
        ? historyArray.filter(item => item.symbol === searchTerm)
        : historyArray;

    const uniqueSymbols = Array.from(new Set(historyArray.map(item => item.symbol))).sort();

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/predictions');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error(`API error (${res.status}):`, errorData);
                setHistory([]);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setHistory(data);
            } else {
                setHistory([]);
                console.error('API returned unexpected format (not an array):', data);
            }
        } catch (e) {
            console.error('Fetch history failed:', e);
            setHistory([]);
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

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>
                    Analysis <span style={{ color: '#0284c7' }}>History</span>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    บันทึกการวิเคราะห์ย้อนหลังและผลการทำนายแนวโน้มหุ้นรายบุคคล
                </Typography>
            </Box>

            <Box sx={{
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'center' }
            }}>
                <Autocomplete
                    options={uniqueSymbols}
                    value={searchTerm}
                    fullWidth={false}
                    onChange={(event, newValue) => {
                        setSearchTerm(newValue);
                        setPage(0);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Filter by Symbol"
                            variant="outlined"
                            size="small"
                            sx={{ width: 250 }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1, color: 'text.secondary' }}>
                                        <SearchNormal1 size="16" />
                                        {params.InputProps.startAdornment}
                                    </Stack>
                                ),
                            }}
                        />
                    )}
                    sx={{
                        width: { xs: '100%', sm: 250 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.02)',
                        }
                    }}
                />
                {searchTerm && (
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredHistory.length} results for <b>{searchTerm}</b>
                    </Typography>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : historyArray.length === 0 ? (
                <Paper sx={{ p: 10, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                    <Activity size="48" color="#94a3b8" variant="Outline" />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>ยังไม่มีประวัติการวิเคราะห์ในฐานข้อมูล</Typography>
                </Paper>
            ) : (
                <Box>
                    {/* Desktop View (Table) */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            bgcolor: 'rgba(30, 41, 59, 0.4)',
                            borderRadius: 4,
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden'
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>SYMBOL</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>DATE</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>TREND</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>ACCURACY</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>PRICE @ SNAPSHOT</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>TARGET</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>REASONING</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0ea5e9' }}>
                                                {row.symbol}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                <Calendar size="14" /> {formatDate(row.date)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={row.trend === 'UP' ? 'BULLISH' : 'BEARISH'}
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: '0.65rem',
                                                    borderRadius: 1,
                                                    bgcolor: row.trend === 'UP' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                    color: row.trend === 'UP' ? '#4ade80' : '#f87171',
                                                    border: `1px solid ${row.trend === 'UP' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" className="font-mono" sx={{ fontWeight: 800 }}>
                                                {row.confidence.toFixed(1)}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" className="font-mono" sx={{ fontWeight: 700 }}>
                                                ${row.actualPrice?.toFixed(2) || '---'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" className="font-mono" sx={{ fontWeight: 900, color: '#38bdf8' }}>
                                                ${row.targetPrice?.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 250 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {row.reasoning}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Mobile View (Cards) */}
                    <Stack spacing={2} sx={{ display: { xs: 'flex', lg: 'none' } }}>
                        {filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <Paper
                                key={row.id}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{row.symbol}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                                            <Calendar size="12" /> {formatDate(row.date)}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        size="small"
                                        label={row.trend === 'UP' ? 'BULLISH' : 'BEARISH'}
                                        sx={{
                                            fontWeight: 900,
                                            fontSize: '0.6rem',
                                            borderRadius: 1,
                                            bgcolor: row.trend === 'UP' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                            color: row.trend === 'UP' ? '#4ade80' : '#f87171'
                                        }}
                                    />
                                </Stack>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>Analysis Price</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>${row.actualPrice?.toFixed(2) || '---'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>Target Price</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>${row.targetPrice?.toFixed(2)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>Confidence</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.confidence.toFixed(1)}%</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                                        {row.reasoning}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={filteredHistory.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            mt: 2,
                            color: 'text.secondary',
                            borderTop: 'none',
                            '.MuiTablePagination-selectIcon': { color: 'text.secondary' }
                        }}
                    />
                </Box>
            )}
        </Container>
    );
}

