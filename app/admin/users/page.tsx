'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Container,
    Box,
    Typography,
    Card,
    Stack,
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
    Avatar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
} from '@mui/material';
import {
    Trash,
    Setting2,
    SearchNormal1,
    People,
    Chart,
    Star1,
    WalletMoney,
    Activity,
    ArrowLeft2,
    ShieldTick,
    Edit2,
    Danger,
    TickCircle,
    CloseCircle,
    UserEdit,
    Warning2,
} from 'iconsax-react';
import Link from 'next/link';

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    status: string;
    emailVerified: string | null;
    predictions: number;
    watchlistCount: number;
    portfolioCount: number;
    lastSession: string | null;
    lastPrediction: string | null;
}

const STATUS_OPTIONS = [
    { value: 'active', label: 'เปิดใช้งาน', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)' },
    { value: 'suspended', label: 'ระงับชั่วคราว', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    { value: 'banned', label: 'แบนถาวร', color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' },
];

const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
};

// ── Delete Confirmation Dialog ──
const DeleteDialog = ({
    open,
    user,
    onClose,
    onConfirm,
    deleting,
}: {
    open: boolean;
    user: UserData | null;
    onClose: () => void;
    onConfirm: () => void;
    deleting: boolean;
}) => {
    if (!user) return null;
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#0f172a',
                    backgroundImage: 'none',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 4,
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%',
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid rgba(239, 68, 68, 0.2)',
                    }}>
                        <Danger size="32" color="#f87171" variant="Bold" />
                    </Box>
                </Box>
                <Typography variant="h6" component="span" sx={{ fontWeight: 900, color: 'white', display: 'block' }}>
                    ยืนยันการลบบัญชี
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', px: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Avatar src={user.image || ''} sx={{ width: 40, height: 40, border: '2px solid rgba(239, 68, 68, 0.3)' }} />
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>
                            {user.name || 'ไม่ระบุชื่อ'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    การลบบัญชีจะลบข้อมูลทั้งหมดของสมาชิกคนนี้:
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#f87171' }}>{user.predictions}</Typography>
                        <Typography variant="caption" color="text.secondary">ประวัติวิเคราะห์</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#f87171' }}>{user.watchlistCount}</Typography>
                        <Typography variant="caption" color="text.secondary">Watchlist</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#f87171' }}>{user.portfolioCount}</Typography>
                        <Typography variant="caption" color="text.secondary">Portfolio</Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Warning2 size="16" color="#f87171" variant="Bold" />
                        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700 }}>
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                        </Typography>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 3, pt: 1, gap: 1.5 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    disabled={deleting}
                    sx={{
                        borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    ยกเลิก
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onConfirm}
                    disabled={deleting}
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Trash size="18" variant="Bold" color="#FFF" />}
                    sx={{
                        borderRadius: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
                        bgcolor: '#ef4444', color: 'white',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                        '&:hover': { bgcolor: '#dc2626' },
                    }}
                >
                    {deleting ? 'กำลังลบ...' : 'ยืนยันลบบัญชี'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Edit User Dialog ──
const EditDialog = ({
    open,
    user,
    onClose,
    onSave,
    saving,
}: {
    open: boolean;
    user: UserData | null;
    onClose: () => void;
    onSave: (id: string, name: string, status: string) => void;
    saving: boolean;
}) => {
    const [editName, setEditName] = useState('');
    const [editStatus, setEditStatus] = useState('active');

    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditStatus(user.status || 'active');
        }
    }, [user]);

    if (!user) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#0f172a',
                    backgroundImage: 'none',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: 4,
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }
            }}
        >
            <DialogTitle sx={{ pt: 3, pb: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        bgcolor: 'rgba(14, 165, 233, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <UserEdit size="24" color="#0ea5e9" variant="Bold" />
                    </Box>
                    <Box>
                        <Typography variant="h6" component="span" sx={{ fontWeight: 900, color: 'white', lineHeight: 1.2, display: 'block' }}>
                            แก้ไขข้อมูลสมาชิก
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Avatar src={user.image || ''} sx={{ width: 44, height: 44, border: '2px solid #0ea5e9' }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>
                            {user.name || 'ไม่ระบุชื่อ'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                            ID: {user.id}
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={2.5}>
                    <TextField
                        label="ชื่อผู้ใช้"
                        fullWidth
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.03)',
                                '&:hover fieldset': { borderColor: '#0ea5e9' },
                                '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#0ea5e9' },
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#0ea5e9' } }}>สถานะบัญชี</InputLabel>
                        <Select
                            value={editStatus}
                            label="สถานะบัญชี"
                            onChange={(e) => setEditStatus(e.target.value)}
                            sx={{
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.03)',
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0ea5e9' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0ea5e9' },
                            }}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color }} />
                                        <Typography variant="body2">{opt.label}</Typography>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    disabled={saving}
                    sx={{
                        borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    ยกเลิก
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => onSave(user.id, editName, editStatus)}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <TickCircle size="18" variant="Bold" color="#FFF" />}
                    sx={{
                        borderRadius: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
                        bgcolor: '#0ea5e9', color: 'white',
                        boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                        '&:hover': { bgcolor: '#0284c7' },
                    }}
                >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Main Page ──
