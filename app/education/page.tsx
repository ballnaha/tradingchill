'use client';

import React from 'react';
import { Container, Box, Typography, Paper, Divider, Stack, IconButton } from '@mui/material';
import { ArrowLeft2, LampCharge, Activity, Cpu, Chart1, InfoCircle, Mirror, ChartCircle, WalletMoney, InfoCircle as InfoIcon } from 'iconsax-react';
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

                {/* Bollinger Bands Section */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(234, 179, 8, 0.1)', borderRadius: 2 }}>
                            <Chart1 size="28" color="#eab308" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Bollinger Bands (20, 2)</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        <strong>Bollinger Bands</strong> คือเครื่องมือที่ใช้วัดความผันผวนของราคาหุ้น โดยประกอบด้วยเส้นค่าเฉลี่ยเคลื่อนที่ (SMA) และเส้นขอบบน-ล่างที่ปรับตามความผันผวน
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>Logic การพยากรณ์:</Typography>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>ราคาแตะขอบล่าง:</strong> บ่งชี้ว่าราคาอาจจะ <strong>ถูกเกินไป (Undervalued)</strong> และมีโอกาสที่จะดีดตัวขึ้น
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>ราคาแตะขอบบน:</strong> บ่งชี้ว่าราคาอาจจะ <strong>แพงเกินไป (Overvalued)</strong> และมีโอกาสที่จะปรับตัวลง
                            </li>
                            <li>
                                <strong>Band แคบ:</strong> แสดงถึงช่วงที่ตลาดมีความผันผวนต่ำ มักจะเกิดก่อนการเคลื่อนไหวครั้งใหญ่
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* MACD Section */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(236, 72, 153, 0.1)', borderRadius: 2 }}>
                            <ChartCircle size="28" color="#ec4899" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>MACD (12, 26, 9)</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        <strong>Moving Average Convergence Divergence (MACD)</strong> คือเครื่องมือที่ใช้วัดความสัมพันธ์ระหว่างค่าเฉลี่ยเคลื่อนที่สองเส้น เพื่อระบุการเปลี่ยนแปลงของโมเมนตัมและทิศทางแนวโน้ม
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>Logic การพยากรณ์:</Typography>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>MACD ตัด Signal Line ขึ้น:</strong> เป็นสัญญาณ <strong>ซื้อ (Buy Signal)</strong> บ่งบอกถึงโมเมนตัมขาขึ้น
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>MACD ตัด Signal Line ลง:</strong> เป็นสัญญาณ <strong>ขาย (Sell Signal)</strong> บ่งบอกถึงโมเมนตัมขาลง
                            </li>
                            <li>
                                <strong>Divergence:</strong> เมื่อราคาทำจุดสูงสุดใหม่ แต่ MACD ไม่ทำตาม อาจเป็นสัญญาณเตือนว่าแนวโน้มกำลังจะเปลี่ยน
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* Market Context Section */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
                            <Mirror size="28" color="#8b5cf6" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Market Context</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        <strong>Market Context</strong> คือการวิเคราะห์ภาพรวมของตลาดและปัจจัยภายนอกที่ส่งผลต่อราคาหุ้น เช่น สภาวะเศรษฐกิจ, ข่าวสารสำคัญ, หรือผลประกอบการของบริษัท
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>Logic การพยากรณ์:</Typography>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>ข่าวดี/ผลประกอบการดี:</strong> มักจะส่งผลให้ราคาหุ้นปรับตัวขึ้น
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>ข่าวร้าย/ผลประกอบการแย่:</strong> มักจะส่งผลให้ราคาหุ้นปรับตัวลง
                            </li>
                            <li>
                                <strong>สภาวะตลาดโดยรวม:</strong> ตลาดขาขึ้น (Bull Market) หรือขาลง (Bear Market) มีผลต่อการเคลื่อนไหวของหุ้นแต่ละตัว
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* AI Multi-Factor Scoring */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(168, 85, 247, 0.1)', borderRadius: 2 }}>
                            <Cpu size="28" color="#a855f7" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>AI Multi-Factor Scoring</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                        TradingChill ไม่ได้ดูแค่กราฟ แต่ใช้ระบบรวบรวมข้อมูลหลายมิติมาคำนวณเป็นความมั่นใจ (Confidence Score)
                    </Typography>
                    <Divider sx={{ mb: 3, opacity: 0.1 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>40%</Typography>
                            <Typography variant="caption" color="text.secondary">RSI & Momentum</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>30%</Typography>
                            <Typography variant="caption" color="text.secondary">Trend (SMA/MACD)</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>20%</Typography>
                            <Typography variant="caption" color="text.secondary">Market Context</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>10%</Typography>
                            <Typography variant="caption" color="text.secondary">Earnings Surprise</Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Account & Personalization */}
                <Paper elevation={0} className="glass-card" sx={{ p: 4, border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(2, 132, 199, 0.1)', borderRadius: 2 }}>
                            <WalletMoney size="28" color="#0284c7" variant="Bulk" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Personalization & Security</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        เพื่อความปลอดภัยและความเป็นส่วนตัวของข้อมูลการลงทุน ระบบกำหนดสิทธิ์การใช้งานดังนี้:
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: 3 }}>
                        <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>แขกทั่วไป (Guest):</strong> ค้นหาและวิเคราะห์หุ้นได้แบบ Real-time
                            </li>
                            <li>
                                <strong>สมาชิกที่ล็อกอิน:</strong> สามารถใช้งาน <strong>Portfolio Simulator</strong> และ <strong>Watchlist</strong> เพื่อเก็บข้อมูลส่วนตัวได้
                            </li>
                        </ul>
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
