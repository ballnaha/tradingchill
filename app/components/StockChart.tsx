'use client';

import React, { useEffect, useRef, memo } from 'react';
import { Box, Typography } from '@mui/material';

interface StockChartProps {
    symbol: string;
    trend: string;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        // TradingView Configuration
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": symbol.includes(':') ? symbol : `${symbol}`,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "3",
            "locale": "th",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "save_image": false,
            "calendar": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "withdateranges": true,
            "range": "3M",
            "details": false,
            "hotlist": false,
            "support_host": "https://www.tradingview.com"
        });

        container.current.appendChild(script);
    }, [symbol]);

    return (
        <Box sx={{
            width: '100%',
            height: 500, // Increased height to accommodate bottom controls
            mt: 2,
            bgcolor: '#10172a', // Darker background to match widget
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: 1 }}>
                    TRADINGVIEW REAL-TIME CHART
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    DATA BY TRADINGVIEW
                </Typography>
            </Box>
            <Box sx={{ flex: 1, width: '100%', position: 'relative', pb: 1 }}>
                <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
                    <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
                </div>
            </Box>
        </Box>
    );
};

export default memo(StockChart);
