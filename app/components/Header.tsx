'use client';

import React from 'react';
import { Box, Stack, Button, Typography, Container, Chip, Avatar, Tooltip, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Divider } from '@mui/material';
import { Cpu, Activity, Chart as ChartIcon, InfoCircle, Clock, Ranking, LampCharge, WalletMoney, Logout, Login, SecurityUser, HambergerMenu, CloseCircle, Flash, Setting2, People } from 'iconsax-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const PUBLIC_NAV = [
    { label: 'วิเคราะห์', href: '/', icon: Cpu, color: '#0ea5e9' },
    { label: 'Market Pulse', href: '/market', icon: Activity, color: '#38bdf8' },
    { label: 'หุ้นแนะนำ', href: '/recommendations', icon: Ranking, color: '#fbbf24' },
];

const AUTH_NAV = [
    { label: 'My Signals', href: '/signals', icon: Flash, color: '#a78bfa' },
    { label: 'Portfolio', href: '/portfolio', icon: WalletMoney, color: '#0ea5e9' },
    { label: 'ประวัติ', href: '/history', icon: Activity, color: '#38bdf8' },
];

const renderNavButton = (item: typeof PUBLIC_NAV[0], pathname: string) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <Button
                size="small"
                startIcon={<Icon size="16" color={isActive ? item.color : '#94a3b8'} variant={isActive ? 'Bold' : 'Outline'} />}
                sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 2,
                    bgcolor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)',
                    },
                }}
            >
                {item.label}
            </Button>
        </Link>
    );
};

const renderNavListItem = (item: typeof PUBLIC_NAV[0], pathname: string, onClose: () => void) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
        <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
            <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }} onClick={onClose}>
                <ListItemButton
                    sx={{
                        borderRadius: 2,
                        bgcolor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                        border: isActive ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon size="20" color={isActive ? item.color : '#94a3b8'} variant={isActive ? 'Bold' : 'Outline'} />
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: isActive ? 800 : 500,
                            color: isActive ? 'white' : 'text.secondary'
                        }}
                    />
                </ListItemButton>
            </Link>
        </ListItem>
    );
};

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
);

