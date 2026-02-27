import type { Metadata } from "next";
import { Container, Box, Typography, Divider, Stack } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "นโยบายความเป็นส่วนตัว | TradingChill",
    description: "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของ TradingChill ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
};

export default function PrivacyPolicyPage() {
    const sectionSx = { mb: 5 };
    const headingSx = { fontSize: '1.15rem', fontWeight: 800, color: '#0ea5e9', mb: 1.5 };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
                นโยบายความเป็นส่วนตัว (Privacy Policy)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                อัปเดตล่าสุด: 27 กุมภาพันธ์ 2026
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
                นโยบายนี้จัดทำขึ้นตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            </Typography>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>1. ข้อมูลที่เราเก็บรวบรวม</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    เมื่อท่านใช้งาน TradingChill เราอาจเก็บรวบรวมข้อมูลดังต่อไปนี้:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1.5, lineHeight: 1.8 } }}>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ข้อมูลบัญชี (Account Data):</Typography>{' '}
                        ชื่อ, อีเมล, รูปโปรไฟล์ — ได้รับผ่านระบบ Google OAuth เท่านั้น เราไม่เก็บรหัสผ่าน
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ข้อมูลการใช้งาน (Usage Data):</Typography>{' '}
                        ประวัติหุ้นที่วิเคราะห์, Watchlist, Portfolio จำลอง (Simulation) — เพื่อให้บริการส่วนบุคคลแก่ผู้ใช้
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>คุกกี้ (Cookies):</Typography>{' '}
                        เราใช้คุกกี้ที่จำเป็นสำหรับการล็อกอิน (Session Cookie) และคุกกี้วิเคราะห์จาก Google Analytics เพื่อวิเคราะห์พฤติกรรมผู้เยี่ยมชมเว็บไซต์โดยรวม
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ข้อมูลทางเทคนิค (Technical Data):</Typography>{' '}
                        IP Address, ชนิดเบราว์เซอร์, ระบบปฏิบัติการ — เก็บอัตโนมัติผ่าน Server Logs เพื่อความปลอดภัยและการบำรุงรักษาระบบ
                    </li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>2. วัตถุประสงค์ในการประมวลผลข้อมูล</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>เพื่อยืนยันตัวตนและให้บริการล็อกอินผ่าน Google OAuth</li>
                    <li>เพื่อให้บริการส่วนบุคคล เช่น Watchlist, Portfolio Simulator, ประวัติการวิเคราะห์</li>
                    <li>เพื่อวิเคราะห์สถิติการใช้งานเว็บไซต์และปรับปรุงบริการ (Google Analytics)</li>
                    <li>เพื่อรักษาความปลอดภัยของระบบและป้องกันการใช้งานที่ไม่เหมาะสม</li>
                    <li>เพื่อติดต่อสื่อสารกับผู้ใช้ในกรณีจำเป็น เช่น การแจ้งเตือนเกี่ยวกับบัญชี</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>3. ฐานทางกฎหมายในการประมวลผลข้อมูล</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ความยินยอม (Consent):</Typography>{' '}
                        สำหรับคุกกี้วิเคราะห์ (Analytics) — ผู้ใช้สามารถปฏิเสธได้ผ่าน Cookie Banner
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สัญญา (Contract):</Typography>{' '}
                        สำหรับข้อมูลที่จำเป็นในการให้บริการ เช่น การล็อกอิน, Watchlist, Portfolio
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest):</Typography>{' '}
                        สำหรับการรักษาความปลอดภัยของระบบ
                    </li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>4. คุกกี้ที่เราใช้</Typography>
                <Box sx={{
                    borderRadius: 3, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
                        {/* Header */}
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>ชนิดคุกกี้</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>วัตถุประสงค์</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>ปฏิเสธได้?</Typography>
                        </Box>
                        {/* Row 1 */}
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Session Cookie</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>การล็อกอินและยืนยันตัวตน</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700 }}>ไม่ได้ (จำเป็น)</Typography>
                        </Box>
                        {/* Row 2 */}
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Consent Cookie</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>จดจำการตั้งค่าคุกกี้ของท่าน</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700 }}>ไม่ได้ (จำเป็น)</Typography>
                        </Box>
                        {/* Row 3 */}
                        <Box sx={{ p: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>Google Analytics</Typography>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>วิเคราะห์สถิติผู้เยี่ยมชม</Typography>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700 }}>ได้</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>5. การเปิดเผยข้อมูลแก่บุคคลที่สาม</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    เราไม่ขาย ไม่แลกเปลี่ยน และไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้กับบุคคลที่สาม ยกเว้น:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>Google (สำหรับ OAuth Authentication และ Google Analytics)</li>
                    <li>เมื่อกฎหมายกำหนดให้ต้องเปิดเผย เช่น คำสั่งศาล</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>6. สิทธิของเจ้าของข้อมูล (Data Subject Rights)</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    ตาม PDPA ท่านมีสิทธิดังต่อไปนี้:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li><Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สิทธิในการเข้าถึง:</Typography> ขอดูข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</li>
                    <li><Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สิทธิในการแก้ไข:</Typography> ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                    <li><Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สิทธิในการลบ:</Typography> ขอลบข้อมูลส่วนบุคคลหรือยกเลิกบัญชี</li>
                    <li><Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สิทธิในการถอนความยินยอม:</Typography> ถอนความยินยอมที่เคยให้ไว้ได้ทุกเมื่อ</li>
                    <li><Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>สิทธิในการคัดค้าน:</Typography> คัดค้านการประมวลผลข้อมูล</li>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 2, lineHeight: 1.8 }}>
                    หากต้องการใช้สิทธิข้างต้น กรุณาติดต่อ:{' '}
                    <Box component="a" href="mailto:l3onsaiii@gmail.com" sx={{ color: '#38bdf8', textDecoration: 'none' }}>
                        l3onsaiii@gmail.com
                    </Box>
                </Typography>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>7. ความปลอดภัยของข้อมูล</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>การเข้าสู่ระบบผ่าน Google OAuth (ไม่เก็บรหัสผ่าน)</li>
                    <li>การเชื่อมต่อผ่าน HTTPS เสมอ</li>
                    <li>ข้อมูลจัดเก็บในฐานข้อมูลที่มีการควบคุมการเข้าถึง</li>
                </Box>
            </Box>

            <Box sx={{
                p: 3, borderRadius: 3,
                bgcolor: 'rgba(14, 165, 233, 0.06)',
                border: '1px solid rgba(14, 165, 233, 0.15)',
            }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว หากมีการเปลี่ยนแปลงที่สำคัญ เราจะแจ้งให้ท่านทราบผ่านทางเว็บไซต์{' '}
                    | ดู{' '}
                    <Link href="/terms" style={{ color: '#38bdf8', textDecoration: 'none' }}>ข้อกำหนดการใช้งาน</Link>{' '}
                    | ดู{' '}
                    <Link href="/disclaimer" style={{ color: '#38bdf8', textDecoration: 'none' }}>ข้อจำกัดความรับผิดชอบ</Link>
                </Typography>
            </Box>
        </Container>
    );
}
