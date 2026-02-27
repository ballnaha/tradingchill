'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Box, Typography, Button, Stack } from '@mui/material';
import { Danger, ArrowLeft2 } from 'iconsax-react';
import Link from 'next/link';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; message: string; color: string }> = {
    AccountBanned: {
        title: 'บัญชีถูกแบนถาวร',
        message: 'บัญชีของคุณถูกแบนถาวรเนื่องจากละเมิดข้อกำหนดการใช้งาน ไม่สามารถเข้าสู่ระบบได้อีก',
        color: '#f87171',
    },
};

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get('error') || 'Default';
    const errorInfo = ERROR_MESSAGES[errorCode] || {
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
        color: '#f87171',
    };

    return (
        <Container maxWidth="sm" sx={{ py: 10 }}>
            <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%',
                    bgcolor: `${errorInfo.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${errorInfo.color}30`,
                    mx: 'auto', mb: 3,
                }}>
                    <Danger size="40" color={errorInfo.color} variant="Bold" />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>
                    {errorInfo.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    {errorInfo.message}
                </Typography>

                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowLeft2 size="18" variant="Bold" color="#0ea5e9" />}
                        sx={{
                            borderRadius: 3, px: 4, py: 1.2,
                            borderColor: 'rgba(14, 165, 233, 0.3)', color: '#0ea5e9',
                            fontWeight: 700, textTransform: 'none',
                            '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.05)' },
                        }}
                    >
                        กลับหน้าหลัก
                    </Button>
                </Link>
            </Box>
        </Container>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={null}>
            <AuthErrorContent />
        </Suspense>
    );
}
