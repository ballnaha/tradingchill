'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Stack,
    Divider,
    Paper,
    Fade,
} from '@mui/material';
import {
    Magicpen,
    Refresh2,
    InfoCircle,
    Hierarchy,
    Global,
    Flash,
    Moon,
    Sun,
    Star,
    Heart,
    ArrowCircleRight
} from 'iconsax-react';
import { TAROT_CARDS, TarotCard } from './tarotData';

const CardIcon = ({ name, color, size = 48 }: { name: string, color: string, size?: number }) => {
    switch (name) {
        case 'Sun': return <Sun size={size} color={color} variant="Bold" />;
        case 'Magicpen': return <Magicpen size={size} color={color} variant="Bold" />;
        case 'Moon': return <Moon size={size} color={color} variant="Bold" />;
        case 'Hierarchy': return <Hierarchy size={size} color={color} variant="Bold" />;
        case 'Heart': return <Heart size={size} color={color} variant="Bold" />;
        case 'Refresh2': return <Refresh2 size={size} color={color} variant="Bold" />;
        case 'Flash': return <Flash size={size} color={color} variant="Bold" />;
        case 'Star': return <Star size={size} color={color} variant="Bold" />;
        case 'Global': return <Global size={size} color={color} variant="Bold" />;
        case 'CloseCircle': return <ArrowCircleRight size={size} color={color} variant="Bold" style={{ transform: 'rotate(45deg)' }} />;
        default: return <Magicpen size={size} color={color} variant="Bold" />;
    }
};

type PredictionSlot = {
    title: string;
    description: string;
    card: TarotCard | null;
    isFlipped: boolean;
};

