'use client';

import { InfoCircle, Chart, SecuritySafe, DocumentText, Shield } from 'iconsax-react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, Divider } from '@mui/material';

export default function Footer() {
    const linkStyle = { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 } as const;
    const linkTextSx = { fontSize: '0.75rem', fontWeight: 600, '&:hover': { color: 'white' } } as const;

    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(15, 23, 42, 0.6)',
            }}
        >
            <Container maxWidth="xl">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                    sx={{ py: 4 }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 1, display: 'block' }}>
                            Trading<span style={{ color: '#0284c7' }}>Chill</span>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            © {new Date().getFullYear()} — เครื่องมือวิเคราะห์หุ้นสหรัฐฯ เชิงปริมาณ
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={3}
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: 1.5 }}
                    >
                        <Link href="/education" style={linkStyle}>
                            <InfoCircle size="16" color="#94a3b8" />
                            <Typography variant="caption" color="#94a3b8" sx={linkTextSx}>คู่มือ</Typography>
                        </Link>
                        <Link href="/backtest" style={linkStyle}>
                            <Chart size="16" color="#94a3b8" />
                            <Typography variant="caption" color="#94a3b8" sx={linkTextSx}>Backtest</Typography>
                        </Link>
                        <Link href="/privacy" style={linkStyle}>
                            <SecuritySafe size="16" color="#94a3b8" />
                            <Typography variant="caption" color="#94a3b8" sx={linkTextSx}>นโยบายความเป็นส่วนตัว</Typography>
                        </Link>
                        <Link href="/terms" style={linkStyle}>
                            <DocumentText size="16" color="#94a3b8" />
                            <Typography variant="caption" color="#94a3b8" sx={linkTextSx}>ข้อกำหนดการใช้งาน</Typography>
                        </Link>
                        <Link href="/disclaimer" style={linkStyle}>
                            <Shield size="16" color="#94a3b8" />
                            <Typography variant="caption" color="#94a3b8" sx={linkTextSx}>ข้อจำกัดความรับผิดชอบ</Typography>
                        </Link>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" divider={
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    }>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            FINNHUB & YAHOO
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>
                            NOT INVESTMENT ADVICE
                        </Typography>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

