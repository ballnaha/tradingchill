import type { Metadata } from "next";
import { Container, Box, Typography, Stack, Divider } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "ข้อตกลงและข้อจำกัดความรับผิดชอบ | TradingChill",
    description: "ข้อตกลงการใช้งาน นโยบายความเป็นส่วนตัว และข้อจำกัดความรับผิดชอบของ TradingChill",
};

export default function DisclaimerPage() {
    const sectionSx = { mb: 6 };
    const headingSx = { fontSize: '1.25rem', fontWeight: 800, color: '#0ea5e9', mb: 1.5 };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
            {/* Page Title */}
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
                ข้อตกลงและข้อจำกัดความรับผิดชอบ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
                อัปเดตล่าสุด: 27 กุมภาพันธ์ 2026
            </Typography>

            {/* 1. Disclaimer */}
            <Box sx={sectionSx}>
                <Typography sx={headingSx}>1. ข้อจำกัดความรับผิดชอบ (Disclaimer)</Typography>

                <Box sx={{
                    p: 2.5, borderRadius: 3,
                    bgcolor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    mb: 2,
                }}>
                    <Typography sx={{ color: '#f87171', fontWeight: 700 }}>
                        ⚠️ ข้อมูลบนเว็บไซต์นี้ไม่ใช่คำแนะนำในการลงทุน (NOT INVESTMENT ADVICE)
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    TradingChill เป็นเครื่องมือวิเคราะห์ข้อมูลหุ้นเชิงปริมาณ (Quantitative Analysis Tool)
                    ที่ใช้ตัวชี้วัดทางเทคนิค เช่น RSI, SMA, Bollinger Bands, MACD และข้อมูลพื้นฐาน
                    เพื่อประกอบการตัดสินใจของผู้ใช้เท่านั้น
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>ข้อมูลทั้งหมดเป็นการคำนวณทางสถิติจากข้อมูลตลาดในอดีต ไม่ได้รับรองผลกำไรในอนาคต</li>
                    <li>การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลก่อนตัดสินใจลงทุน</li>
                    <li>TradingChill ไม่ใช่ที่ปรึกษาทางการเงิน และไม่มีใบอนุญาตให้คำแนะนำการลงทุน</li>
                    <li>ผู้ใช้รับผิดชอบการตัดสินใจลงทุนของตนเองทั้งหมด</li>
                    <li>ผลการทดสอบย้อนหลัง (Backtest) ไม่ได้เป็นการรับรองผลตอบแทนในอนาคต</li>
                </Box>
            </Box>

            {/* 2. About */}
            <Box sx={sectionSx}>
                <Typography sx={headingSx}>2. เกี่ยวกับ TradingChill</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    TradingChill เป็นแพลตฟอร์มวิเคราะห์ข้อมูลหุ้นสหรัฐอเมริกา โดยใช้อัลกอริทึมเชิงปริมาณ
                    (Quantitative Algorithm) ในการคำนวณตัวชี้วัดทางเทคนิค ไม่ใช่ปัญญาประดิษฐ์ (AI)
                    แต่เป็นการคำนวณทางคณิตศาสตร์จากข้อมูลราคาและปริมาณการซื้อขาย
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    ข้อมูลราคาหุ้นมาจากแหล่งข้อมูลภายนอก ได้แก่ Finnhub.io และ Yahoo Finance
                    ซึ่ง TradingChill ไม่รับรองความถูกต้องสมบูรณ์ของข้อมูลจากแหล่งภายนอกเหล่านั้น
                </Typography>
            </Box>

            {/* 3. Privacy */}
            <Box sx={sectionSx}>
                <Typography sx={headingSx}>3. นโยบายความเป็นส่วนตัว (Privacy Policy)</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    เราเก็บรวบรวมข้อมูลเท่าที่จำเป็นสำหรับการให้บริการ:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1.5, lineHeight: 1.8 } }}>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ข้อมูลบัญชี:</Typography>{' '}
                        ชื่อ, อีเมล, รูปโปรไฟล์ ผ่านระบบ Google OAuth — เราไม่เก็บรหัสผ่าน
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>ข้อมูลการใช้งาน:</Typography>{' '}
                        ประวัติหุ้นที่วิเคราะห์, Watchlist, Portfolio (จำลอง) เพื่อให้บริการส่วนบุคคล
                    </li>
                    <li>
                        <Typography component="span" sx={{ fontWeight: 700, color: '#e2e8f0' }}>Analytics:</Typography>{' '}
                        เราใช้ Google Analytics เพื่อวิเคราะห์พฤติกรรมผู้เยี่ยมชมเว็บไซต์โดยรวม
                    </li>
                </Box>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    เราไม่ขาย ไม่แลกเปลี่ยน และไม่เปิดเผยข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม
                    ยกเว้นกรณีที่กฎหมายกำหนด
                </Typography>
            </Box>

            {/* 4. Terms */}
            <Box sx={sectionSx}>
                <Typography sx={headingSx}>4. ข้อกำหนดการใช้งาน (Terms of Service)</Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>ผู้ใช้ต้องมีอายุ 18 ปีขึ้นไป</li>
                    <li>ห้ามใช้ระบบเพื่อจุดประสงค์ที่ผิดกฎหมาย</li>
                    <li>ห้ามทำ Reverse Engineering, Scraping หรือใช้ Bot โจมตีระบบ</li>
                    <li>TradingChill สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนด</li>
                    <li>เราอาจปรับปรุงข้อกำหนดเหล่านี้ได้โดยไม่แจ้งล่วงหน้า</li>
                </Box>
            </Box>

            {/* 5. Data Sources */}
            <Box sx={sectionSx}>
                <Typography sx={headingSx}>5. แหล่งข้อมูล (Data Sources)</Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2, lineHeight: 1.8 }}>
                    ข้อมูลบนเว็บไซต์นี้มาจากแหล่งข้อมูลสาธารณะ ได้แก่:
                </Typography>
                <Box component="ul" sx={{ color: '#94a3b8', pl: 2.5, '& li': { mb: 1, lineHeight: 1.8 } }}>
                    <li>Finnhub.io — ราคาหุ้น, ข้อมูลบริษัท, ข่าวสาร</li>
                    <li>Yahoo Finance — ข้อมูลราคาย้อนหลัง</li>
                </Box>
                <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8 }}>
                    ข้อมูลอาจมีความล่าช้าสูงสุด 15 นาที และอาจไม่ตรงกับราคาตลาดจริง ณ ขณะนั้น
                </Typography>
            </Box>
        </Container>
    );
}
