'use client';

import React from 'react';
import { Container, Box, Typography, Paper, Divider, Stack, IconButton } from '@mui/material';
import { ArrowLeft2, LampCharge, Activity, Cpu, Chart1, InfoCircle } from 'iconsax-react';
import Link from 'next/link';

export default function Education() {
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>คู่มือการใช้งานและการวิเคราะห์</Typography>
                <Typography variant="body1" color="text.secondary">
                    ทำความเข้าใจเครื่องมือหลักที่ระบบอัลกอริทึมใช้ในการคำนวณและพยากรณ์ราคาหุ้น
                </Typography>
            </Box>

            <Stack spacing={4}>
                {/* RSI Section */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(251, 191, 36, 0.1)', borderRadius: 2 }}>
                            <LampCharge size="28" color="#fbbf24" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>RSI (14) Momentum</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        <strong>Relative Strength Index (RSI)</strong> คือเครื่องมือวัด "โมเมนตัม" หรือความแรงของราคาในช่วง 14 วันล่าสุด เพื่อระบุสภาวะที่มีการซื้อหรือขายมากเกินไป
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>Logic การพยากรณ์:</Typography>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#22c55e' }}>Oversold (ต่ำกว่า 30):</span> ราคาลงมาลึกเกินไป คนเทขายจนหมดแรง มีโอกาสสูงที่ราคาจะ <strong>ดีดกลับ (Rebound)</strong> ในระยะสั้น
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#ef4444' }}>Overbought (สูงกว่า 70):</span> ราคาพุ่งขึ้นเร็วเกินไป คนได้กำไรเยอะเสี่ยงโดนเทขาย มีโอกาสที่ราคาจะ <strong>ปรับฐาน (Correction)</strong>
                            </li>
                            <li>
                                <span>Neutral (30-70):</span> ราคาอยู่ในโซนปกติ แรงซื้อและแรงขายยังอยู่ในสภาวะสมดุล
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* SMA Section */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(56, 189, 248, 0.1)', borderRadius: 2 }}>
                            <Activity size="28" color="#38bdf8" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>SMA (20) Trend</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        <strong>Simple Moving Average (SMA)</strong> คือราคาเฉลี่ยเคลื่อนที่ 20 วันล่าสุด ใช้เพื่อระบุความแข็งแกร่งของแนวโน้ม (Trend)
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>Logic การพยากรณ์:</Typography>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>ถ้าราคาอยู่เหนือ SMA 20:</strong> แสดงว่าราคาปัจจุบันสูงกว่าค่าเฉลี่ยของคนส่วนใหญ่ในรอบ 1 เดือน เป็นสัญญาณของ <strong>ขาขึ้น (Uptrend)</strong>
                            </li>
                            <li>
                                <strong>ถ้าราคาอยู่ต่ำกว่า SMA 20:</strong> แสดงว่าคนส่วนใหญ่กำลังขาดทุน เป็นสัญญาณของ <strong>ขาลง (Downtrend)</strong> หรือแนวโน้มที่อ่อนแรง
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* AI Scoring Engine */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(168, 85, 247, 0.1)', borderRadius: 2 }}>
                            <Cpu size="28" color="#a855f7" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Quantitative Scoring Engine</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                        ระบบจะรวบรวมสัญญาณจากทุกเครื่องมือมาให้คะแนน (Weight Scoring) เพื่อหาข้อสรุปที่แม่นยำที่สุด
                    </Typography>
                    <Divider sx={{ mb: 3, opacity: 0.1 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, textAlign: 'center', minWidth: '100px' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>60%</Typography>
                            <Typography variant="caption" color="text.secondary">น้ำหนักจาก RSI</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', minWidth: '100px' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>30%</Typography>
                            <Typography variant="caption" color="text.secondary">น้ำหนักจาก SMA 20</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', minWidth: '100px' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>10%</Typography>
                            <Typography variant="caption" color="text.secondary">ความผันผวนล่าสุด</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(56, 189, 248, 0.05)', borderRadius: 2, border: '1px dashed rgba(56, 189, 248, 0.3)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                            "เราวิเคราะห์จากหลักฐานทางสถิติมากกว่าการคาดเดา เพื่อลดความเสี่ยงในการลงทุน"
                        </Typography>
                    </Box>
                </Paper>
            </Stack>

            <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    * ข้อมูลทั้งหมดเป็นเพียงการวิเคราะห์ทางเทคนิคเบื้องต้นเท่านั้น โปรดใช้วิจารณญาณในการลงทุน
                </Typography>
            </Box>
        </Container>
    );
}