export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Delete dialog state
    const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Edit dialog state
    const [editTarget, setEditTarget] = useState<UserData | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setUsers(users.filter(u => u.id !== deleteTarget.id));
                setMessage({ type: 'success', text: `ลบบัญชี ${deleteTarget.name || deleteTarget.email} เรียบร้อยแล้ว` });
                setDeleteTarget(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'ไม่สามารถลบได้' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setDeleting(false);
        }
    };

    const handleEditSave = async (id: string, name: string, userStatus: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, status: userStatus }),
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, name, status: userStatus } : u));
                setMessage({ type: 'success', text: `อัปเดตข้อมูล ${name || 'ผู้ใช้'} เรียบร้อยแล้ว` });
                setEditTarget(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'ไม่สามารถแก้ไขได้' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
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
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.3)' } }}>
                    <Link href="/" passHref style={{ textDecoration: 'none' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>Home</Typography>
                    </Link>
                    <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>Admin</Typography>
                    </Link>
                    <Typography variant="caption" color="text.primary">จัดการสมาชิก</Typography>
                </Breadcrumbs>

                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ p: 0.5, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)' }}>
                                <Box component="img" src="/images/logo.png" alt="Logo" sx={{ width: 36, height: 'auto', mixBlendMode: 'screen' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                                    จัดการสมาชิก
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ดูข้อมูลและจัดการบัญชีสมาชิกทั้งหมดในระบบ
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        <Link href="/admin" passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowLeft2 size="18" variant="Bold" color="#0ea5e9" />}
                                sx={{
                                    borderRadius: 2, borderColor: 'rgba(14, 165, 233, 0.3)', color: '#0ea5e9',
                                    fontWeight: 700, height: 48, textTransform: 'none',
                                    '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.05)' }
                                }}
                            >
                                กลับไปหน้า Admin
                            </Button>
                        </Link>
                    </Stack>
                </Stack>
            </Box>

            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 3, borderRadius: 2, bgcolor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#4ade80' : '#f87171' }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(14, 165, 233, 0.1)' }}>
                            <People size="22" color="#0ea5e9" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>{users.length}</Typography>
                            <Typography variant="caption" color="text.secondary">สมาชิกทั้งหมด</Typography>
                        </Box>
                    </Stack>
                </Card>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
                            <Chart size="22" color="#4ade80" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>{users.reduce((sum, u) => sum + u.predictions, 0)}</Typography>
                            <Typography variant="caption" color="text.secondary">การวิเคราะห์ทั้งหมด</Typography>
                        </Box>
                    </Stack>
                </Card>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(251, 191, 36, 0.1)' }}>
                            <Star1 size="22" color="#fbbf24" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>{users.reduce((sum, u) => sum + u.watchlistCount, 0)}</Typography>
                            <Typography variant="caption" color="text.secondary">หุ้นใน Watchlist</Typography>
                        </Box>
                    </Stack>
                </Card>
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(167, 139, 250, 0.1)' }}>
                            <WalletMoney size="22" color="#a78bfa" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>{users.reduce((sum, u) => sum + u.portfolioCount, 0)}</Typography>
                            <Typography variant="caption" color="text.secondary">พอร์ตทั้งหมด</Typography>
                        </Box>
                    </Stack>
                </Card>
            </Box>

            {/* Users Table */}
            <TableContainer component={Paper} sx={{
                borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none'
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>สมาชิก</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>EMAIL</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="center">STATUS</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="center">วิเคราะห์</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="center">WATCHLIST</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="center">PORTFOLIO</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>ใช้งานล่าสุด</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }} align="right">MANAGE</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">ยังไม่มีสมาชิกในระบบ</Typography>
                                </TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
                            users
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => {
                                    const isAdminUser = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                                    const statusInfo = getStatusInfo(user.status);
                                    return (
                                        <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: '0.2s' }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar src={user.image || ''} sx={{ width: 36, height: 36, border: isAdminUser ? '2px solid #0ea5e9' : '2px solid rgba(255,255,255,0.1)' }} />
                                                        <Box sx={{
                                                            position: 'absolute', bottom: -1, right: -1,
                                                            width: 12, height: 12, borderRadius: '50%',
                                                            bgcolor: statusInfo.color,
                                                            border: '2px solid #0f172a',
                                                        }} />
                                                    </Box>
                                                    <Box>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                                                                {user.name || 'ไม่ระบุชื่อ'}
                                                            </Typography>
                                                            {isAdminUser && (
                                                                <Chip label="ADMIN" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 900, bgcolor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }} />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                                            ID: {user.id.slice(0, 12)}...
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                                                    {user.email || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={statusInfo.label}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.68rem',
                                                        bgcolor: statusInfo.bg,
                                                        color: statusInfo.color,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.predictions}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.75rem',
                                                        bgcolor: user.predictions > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.04)',
                                                        color: user.predictions > 0 ? '#4ade80' : 'text.secondary'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.watchlistCount}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.75rem',
                                                        bgcolor: user.watchlistCount > 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.04)',
                                                        color: user.watchlistCount > 0 ? '#fbbf24' : 'text.secondary'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.portfolioCount}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.75rem',
                                                        bgcolor: user.portfolioCount > 0 ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.04)',
                                                        color: user.portfolioCount > 0 ? '#a78bfa' : 'text.secondary'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(user.lastPrediction || user.lastSession)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    {isAdminUser ? (
                                                        <Tooltip title="Admin account">
                                                            <IconButton size="small" disabled>
                                                                <ShieldTick size="18" color="#0ea5e9" variant="Bold" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : (
                                                        <>
                                                            <Tooltip title="แก้ไขข้อมูล">
                                                                <IconButton size="small" onClick={() => setEditTarget(user)} sx={{ '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' } }}>
                                                                    <Edit2 size="18" color="#0ea5e9" variant="Outline" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="ลบบัญชี">
                                                                <IconButton size="small" onClick={() => setDeleteTarget(user)} sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                                                    <Trash size="18" color="#ef4444" variant="Outline" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        ) : null}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={users.length}
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

            {/* Dialogs */}
            <DeleteDialog
                open={!!deleteTarget}
                user={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                deleting={deleting}
            />
            <EditDialog
                open={!!editTarget}
                user={editTarget}
                onClose={() => setEditTarget(null)}
                onSave={handleEditSave}
                saving={saving}
            />
        </Container>
    );
}
