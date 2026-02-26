'use client';

import React from 'react';
import { Box, Stack, Button, Typography, Container, Chip, Avatar, Tooltip, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Cpu, Activity, Chart as ChartIcon, InfoCircle, Clock, Ranking, LampCharge, WalletMoney, Logout, Login, SecurityUser, HambergerMenu, CloseCircle } from 'iconsax-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const NAV_ITEMS = [
    { label: 'วิเคราะห์', href: '/', icon: Cpu, color: '#0ea5e9' },
    { label: 'Market Pulse', href: '/market', icon: Activity, color: '#38bdf8' },
    { label: 'Portfolio', href: '/portfolio', icon: WalletMoney, color: '#0ea5e9' },
    { label: 'หุ้นแนะนำ', href: '/recommendations', icon: Ranking, color: '#fbbf24' },
    { label: 'ประวัติ', href: '/history', icon: Activity, color: '#38bdf8' },
];

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

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setMobileOpen(open);
    };

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                backdropFilter: 'blur(20px)',
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <Container maxWidth="lg">
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
                            {NAV_ITEMS.map((item) => {
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
                            })}
                        </Stack>

                        {/* Auth Section */}
                        <Box sx={{ ml: 1, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            {session ? (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Tooltip title={session.user?.name || 'User'}>
                                        <Avatar
                                            src={session.user?.image || ''}
                                            sx={{ width: 32, height: 32, border: '2px solid rgba(14, 165, 233, 0.5)' }}
                                        />
                                    </Tooltip>
                                    <Button
                                        onClick={() => signOut()}
                                        size="small"
                                        variant="text"
                                        sx={{ color: 'rgba(244, 63, 94, 0.8)', fontWeight: 600, fontSize: '0.75rem', '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244, 63, 94, 0.1)' } }}
                                        startIcon={<Logout size="16" variant="TwoTone" color="rgba(244, 63, 94, 0.8)" />}
                                    >
                                        ออก
                                    </Button>
                                </Stack>
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
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
                                <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }} onClick={() => setMobileOpen(false)}>
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
                    })}
                </List>

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
    );
}