export default function ProphecyPage() {
    const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'selecting' | 'revealed'>('idle');
    const [slots, setSlots] = useState<PredictionSlot[]>([
        { title: 'สถานการณ์ (Situation)', description: 'สภาวะจิตใจและตลาดในปัจจุบัน', card: null, isFlipped: false },
        { title: 'อุปสรรค (Challenge)', description: 'สิ่งที่ควรระวังที่จะขัดขวางการตัดสินใจ', card: null, isFlipped: false },
        { title: 'คำแนะนำ (Advice)', description: 'แนวทางปฏิบัติเพื่อให้พอร์ตเติบโต', card: null, isFlipped: false },
    ]);
    const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const shuffle = () => {
        setGameState('shuffling');
        setSlots(prev => prev.map(s => ({ ...s, card: null, isFlipped: false })));
        setSelectedIndices([]);

        // Prepare shuffled deck for selection
        const newDeck = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
        setShuffledDeck(newDeck);

        setTimeout(() => {
            setGameState('selecting');
        }, 1500);
    };

    const handleCardToggle = (index: number) => {
        setSelectedIndices(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                if (prev.length < 3) {
                    return [...prev, index];
                }
                return prev;
            }
        });
    };

    const revealFate = () => {
        if (selectedIndices.length !== 3) return;

        setSlots(prev => prev.map((s, i) => ({
            ...s,
            card: shuffledDeck[selectedIndices[i]],
            isFlipped: false
        })));

        setGameState('revealed');
        // Flip them in sequence
        setTimeout(() => setSlots(prev => prev.map((s, i) => i === 0 ? { ...s, isFlipped: true } : s)), 500);
        setTimeout(() => setSlots(prev => prev.map((s, i) => i === 1 ? { ...s, isFlipped: true } : s)), 1200);
        setTimeout(() => setSlots(prev => prev.map((s, i) => i === 2 ? { ...s, isFlipped: true } : s)), 1900);
    };

    const getOverallSummary = () => {
        const cards = slots.map(s => s.card).filter(Boolean) as TarotCard[];
        if (cards.length < 3) return null;

        // Categorize cards for summary logic
        const positiveCards = ['1-the-magician', '3-the-empress', '7-the-chariot', '10-wheel-of-fortune', '17-the-star', '19-the-sun', '21-the-world'];
        const warningCards = ['13-death', '15-the-devil', '16-the-tower', '18-the-moon', '20-judgement'];
        const patientCards = ['2-the-high-priestess', '4-the-emperor', '8-strength', '9-the-hermit', '11-justice', '12-the-hanged-man', '14-temperance'];

        let score = 0;
        cards.forEach(c => {
            if (positiveCards.includes(c.id)) score += 1;
            else if (warningCards.includes(c.id)) score -= 1;
        });

        // Use card indices to create a semi-random but deterministic seed for variant selection
        const seed = selectedIndices.reduce((a, b) => a + b, 0);
        const getVariant = (arr: any[]) => arr[seed % arr.length];

        if (score >= 2) {
            return getVariant([
                {
                    title: 'โอกาสทองและความก้าวหน้า',
                    text: 'ภาพรวมวันนี้เป็นบวกอย่างมาก สภาวะจิตใจและตลาดสอดคล้องกันอย่างดีเยี่ยม เป็นจังหวะที่ดีในการมองหาผลกำไรหรือขยายพอร์ตตามแผนที่วางไว้ จงใช้ความมั่นใจที่มีให้เกิดประโยชน์สูงสุด แต่ยังคงรักษาวินัยไว้อย่างเคร่งครัด',
                    color: '#10b981'
                },
                {
                    title: 'แสงสว่างแห่งความสำเร็จ',
                    text: 'ไพ่ชุดนี้บ่งบอกถึงความรุ่งโรจน์และทิศทางที่ชัดเจน สิ่งที่คุณทุ่มเทศึกษามาเริ่มส่งผลลัพธ์ที่เป็นรูปธรรม ความโชคดีกำลังเข้าข้างคุณในจังหวะที่เหมาะสม แนะนำให้ตัดสินใจด้วยความเด็ดขาด เพื่อคว้าโอกาสใหญ่ที่กำลังจะเข้ามา',
                    color: '#10b981'
                },
                {
                    title: 'ชัยชนะจากการวางแผน',
                    text: 'พลังงานในวันนี้ผลักดันให้เกิดความก้าวหน้าอย่างรวดเร็ว คุณมีศักยภาพในการคุมเกมสูงมาก การเข้าทำกำไรในวันนี้มีแต้มต่อที่ดีเยี่ยม แผนงานที่คุณวางไว้จะดำเนินไปอย่างไร้อุปสรรค จงมุ่งมั่นและเชื่อมั่นในสัญชาตญาณตัวเอง',
                    color: '#10b981'
                }
            ]);
        } else if (score <= -2) {
            return getVariant([
                {
                    title: 'เฝ้าระวังและป้องกันเงินทุน',
                    text: 'สัญญาณภาพรวมเตือนให้คุณเพิ่มความระมัดระวังในวันนี้ ตลาดมีความผันผวนหรือมีความเสี่ยงที่ซ่อนอยู่เกินกว่าจะควบคุมได้ การรักษาสัมผัสแห่งสติและป้องกันเงินทุน (Capital Preservation) สำคัญกว่าการแสวงหากำไรชั่วคราว หากไม่มั่นใจ การอยู่เฉยๆ คือกำไรอย่างหนึ่ง',
                    color: '#ef4444'
                },
                {
                    title: 'พายุที่ต้องรับมือ',
                    text: 'วันนี้ไม่ใช่จังหวะสำหรับการเสี่ยงที่ไม่มีแผนรองรับ อิทธิพลของไพ่แสดงถึงแรงปะทะที่อาจทำให้เสียจังหวะได้ง่าย แนะนำให้ลดขนาดพอร์ตหรือรอดูสถานการณ์ข้างสนามจนกว่าความกังวลจะคลี่คลาย สิ่งสำคัญที่สุดคือการรักษาวินัยเพื่อรอโอกาสในวันใหม่',
                    color: '#ef4444'
                },
                {
                    title: 'บททดสอบความอดทน',
                    text: 'มีบางอย่างที่ยังไม่เปิดเผยออกมาทั้งหมด และอาจส่งผลกระทบต่อการตัดสินใจของคุณ การหยุดพักเพื่อทบทวนกลยุทธ์ในวันนี้จะช่วยลดความสูญเสียในระยะยาวได้ อย่าปล่อยให้อารมณ์อยู่เหนือเหตุผล จบวันด้วยความนิ่งสงบคือชัยชนะที่ยิ่งใหญ่ที่สุด',
                    color: '#ef4444'
                }
            ]);
        } else if (cards.some(c => patientCards.includes(c.id))) {
            return getVariant([
                {
                    title: 'ความมั่นคงและการรอคอยที่คุ้มค่า',
                    text: 'วันนี้เป็นวันแห่งการเฝ้าสังเกตและใช้ปัญญาในการตัดสินใจ ภาพรวมแนะนำให้คุณรักษาสมดุล อย่ารีบร้อนตามตลาดหรือใช้อารมณ์ตัดสิน สัญญาณต่างๆ กำลังฟอร์มตัว การประเมินสถานการณ์อย่างรอบคอบจะทำให้คุณเห็นช่องทางที่คนอื่นมองข้าม ชัยชนะเป็นของผู้ที่อดทนได้นานที่สุด',
                    color: '#38bdf8'
                },
                {
                    title: 'จังหวะแห่งสมาธิ',
                    text: 'ความสำเร็จในวันนี้มาจากการนิ่งเฉยและการคิดวิเคราะห์ในเชิงลึก ตลาดอาจจะดูไม่เคลื่อนไหวมากนัก แต่นี่เป็นโอกาสดีในการเติมเต็มความรู้และเรียนรู้พฤติกรรมราคา การกระทำที่ค่อยเป็นค่อยไปจะสร้างรากฐานที่มั่นคงให้พอร์ตในอนาคต',
                    color: '#38bdf8'
                },
                {
                    title: 'สมดุลแห่งจิตวิทยา',
                    text: 'การรักษาสภาวะอารมณ์ให้คงที่คือหัวใจหลักของไพ่ชุดนี้ คุณไม่จำเป็นต้องเทรดทุกวันเพื่อที่จะได้รับชัยชนะ การรอให้สัญญาณมีความชัดเจนและสอดคล้องกับระบบเทรดของคุณ จะทำให้คุณได้ผลลัพธ์ที่มีคุณภาพสูงสุด',
                    color: '#38bdf8'
                }
            ]);
        } else {
            return getVariant([
                {
                    title: 'การปรับสมดุลและทางเลือกใหม่',
                    text: 'คุณกำลังอยู่ในจังหวะที่ต้องตัดสินใจเลือกสิ่งที่ดีที่สุดให้ตัวเอง ภาพรวมมีความผสมผสานระหว่างโอกาสและความเสี่ยง จงใช้เหตุผลและเปรียบเทียบข้อมูลให้ถี่ถ้วนก่อนขยับตัว จังหวะในวันนี้อาจจะดูเรียบเฉยแต่เป็นช่วงเวลาสำคัญในการวางกลยุทธ์สำหรับก้าวต่อไป',
                    color: '#a78bfa'
                },
                {
                    title: 'การเปลี่ยนแปลงที่น่าค้นหา',
                    text: 'สิ่งใหม่ๆ กำลังจะเกิดขึ้นในพอร์ตของคุณ อิทธิพลของไพ่บอกถึงการเริ่มต้นสิ่งที่ดีกว่าเดิม การยอมรับความจริงและปรับตัวตามสภาวะตลาดที่เปลี่ยนไปจะนำไปสู่ความมั่งคั่งที่ยั่งยืน จงเปิดใจรับฟังข้อมูลใหม่ๆ รอบตัว',
                    color: '#a78bfa'
                },
                {
                    title: 'กลยุทธ์และการตัดสินใจ',
                    text: 'วันนี้เป็นวันที่เหมาะกับการปรับจูนแผนการลงทุนให้เข้ากับสถานการณ์ปัจจุบัน การวิเคราะห์อย่างมีชั้นเชิงจะช่วยให้คุณอยู่เหนือตลาดได้ ไม่ว่าทางข้างหน้าจะเป็นอย่างไร คุณมีเครื่องมือและปัญญาพร้อมที่จะรับมือเสมอ',
                    color: '#a78bfa'
                }
            ]);
        }
    };

    const overallSummary = getOverallSummary();

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, minHeight: '90vh' }}>
            {/* Header section */}
            <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 800, mx: 'auto' }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 900,
                        mb: 2,
                        background: 'linear-gradient(135deg, #a78bfa 0%, #0ea5e9 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                >
                    Tarot Prophecy
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    เจาะลึกจิตวิทยาการเทรดด้วย <span style={{ color: '#a78bfa', fontWeight: 800 }}>Three-Card Spread</span>
                </Typography>
            </Box>

            {/* Game Area */}
            <Box sx={{ minHeight: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {gameState === 'idle' && (
                    <Fade in>
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={shuffle}
                                size="large"
                                startIcon={<Magicpen variant="Bold" />}
                                sx={{
                                    borderRadius: 10,
                                    px: 6, py: 2,
                                    fontSize: '1.2rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #0284c7 100%)',
                                    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 15px 40px rgba(124, 58, 237, 0.4)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                สับไพ่และเริ่มความแม่นยำ
                            </Button>
                        </Box>
                    </Fade>
                )}

                {gameState === 'shuffling' && (
                    <Box sx={{ position: 'relative', height: 300, width: 200 }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    width: '100%', height: '100%',
                                    borderRadius: 4,
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    animation: `shuffle 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
                                    animationDelay: `${i * 0.15}s`,
                                    '@keyframes shuffle': {
                                        '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                                        '25%': { transform: `translate(${i % 2 === 0 ? 80 : -80}px, ${i * 10}px) rotate(${i * 8}deg)` },
                                        '50%': { transform: 'translate(0, 0) rotate(0deg)' },
                                        '75%': { transform: `translate(${i % 2 === 0 ? -80 : 80}px, ${-i * 10}px) rotate(${-i * 8}deg)` },
                                        '100%': { transform: 'translate(0, 0) rotate(0deg)' },
                                    }
                                }}
                            >
                                <Magicpen size={64} color="#a78bfa" opacity={0.1} />
                            </Box>
                        ))}
                    </Box>
                )}

                {gameState === 'selecting' && (
                    <Box sx={{ textAlign: 'center', width: '100%', position: 'relative' }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ color: '#a78bfa', mb: 1, fontWeight: 700 }}>
                                เลือกไพ่ทีละใบจนครบ 3 ใบ
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                เลือกไปแล้ว: <span style={{ color: '#0ea5e9', fontWeight: 800 }}>{selectedIndices.length} / 3</span>
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: { xs: 0.5, md: -10 },
                            px: { xs: 2, md: 6 },
                            perspective: '1000px',
                            maxWidth: 1400,
                            mx: 'auto',
                            minHeight: 350,
                            alignItems: 'center'
                        }}>
                            {[...Array(22)].map((_, i) => {
                                const isSelected = selectedIndices.includes(i);
                                return (
                                    <Box
                                        key={i}
                                        sx={{
                                            position: 'relative',
                                            marginLeft: { xs: 0, md: i === 0 ? 0 : -9 },
                                            marginBottom: { xs: 1, md: 0 },
                                            zIndex: isSelected ? 110 : 1,
                                            animation: !isSelected ? 'float 6s ease-in-out infinite' : 'none',
                                            animationDelay: `${i * 0.1}s`,
                                            '@keyframes float': {
                                                '0%, 100%': { transform: 'translateY(0)' },
                                                '50%': { transform: 'translateY(-12px)' }
                                            },
                                            transition: 'z-index 0.3s'
                                        }}
                                    >
                                        <Box
                                            onClick={() => handleCardToggle(i)}
                                            sx={{
                                                width: { xs: 70, sm: 90, md: 130 },
                                                height: { xs: 110, sm: 140, md: 200 },
                                                borderRadius: 1,
                                                border: isSelected ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.08)',
                                                background: isSelected
                                                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                                cursor: 'pointer',
                                                transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease',
                                                willChange: 'transform',
                                                transform: isSelected
                                                    ? 'translateY(-140px) scale(1.05)'
                                                    : 'translateY(0) scale(1)',
                                                '&:hover': {
                                                    transform: isSelected
                                                        ? 'translateY(-150px) scale(1.08)'
                                                        : 'translateY(-40px) scale(1.02)',
                                                    zIndex: 120,
                                                    borderColor: '#0ea5e9',
                                                    boxShadow: '0 25px 60px rgba(14, 165, 233, 0.35)',
                                                },
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: isSelected
                                                    ? '0 30px 70px rgba(0,0,0,0.6)'
                                                    : '-5px 0 15px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            <Magicpen
                                                size={32}
                                                color={isSelected ? "#0ea5e9" : "#0ea5e9"}
                                                opacity={isSelected ? 1 : 0.15}
                                            />
                                            {isSelected && (
                                                <Fade in timeout={800}>
                                                    <Box sx={{
                                                        position: 'absolute', top: -14, right: -14,
                                                        width: 30, height: 30, borderRadius: '50%',
                                                        bgcolor: '#0ea5e9', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.9rem', fontWeight: 900,
                                                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.7)',
                                                        border: '2.5px solid #0f172a',
                                                        zIndex: 5
                                                    }}>
                                                        {selectedIndices.indexOf(i) + 1}
                                                    </Box>
                                                </Fade>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {selectedIndices.length === 3 && (
                            <Fade in>
                                <Box sx={{ mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        onClick={revealFate}
                                        size="large"
                                        startIcon={<Global variant="Outline" color="#0ea5e9" />}
                                        sx={{
                                            borderRadius: 10,
                                            px: 8, py: 2,
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            background: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
                                            boxShadow: '0 10px 40px rgba(14, 165, 233, 0.4)',
                                            animation: 'pulse 2s infinite',
                                            '@keyframes pulse': {
                                                '0%': { transform: 'scale(1)', boxShadow: '0 10px 40px rgba(14, 165, 233, 0.4)' },
                                                '50%': { transform: 'scale(1.05)', boxShadow: '0 15px 50px rgba(14, 165, 233, 0.6)' },
                                                '100%': { transform: 'scale(1)', boxShadow: '0 10px 40px rgba(14, 165, 233, 0.4)' }
                                            }
                                        }}
                                    >
                                        เปิดตาเห็นชะตา
                                    </Button>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                )}

                {gameState === 'revealed' && (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 4,
                            justifyContent: 'center'
                        }}>
                            {slots.map((slot, index) => (
                                <Box key={index} sx={{ flex: 1, maxWidth: { md: 350 } }}>
                                    <Fade in timeout={500 + (index * 500)}>
                                        <Box>
                                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    {slot.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {slot.description}
                                                </Typography>
                                            </Box>

                                            {/* Card Flip Container */}
                                            <Box sx={{
                                                perspective: '1000px',
                                                width: '100%',
                                                maxWidth: 240,
                                                height: 360,
                                                mx: 'auto',
                                                mb: 3
                                            }}>
                                                <Box sx={{
                                                    position: 'relative', width: '100%', height: '100%',
                                                    textAlign: 'center', transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                    transformStyle: 'preserve-3d',
                                                    transform: slot.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                }}>
                                                    {/* Back */}
                                                    <Box sx={{
                                                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                                        borderRadius: 2, border: '2px solid rgba(255,255,255,0.08)',
                                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Magicpen size={64} color="#a78bfa" opacity={0.15} />
                                                    </Box>

                                                    {/* Front */}
                                                    <Box sx={{
                                                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                                        borderRadius: 2, border: `3px solid ${slot.card?.color || 'white'}`,
                                                        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                        transform: 'rotateY(180deg)', p: 2,
                                                        boxShadow: `0 0 30px ${slot.card?.color}33`
                                                    }}>
                                                        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: `${slot.card?.color}11`, mb: 2 }}>
                                                            <CardIcon name={slot.card?.icon || ''} color={slot.card?.color || ''} size={42} />
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'white', mb: 0.5, fontSize: '1.1rem' }}>
                                                            {slot.card?.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: slot.card?.color, fontWeight: 800 }}>
                                                            {slot.card?.nameTh.split(' - ')[0]}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Content revealing after flip */}
                                            <Fade in={slot.isFlipped} timeout={1000}>
                                                <Paper sx={{
                                                    p: 2.5, borderRadius: 3,
                                                    bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }
                                                }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
                                                        {slot.card?.nameTh}
                                                    </Typography>

                                                    <Stack spacing={2.5}>
                                                        {/* Slot-specific deep analysis */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: `${slot.card?.color}11`,
                                                            borderLeft: `3px solid ${slot.card?.color}`
                                                        }}>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                                                <Star size="16" color={slot.card?.color} variant="Bold" />
                                                                <Typography variant="caption" sx={{ fontWeight: 900, color: slot.card?.color, textTransform: 'uppercase' }}>
                                                                    บทวิเคราะห์เฉพาะตำแหน่ง
                                                                </Typography>
                                                            </Stack>
                                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                                {(index === 0 && slot.card?.situationTh) ||
                                                                    (index === 1 && slot.card?.challengeTh) ||
                                                                    (index === 2 && slot.card?.adviceTh) ||
                                                                    slot.card?.tradingMeaning}
                                                            </Typography>
                                                        </Box>

                                                        <Box>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                                <InfoCircle size="14" color="#a78bfa" variant="Bold" />
                                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' }}>ความหมายหลัก</Typography>
                                                            </Stack>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.6 }}>
                                                                {slot.card?.tradingMeaning}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            </Fade>
                                        </Box>
                                    </Fade>
                                </Box>
                            ))}
                        </Box>

                        {/* Overall Summary Section */}
                        {overallSummary && slots[2].isFlipped && (
                            <Fade in timeout={1500}>
                                <Box sx={{ mt: 8, px: { xs: 2, md: 0 } }}>
                                    <Paper sx={{
                                        p: { xs: 3, md: 5 },
                                        borderRadius: 6,
                                        background: `linear-gradient(135deg, ${overallSummary.color}15 0%, rgba(15, 23, 42, 0.4) 100%)`,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${overallSummary.color}33`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        maxWidth: 900,
                                        mx: 'auto'
                                    }}>
                                        {/* Decorative elements */}
                                        <Box sx={{
                                            position: 'absolute', top: -100, right: -100,
                                            width: 250, height: 250, borderRadius: '50%',
                                            background: `${overallSummary.color}15`, filter: 'blur(80px)'
                                        }} />

                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                                            <Box sx={{
                                                p: 3, borderRadius: '50%',
                                                bgcolor: `${overallSummary.color}22`,
                                                border: `2px solid ${overallSummary.color}44`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 0 40px ${overallSummary.color}22`
                                            }}>
                                                <Star size="48" color={overallSummary.color} variant="Bold" />
                                            </Box>

                                            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                                <Typography variant="overline" sx={{ color: overallSummary.color, fontWeight: 900, letterSpacing: 3 }}>
                                                    บทสรุปพยากรณ์รวม
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mt: 1, mb: 2 }}>
                                                    {overallSummary.title}
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                                    {overallSummary.text}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>
                            </Fade>
                        )}

                        {/* Footer Link */}
                        <Box sx={{ textAlign: 'center', mt: 8 }}>
                            <Button
                                variant="outlined"
                                onClick={shuffle}
                                startIcon={<Refresh2 size="20" variant="Outline" color="#a78bfa" />}
                                sx={{
                                    borderRadius: 10, px: 5, py: 1.5,
                                    fontWeight: 700, color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)',
                                    '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167, 139, 250, 0.05)' }
                                }}
                            >
                                ทำนายใหม่อีกครั้ง
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Minimal Disclaimer & Guidelines */}
            <Box sx={{
                mt: { xs: 6, md: 10 }, mb: 4, pt: 4,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                maxWidth: 900, mx: 'auto', px: 2
            }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 8 }}
                    justifyContent="center"
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <InfoCircle size="16" color="#a78bfa" opacity={0.5} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            ความถี่แนะนำ: <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>วันละ 1 ครั้ง</span>
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Global size="16" color="#0ea5e9" opacity={0.5} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            จุดประสงค์: <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>สำรวจ Mindset</span>
                        </Typography>
                    </Stack>
                </Stack>

                <Typography
                    variant="caption"
                    sx={{
                        display: 'block', textAlign: 'center',
                        mt: 4, color: 'rgba(255,255,255,0.12)',
                        fontSize: '0.65rem', letterSpacing: 0.3
                    }}
                >
                    * ไพ่เป็นเครื่องเตือนใจเพื่อฝึกสติเท่านั้น ไม่ใช่สัญญาณซื้อขาย
                </Typography>
            </Box>
        </Container>
    );
}
