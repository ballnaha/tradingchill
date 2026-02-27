import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Chip, Button, Collapse } from '@mui/material';
import { LampCharge, TrendUp, TrendDown, Minus, ArrowDown2, ArrowUp2 } from 'iconsax-react';
import { PredictionResult } from '../utils/prediction';

interface AIPredictionCardProps {
    prediction: PredictionResult | null;
}

const SignalIcon = ({ signal }: { signal: 'positive' | 'negative' | 'neutral' }) => {
    if (signal === 'positive') return <TrendUp size="14" color="#4ade80" variant="Bold" />;
    if (signal === 'negative') return <TrendDown size="14" color="#f87171" variant="Bold" />;
    return <Minus size="14" color="#94a3b8" variant="Bold" />;
};

const AIPredictionCard: React.FC<AIPredictionCardProps> = ({ prediction }) => {
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        // Close by default on mobile (tablet breakpoint 900px)
        if (typeof window !== 'undefined' && window.innerWidth < 900) {
            setExpanded(false);
        }
    }, []);

    return (
        <div className="glass-card" style={{ height: '100%', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <LampCharge size="24" color="#fbbf24" variant="Bulk" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>STATISTICAL ANALYSIS</Typography>
                </Stack>
                {prediction && (
                    <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', lineHeight: 1 }}>
                            {prediction.symbol}
                        </Typography>
                        <Typography variant="subtitle2" className="font-mono" sx={{ fontWeight: 800 }}>
                            ${prediction.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                )}
            </Stack>

            <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ผลวิเคราะห์ทางสถิติ (3 วันข้างหน้า)
                </Typography>
                {prediction && (
                    <>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 1 }}>
                            <Typography
                                variant="h4"
                                color={prediction.trend === 'UP' ? '#4ade80' : prediction.trend === 'DOWN' ? '#f87171' : '#94a3b8'}
                                sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                            >
                                {prediction.trend === 'UP' ? 'Bullish 🚀' : prediction.trend === 'DOWN' ? 'Bearish ⚠️' : 'Neutral ➖'}
                            </Typography>
                            <Box component="span" sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 10,
                                bgcolor: prediction.trend === 'UP' ? 'rgba(74, 222, 128, 0.1)' : prediction.trend === 'DOWN' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: prediction.trend === 'UP' ? '#4ade80' : prediction.trend === 'DOWN' ? '#f87171' : '#94a3b8',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                whiteSpace: 'nowrap'
                            }}>
                                Confidence {prediction.confidence}%
                            </Box>
                        </Stack>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(56, 189, 248, 0.05)', borderRadius: 2, borderLeft: '4px solid #38bdf8' }}>
                            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, display: 'block', mb: 0.5 }}>
                                ช่วงเวลาที่คำนวณ: {prediction.period} (3 วันทำการ)
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                {prediction.reasoning}
                            </Typography>
                        </Box>

                        <Stack spacing={1} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    ค่าประมาณทางสถิติ (วันถัดไป):
                                </Typography>
                                <Typography className="font-mono" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
                                    ${typeof prediction.targetNextDay === 'string' ? parseFloat(prediction.targetNextDay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prediction.targetNextDay}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    ค่าคำนวณ {prediction.days} วัน:
                                </Typography>
                                <Typography className="font-mono" sx={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.2rem' }}>
                                    ${typeof prediction.target === 'string' ? parseFloat(prediction.target).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : prediction.target}
                                </Typography>
                            </Box>
                        </Stack>
                    </>
                )}
            </Box>

            {/* Reasoning Points */}
            {prediction && prediction.reasoningPoints.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            mb: 1.5,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#fbbf24', letterSpacing: 1, textTransform: 'uppercase' }}>
                                เหตุผลในการวิเคราะห์
                            </Typography>
                            <Chip
                                label={`${prediction.reasoningPoints.length} ปัจจัย`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 700 }}
                            />
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {expanded ? <ArrowUp2 size="16" color="#fbbf24" /> : <ArrowDown2 size="16" color="#fbbf24" />}
                        </Box>
                    </Stack>

                    <Collapse in={expanded}>
                        <Stack spacing={1}>
                            {prediction.reasoningPoints.map((point, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex',
                                        gap: 1.5,
                                        alignItems: 'flex-start',
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: point.signal === 'positive'
                                            ? 'rgba(74, 222, 128, 0.04)'
                                            : point.signal === 'negative'
                                                ? 'rgba(248, 113, 113, 0.04)'
                                                : 'rgba(255,255,255,0.02)',
                                        border: '1px solid',
                                        borderColor: point.signal === 'positive'
                                            ? 'rgba(74, 222, 128, 0.12)'
                                            : point.signal === 'negative'
                                                ? 'rgba(248, 113, 113, 0.12)'
                                                : 'rgba(255,255,255,0.06)',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                                    }}
                                >
                                    <Box sx={{ mt: 0.3, flexShrink: 0 }}>
                                        <SignalIcon signal={point.signal} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{
                                            fontWeight: 800,
                                            color: point.signal === 'positive' ? '#4ade80' : point.signal === 'negative' ? '#f87171' : '#94a3b8',
                                            display: 'block',
                                            mb: 0.2,
                                            fontSize: '0.68rem',
                                            letterSpacing: 0.5
                                        }}>
                                            {point.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '0.72rem' }}>
                                            {point.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Collapse>
                </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                * วิเคราะห์โดย: Multi-Factor Quantitative Engine (RSI, SMA, Bollinger Bands, Price Action, P/E)
            </Typography>
        </div>
    );
};

export default AIPredictionCard;
