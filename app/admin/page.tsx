'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Container,
    Box,
    Typography,
    Card,
    Stack,
    TextField,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import {
    Add,
    Trash,
    Refresh2,
    Setting2,
    TrendUp,
    TrendDown,
    Activity,
    SearchNormal1,
    ArrowRight2,
    Chart
} from 'iconsax-react';
import Link from 'next/link';
import { Dashboard } from '@mui/icons-material';

interface StockData {
    id: number;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    predictionTrend: string;
    predictionConfidence: number;
    date: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [newSymbol, setNewSymbol] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => {
        if (isAdmin) {
            fetchStocks();
        }
    }, [isAdmin]);

    const fetchStocks = async () => {
        try {
            const res = await fetch('/api/admin/stocks');
            const data = await res.json();
            if (Array.isArray(data)) setStocks(data);
        } catch (error) {
            console.error('Failed to fetch stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSymbol) return;
        setAdding(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/stocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: newSymbol })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `เพิ่ม ${newSymbol.toUpperCase()} สำเร็จและวิเคราะห์ข้อมูลเบื้องต้นเรียบร้อย` });
                setNewSymbol('');
                fetchStocks();
            } else {
                setMessage({ type: 'error', text: data.error || 'ไม่สามารถเพิ่มหุ้นได้' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteStock = async (symbol: string) => {
        if (!confirm(`คุณแน่ใจว่าต้องการลบ ${symbol} ออกจากระบบ?`)) return;
        try {
            const res = await fetch(`/api/admin/stocks?symbol=${symbol}`, { method: 'DELETE' });
            if (res.ok) {
                setStocks(stocks.filter(s => s.symbol !== symbol));
            }
        } catch (error) {
            console.error('Failed to delete stock:', error);
        }
    };

    const handleSyncAll = async () => {
        setSyncing(true);
        setMessage(null);
        try {
            const res = await fetch('/api/cron/sync');
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `อัปเดตข้อมูลหุ้นทั้งหมด ${data.count} รายการเรียบร้อยแล้ว` });
                fetchStocks();
            } else {
                setMessage({ type: 'error', text: data.error || 'การ Sync ล้มเหลว' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการ Sync' });
        } finally {
            setSyncing(false);
        }
    };

    if (status === 'loading') return null;

    if (!isAdmin) {
        return (
            <Container sx={{ py: 10 }}>
                <Alert severity="error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.3)' } }}>
                    <Link href="/" passHref style={{ textDecoration: 'none' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>Home</Typography>
                    </Link>
                    <Typography variant="caption" color="text.primary">Admin Dashboard</Typography>
                </Breadcrumbs>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ p: 0.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)' }}>
                                <Chart color="#0ea5e9" size="22" variant="Bold" />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                                    Admin Dashboard
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    จัดการหุ้นที่ต้องการให้ระบบ Scan และวิเคราะห์อัตโนมัติ
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                        <Link href="/admin/users" passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant="outlined"
                                startIcon={<SearchNormal1 size="18" variant="Outline" color="#0ea5e9" />}
                                sx={{
                                    borderRadius: 3,
                                    borderColor: 'rgba(14, 165, 233, 0.3)',
                                    color: '#0ea5e9',
                                    fontWeight: 700,
                                    height: 48,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.05)' }
                                }}
                            >
                                จัดการสมาชิก
                            </Button>
                        </Link>
                        <Button
                            variant="contained"
                            onClick={handleSyncAll}
                            disabled={syncing}
                            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <Refresh2 size="20" variant="Bold" color="#000" />}
                            sx={{
                                bgcolor: '#0ea5e9',
                                fontWeight: 800,
                                borderRadius: 3,
                                px: 3,
                                height: 48,
                                boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                                '&:hover': { bgcolor: '#0284c7' }
                            }}
                        >
                            {syncing ? 'กำลังประมวลผล...' : 'รันระบบ Sync สำหรับหุ้นทั้งหมด'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 3, borderRadius: 3, bgcolor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#4ade80' : '#f87171' }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' }, gap: 4 }}>
                {/* Left Side: Add Stock */}
                <Box>
                    <Card sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Add size="24" color="#0ea5e9" variant="Bold" /> เพิ่มหุ้นเข้าระบบ
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            ระบบจะดึงข้อมูล Quantitative มาวิเคราะห์ทันทีหลังกดเพิ่ม
                        </Typography>

                        <form onSubmit={handleAddStock}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="เช่น NVDA, AAPL, BTC-USD"
                                    value={newSymbol}
                                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                                    disabled={adding}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '&:hover fieldset': { borderColor: '#0ea5e9' },
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={adding || !newSymbol}
                                    sx={{
                                        height: 48,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#0ea5e9' }
                                    }}
                                >
                                    {adding ? <CircularProgress size={20} /> : 'เพิ่มเข้าสู่ระบบ'}
                                </Button>
                            </Stack>
                        </form>

                        <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                            <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 700, display: 'block', mb: 1 }}>
                                พฤติกรรมของระบบ
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                                <li>หุ้นที่เพิ่มจะโผล่ในหน้า Recommendations</li>
                                <li>ระบบจะ Auto Sync ตามตารางที่คุณตั้งไว้</li>
                                <li>เหมาะสำหรับคัดกรองหุ้นคุณภาพ</li>
                            </Typography>
                        </Box>
                    </Card>
                </Box>

                {/* Right Side: Stock List */}
                <Box>
                    <TableContainer component={Paper} sx={{
                        borderRadius: 2,
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'none'
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>SYMBOL</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>TREND</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>PRICE</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>CONFIDENCE</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>LAST SYNC</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="right">MANAGE</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={30} />
                                        </TableCell>
                                    </TableRow>
                                ) : stocks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">ยังไม่มีหุ้นในระบบ Sync</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stocks
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((stock) => (
                                            <TableRow key={stock.symbol} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: '0.2s' }}>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 900, color: '#0ea5e9' }}>{stock.symbol}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={stock.predictionTrend}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: stock.predictionTrend === 'UP' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: stock.predictionTrend === 'UP' ? '#4ade80' : '#f87171',
                                                            fontWeight: 800,
                                                            fontSize: '0.65rem'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 700 }}>${stock.price?.toFixed(2)}</Typography>
                                                    <Typography variant="caption" sx={{ color: stock.change >= 0 ? '#22c55e' : '#ef4444' }}>
                                                        {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                        {stock.predictionConfidence?.toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(stock.date).toLocaleString('th-TH')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <IconButton size="small" onClick={() => (window.location.href = `/?symbol=${stock.symbol}`)} sx={{ color: 'text.secondary', '&:hover': { color: '#0ea5e9' } }}>
                                                            <SearchNormal1 size="18" variant="Outline" color="#0ea5e9" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteStock(stock.symbol)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                                                            <Trash size="18" variant="Outline" color="#ef4444" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={stocks.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            labelRowsPerPage="แสดงต่อหน้า:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
                            sx={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                color: 'text.secondary',
                                '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
                                '.MuiTablePagination-actions button': { color: 'text.secondary' },
                            }}
                        />
                    </TableContainer>
                </Box>
            </Box>
        </Container>
    );
}
