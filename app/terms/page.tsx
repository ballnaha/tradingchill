import type { Metadata } from "next";
import { Container, Box, Typography, Stack } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "ข้อกำหนดการใช้งาน | TradingChill",
    description: "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ TradingChill",
};

export default function TermsPage() {
    const sectionSx = { mb: 5 };
    const headingSx = { fontSize: '1.15rem', fontWeight: 800, color: '#0ea5e9', mb: 1.5 };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
                ข้อกำหนดการใช้งาน (Terms of Service)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
                อัปเดตล่าสุด: 27 กุมภาพันธ์ 2026
            </Typography>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>1. การยอมรับข้อกำหนด</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    การเข้าใช้งานเว็บไซต์ TradingChill (tradingchill.com) ถือว่าท่านได้อ่านและยอมรับข้อกำหนดเหล่านี้ทั้งหมด
                    หากท่านไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาหยุดใช้งานเว็บไซต์
                </Typography>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>2. คุณสมบัติผู้ใช้งาน</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>ผู้ใช้ต้องมีอายุ 18 ปีขึ้นไป หรือได้รับความยินยอมจากผู้ปกครอง</li>
                    <li>ผู้ใช้ต้องให้ข้อมูลที่ถูกต้องในการลงทะเบียน</li>
                    <li>บัญชีเป็นส่วนบุคคล ห้ามแบ่งปันหรือโอนให้ผู้อื่น</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>3. ลักษณะของบริการ</Typography>
                <Box sx={{
                    p: 2.5, borderRadius: 3,
                    bgcolor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    mb: 2,
                }}>
                    <Typography sx={{ color: '#f87171', fontWeight: 700 }}>
                        ⚠️ TradingChill เป็นเครื่องมือวิเคราะห์ข้อมูล ไม่ใช่ที่ปรึกษาทางการเงิน
                    </Typography>
                </Box>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>TradingChill ให้บริการเครื่องมือวิเคราะห์ข้อมูลหุ้นเชิงปริมาณ (Quantitative Analysis Tool)</li>
                    <li>ข้อมูลทั้งหมดเป็นผลจากการคำนวณทางสถิติ ไม่ใช่คำแนะนำในการลงทุน (NOT INVESTMENT ADVICE)</li>
                    <li>TradingChill ไม่ใช่ที่ปรึกษาทางการเงินที่ได้รับใบอนุญาตจาก ก.ล.ต. หรือหน่วยงานกำกับดูแลใดๆ</li>
                    <li>ผู้ใช้รับผิดชอบการตัดสินใจลงทุนของตนเองทั้งหมด</li>
                    <li>ผลการทดสอบย้อนหลัง (Backtest) ไม่ได้เป็นการรับรองผลตอบแทนในอนาคต</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>4. ข้อห้ามในการใช้งาน</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    ผู้ใช้ตกลงว่าจะไม่:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>ใช้ระบบเพื่อจุดประสงค์ที่ผิดกฎหมาย</li>
                    <li>ทำ Reverse Engineering, Scraping, หรือดึงข้อมูลแบบอัตโนมัติ (Bot)</li>
                    <li>พยายามเข้าถึงบัญชีหรือข้อมูลของผู้ใช้อื่น</li>
                    <li>แชร์ข้อมูลจากระบบเพื่อวัตถุประสงค์ทางการค้าโดยไม่ได้รับอนุญาต</li>
                    <li>โจมตีระบบด้วย DDoS, SQL Injection หรือวิธีการอื่นๆ</li>
                    <li>นำข้อมูลจากเว็บไซต์ไปอ้างว่าเป็นคำแนะนำการลงทุน</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>5. ข้อมูลจากภายนอก</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    ข้อมูลราคาหุ้นและข้อมูลบริษัทมาจากแหล่งข้อมูลภายนอก:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>Finnhub.io — ราคาเรียลไทม์, ข้อมูลบริษัท, คำแนะนำนักวิเคราะห์</li>
                    <li>Yahoo Finance — ข้อมูลราคาย้อนหลัง (Historical Data)</li>
                </Box>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    TradingChill ไม่รับรองความถูกต้องสมบูรณ์ของข้อมูลจากแหล่งภายนอก
                    ข้อมูลอาจมีความล่าช้าสูงสุด 15 นาที
                </Typography>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>6. ข้อจำกัดความรับผิดชอบ</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>TradingChill ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการตัดสินใจลงทุนของผู้ใช้</li>
                    <li>เราไม่รับรองว่าบริการจะพร้อมใช้งานตลอด 24 ชั่วโมง หรือปราศจากข้อผิดพลาด</li>
                    <li>เราไม่รับผิดชอบต่อความเสียหายที่เกิดจากการหยุดให้บริการชั่วคราว</li>
                    <li>ผู้ใช้ยอมรับว่าการลงทุนมีความเสี่ยง และรับผิดชอบการตัดสินใจด้วยตนเอง</li>
                </Box>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>7. การระงับหรือยกเลิกบัญชี</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    TradingChill สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ที่ละเมิดข้อกำหนด
                    โดยไม่ต้องแจ้งล่วงหน้า ซึ่งรวมถึงแต่ไม่จำกัดเพียง: การใช้ Bot, การ Scraping ข้อมูล,
                    การโจมตีระบบ, หรือการนำข้อมูลไปใช้ในทางที่ผิดกฎหมาย
                </Typography>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>8. ทรัพย์สินทางปัญญา</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    สื่อทั้งหมดบนเว็บไซต์ รวมถึงโลโก้, ดีไซน์, อัลกอริทึม, ซอร์สโค้ด, และเนื้อหา
                    เป็นทรัพย์สินทางปัญญาของ TradingChill ห้ามทำซ้ำ ดัดแปลง หรือเผยแพร่
                    โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                </Typography>
            </Box>

            <Box sx={sectionSx}>
                <Typography sx={headingSx}>9. การเปลี่ยนแปลงข้อกำหนด</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    เราอาจปรับปรุงข้อกำหนดเหล่านี้ได้ตลอดเวลา การใช้งานต่อหลังจากมีการเปลี่ยนแปลง
                    ถือว่าท่านยอมรับข้อกำหนดใหม่โดยอัตโนมัติ
                </Typography>
            </Box>

            <Box sx={{
                p: 3, borderRadius: 3,
                bgcolor: 'rgba(14, 165, 233, 0.06)',
                border: '1px solid rgba(14, 165, 233, 0.15)',
            }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    กฎหมายที่บังคับใช้: ข้อกำหนดนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย{' '}
                    | ดู{' '}
                    <Link href="/privacy" style={{ color: '#38bdf8', textDecoration: 'none' }}>นโยบายความเป็นส่วนตัว</Link>{' '}
                    | ดู{' '}
                    <Link href="/disclaimer" style={{ color: '#38bdf8', textDecoration: 'none' }}>ข้อจำกัดความรับผิดชอบ</Link>
                </Typography>
            </Box>
        </Container>
    );
}
