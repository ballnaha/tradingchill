'use client';

import { InfoCircle, Chart, SecuritySafe, DocumentText, Shield } from 'iconsax-react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, Divider } from '@mui/material';

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                py: 3,
                borderTop: '1px solid rgba(255,255,255,0.03)',
                bgcolor: 'transparent',
            }}
        >
            <Container maxWidth="xl">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
                        © {new Date().getFullYear()} TradingChill. Quantitative Stock Analysis.
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={{ xs: 2, md: 3 }}
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                        {['education', 'backtest', 'privacy', 'terms', 'disclaimer'].map((path) => (
                            <Link
                                key={path}
                                href={`/${path}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'rgba(255,255,255,0.35)',
                                        fontSize: '0.65rem',
                                        fontWeight: 500,
                                        transition: 'color 0.2s',
                                        '&:hover': { color: 'rgba(255,255,255,0.8)' }
                                    }}
                                >
                                    {path === 'education' ? 'คู่มือ' :
                                        path === 'backtest' ? 'Backtest' :
                                            path === 'privacy' ? 'นโยบายความเป็นส่วนตัว' :
                                                path === 'terms' ? 'ข้อกำหนด' : 'ข้อจำกัดความรับผิดชอบ'}
                                </Typography>
                            </Link>
                        ))}
                    </Stack>

                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(248, 113, 113, 0.3)',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            letterSpacing: 0.5
                        }}
                    >
                        NOT INVESTMENT ADVICE
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}