export default function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setMobileOpen(open);
    };

    const isSuspended = (session?.user as any)?.status === 'suspended';

    return (
        <>
            {/* Suspension Banner */}
            {isSuspended && (
                <Box sx={{
                    bgcolor: 'rgba(251, 191, 36, 0.1)',
                    borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                    py: 1, px: 2, textAlign: 'center',
                    position: 'sticky', top: 0, zIndex: 1200,
                }}>
                    <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.75rem' }}>
                        ⚠️ บัญชีของคุณถูกระงับชั่วคราว — คุณสามารถดูข้อมูลได้ แต่ไม่สามารถวิเคราะห์หุ้น เพิ่ม Watchlist หรือ Portfolio ได้
                    </Typography>
                </Box>
            )}
            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: isSuspended ? 37 : 0,
                    zIndex: 1100,
                    backdropFilter: 'blur(20px)',
                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Container maxWidth="xl">
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ py: 1.5 }}
                    >
                        {/* Logo */}
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer' }}>
                                <Box
                                    component="img"
                                    src="/images/logo.png"
                                    alt="TradingChill Logo"
                                    sx={{
                                        width: 42,
                                        height: 'auto',
                                        mixBlendMode: 'screen',
                                        objectFit: 'contain'
                                    }}
                                />
                                <Box>
                                    <Typography
                                        sx={{
                                            fontFamily: '"Comfortaa", cursive',
                                            fontWeight: 700,
                                            fontSize: '1.2rem',
                                            letterSpacing: -0.2,
                                            color: 'white',
                                            lineHeight: 1,
                                        }}
                                    >
                                        Trading<span style={{ color: '#0284c7' }}>Chill</span>
                                    </Typography>
                                </Box>
                            </Stack>
                        </Link>

                        {/* Desktop Navigation & Auth */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                {PUBLIC_NAV.map((item) => renderNavButton(item, pathname))}
                            </Stack>

                            {/* Auth Section */}
                            <Box sx={{ ml: 1, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                {session ? (
                                    <>
                                        <Tooltip title={session.user?.name || 'User'}>
                                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                                                <Avatar
                                                    src={session.user?.image || ''}
                                                    sx={{ width: 34, height: 34, border: menuOpen ? '2px solid #0ea5e9' : '2px solid rgba(14, 165, 233, 0.5)', transition: '0.2s' }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={menuOpen}
                                            onClose={() => setAnchorEl(null)}
                                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            PaperProps={{
                                                sx: {
                                                    mt: 1.5,
                                                    minWidth: 220,
                                                    bgcolor: '#0f172a',
                                                    backgroundImage: 'none',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 3,
                                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                                    overflow: 'visible',
                                                    '&::before': {
                                                        content: '""',
                                                        display: 'block',
                                                        position: 'absolute',
                                                        top: 0, right: 16,
                                                        width: 10, height: 10,
                                                        bgcolor: '#0f172a',
                                                        transform: 'translateY(-50%) rotate(45deg)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderBottom: 'none',
                                                        borderRight: 'none',
                                                        zIndex: 1,
                                                    }
                                                }
                                            }}
                                        >
                                            {/* Profile Header */}
                                            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar src={session.user?.image || ''} sx={{ width: 36, height: 36, border: '2px solid #0ea5e9' }} />
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                                                            {session.user?.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                                                            {session.user?.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* Menu Label */}
                                            <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, px: 2.5, pt: 1.5, pb: 0.5, display: 'block' }}>
                                                เมนูสมาชิก
                                            </Typography>

                                            {/* Auth Nav Items */}
                                            {AUTH_NAV.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setAnchorEl(null)}>
                                                        <MenuItem sx={{
                                                            px: 2.5, py: 1.2, mx: 1, my: 0.3, borderRadius: 2,
                                                            bgcolor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                                        }}>
                                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                                <Icon size="18" color={isActive ? item.color : '#94a3b8'} variant={isActive ? 'Bold' : 'Outline'} />
                                                            </ListItemIcon>
                                                            <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'white' : 'text.secondary', fontSize: '0.85rem' }}>
                                                                {item.label}
                                                            </Typography>
                                                        </MenuItem>
                                                    </Link>
                                                );
                                            })}

                                            {/* Admin Section - only for admin */}
                                            {session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && [
                                                <Divider key="admin-divider" sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />,
                                                <Typography key="admin-label" variant="caption" sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, px: 2.5, pt: 0.5, pb: 0.5, display: 'block' }}>
                                                    ผู้ดูแลระบบ
                                                </Typography>,
                                                <Link key="admin-stocks" href="/admin" style={{ textDecoration: 'none' }} onClick={() => setAnchorEl(null)}>
                                                    <MenuItem sx={{ px: 2.5, py: 1.2, mx: 1, my: 0.3, borderRadius: 2, bgcolor: pathname === '/admin' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                                            <Setting2 size="18" color={pathname === '/admin' ? '#0ea5e9' : '#94a3b8'} variant={pathname === '/admin' ? 'Bold' : 'Outline'} />
                                                        </ListItemIcon>
                                                        <Typography variant="body2" sx={{ fontWeight: pathname === '/admin' ? 700 : 500, color: pathname === '/admin' ? 'white' : 'text.secondary', fontSize: '0.85rem' }}>
                                                            จัดการหุ้นแนะนำ
                                                        </Typography>
                                                    </MenuItem>
                                                </Link>,
                                                <Link key="admin-users" href="/admin/users" style={{ textDecoration: 'none' }} onClick={() => setAnchorEl(null)}>
                                                    <MenuItem sx={{ px: 2.5, py: 1.2, mx: 1, my: 0.3, borderRadius: 2, bgcolor: pathname === '/admin/users' ? 'rgba(14, 165, 233, 0.1)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                                            <People size="18" color={pathname === '/admin/users' ? '#0ea5e9' : '#94a3b8'} variant={pathname === '/admin/users' ? 'Bold' : 'Outline'} />
                                                        </ListItemIcon>
                                                        <Typography variant="body2" sx={{ fontWeight: pathname === '/admin/users' ? 700 : 500, color: pathname === '/admin/users' ? 'white' : 'text.secondary', fontSize: '0.85rem' }}>
                                                            จัดการสมาชิก
                                                        </Typography>
                                                    </MenuItem>
                                                </Link>,
                                            ]}

                                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                                            {/* Logout */}
                                            <MenuItem
                                                onClick={() => { setAnchorEl(null); signOut(); }}
                                                sx={{
                                                    px: 2.5, py: 1.2, mx: 1, mb: 0.5, borderRadius: 2,
                                                    '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.08)' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <Logout size="18" color="#f87171" variant="TwoTone" />
                                                </ListItemIcon>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f87171', fontSize: '0.85rem' }}>
                                                    ออกจากระบบ
                                                </Typography>
                                            </MenuItem>
                                        </Menu>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => signIn('google')}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<GoogleIcon />}
                                        sx={{
                                            borderRadius: 2,
                                            px: 2,
                                            py: 0.8,
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: 'white',
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.08)',
                                                borderColor: 'rgba(255,255,255,0.4)'
                                            },
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        เข้าสู่ระบบด้วย Google
                                    </Button>
                                )}
                            </Box>
                        </Stack>

                        {/* Mobile Menu Toggle */}
                        <IconButton
                            onClick={toggleDrawer(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
                        >
                            <HambergerMenu size="24" variant='TwoTone' color="white" />
                        </IconButton>
                    </Stack>
                </Container>

                {/* Mobile Drawer */}
                <Drawer
                    anchor="right"
                    open={mobileOpen}
                    onClose={toggleDrawer(false)}
                    PaperProps={{
                        sx: {
                            width: 280,
                            bgcolor: '#0f172a',
                            backgroundImage: 'none',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            p: 2
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <IconButton onClick={toggleDrawer(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            <CloseCircle size="24" />
                        </IconButton>
                    </Box>

                    {session && (
                        <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={session.user?.image || ''} sx={{ width: 42, height: 42, border: '2px solid #0ea5e9' }} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>{session.user?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{session.user?.email}</Typography>
                                    <Typography variant="caption" sx={{
                                        color: '#0ea5e9',
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        bgcolor: 'rgba(14,165,233,0.1)',
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 1,
                                        mt: 0.5,
                                        display: 'inline-block'
                                    }}>
                                        ID: {(session.user as any)?.id}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}

                    <List sx={{ px: 0 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, pl: 2, mb: 1, display: 'block' }}>
                            ทั่วไป
                        </Typography>
                        {PUBLIC_NAV.map((item) => renderNavListItem(item, pathname, () => setMobileOpen(false)))}
                    </List>

                    {session && (
                        <List sx={{ px: 0 }}>
                            <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, pl: 2, mb: 1, mt: 1, display: 'block' }}>
                                สมาชิก
                            </Typography>
                            {AUTH_NAV.map((item) => renderNavListItem(item, pathname, () => setMobileOpen(false)))}
                        </List>
                    )}

                    {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <List sx={{ px: 0 }}>
                            <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, pl: 2, mb: 1, mt: 1, display: 'block' }}>
                                ผู้ดูแลระบบ
                            </Typography>
                            {renderNavListItem({ label: 'จัดการหุ้นแนะนำ', href: '/admin', icon: Setting2, color: '#0ea5e9' }, pathname, () => setMobileOpen(false))}
                            {renderNavListItem({ label: 'จัดการสมาชิก', href: '/admin/users', icon: People, color: '#0ea5e9' }, pathname, () => setMobileOpen(false))}
                        </List>
                    )}

                    <Box sx={{ mt: 'auto', pt: 4 }}>
                        {session ? (
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<Logout size="20" />}
                                onClick={() => { signOut(); setMobileOpen(false); }}
                                sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, borderColor: 'rgba(244, 63, 94, 0.2)' }}
                            >
                                ออกจากระบบ
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<GoogleIcon />}
                                onClick={() => { signIn('google'); setMobileOpen(false); }}
                                sx={{ borderRadius: 2, py: 1.5, fontWeight: 800, bgcolor: 'white', color: '#0f172a', '&:hover': { bgcolor: '#e2e8f0' } }}
                            >
                                Login with Google
                            </Button>
                        )}
                    </Box>
                </Drawer>
            </Box>
        </>
    );
}
