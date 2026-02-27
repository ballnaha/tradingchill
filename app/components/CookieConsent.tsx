'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Slide } from '@mui/material';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'tradingchill_cookie_consent';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Delay showing the banner to avoid layout shift
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
        setShow(false);
        // Optionally disable Google Analytics if declined
        if (typeof window !== 'undefined') {
            (window as any)[`ga-disable-${process.env.NEXT_PUBLIC_GA_ID}`] = true;
        }
    };

    if (!show) return null;

    return (
        <Slide direction="up" in={show} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    p: 0,
                }}
            >
                <Box
                    sx={{
                        maxWidth: 720,
                        mx: 'auto',
                        mb: { xs: 0, sm: 2 },
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: { xs: 0, sm: 4 },
                        bgcolor: 'rgba(15, 23, 42, 0.97)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
                        boxShadow: '0 -4px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                                🍪 เว็บไซต์นี้ใช้คุกกี้
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.7, display: 'block' }}>
                                เราใช้คุกกี้เพื่อให้บริการที่ดีขึ้นและวิเคราะห์การใช้งานเว็บไซต์ผ่าน Google Analytics
                                โดยไม่เก็บข้อมูลส่วนบุคคลที่ละเอียดอ่อน การดำเนินการต่อถือว่าท่านยอมรับ{' '}
                                <Link href="/privacy" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                                    นโยบายความเป็นส่วนตัว
                                </Link>{' '}
                                และ{' '}
                                <Link href="/terms" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                                    ข้อกำหนดการใช้งาน
                                </Link>
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                            <Button
                                onClick={handleDecline}
                                variant="text"
                                size="small"
                                sx={{
                                    color: '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    textTransform: 'none',
                                    px: 2,
                                    '&:hover': { color: '#94a3b8', bgcolor: 'rgba(255,255,255,0.03)' }
                                }}
                            >
                                ปฏิเสธ
                            </Button>
                            <Button
                                onClick={handleAccept}
                                variant="contained"
                                size="small"
                                sx={{
                                    bgcolor: '#0284c7',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    textTransform: 'none',
                                    px: 3,
                                    borderRadius: 2,
                                    boxShadow: '0 2px 12px rgba(2, 132, 199, 0.3)',
                                    '&:hover': { bgcolor: '#0369a1' }
                                }}
                            >
                                ยอมรับทั้งหมด
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        </Slide>
    );
}
