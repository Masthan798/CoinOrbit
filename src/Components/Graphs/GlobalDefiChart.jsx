import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Brush
} from 'recharts';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { useCurrency } from '../../Context/CurrencyContext';

const timeframes = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '1M', value: '30' },
    { label: '3M', value: '90' },
    { label: '1Y', value: '365' },
    { label: 'Max', value: 'max' },
];

const GlobalDefiChart = () => {
    const [timeframe, setTimeframe] = useState(timeframes[0]); // Default to 24H
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { currency, formatPrice } = useCurrency();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Using Uniswap (UNI) as a proxy for DeFi Market Trend
                const data = await coingeckoFetch(`coins/uniswap/market_chart?days=${timeframe.value}&vs_currency=${currency.code}`);

                if (data.market_caps) {
                    const formattedData = data.market_caps.map(item => ({
                        time: item[0],
                        value: item[1]
                    }));
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error("Error fetching DeFi chart:", err);
                setError("Failed to load DeFi data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [timeframe, currency.code]);

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl min-w-[140px] sm:min-w-[200px]">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-2 opacity-60 tracking-wider">
                        {new Date(label).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white">
                            {formatPrice(payload[0].value, { notation: 'compact' })}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 sm:gap-6 p-2 sm:p-6 bg-[#0d0e12] rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">DeFi Market Cap Chart</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 max-w-xl mt-1">
                        Historical DeFi market cap (Proxied via Top Assets).
                    </p>
                </div>
                <div className="flex items-center bg-white/5 p-0.5 sm:p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.label}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${timeframe.label === tf.label ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 w-full ${isMobile ? 'h-[300px]' : 'h-[500px]'} relative`}>
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? 10 : 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorDefi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickFormatter={formatXAxis}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                minTickGap={50}
                            />
                            <YAxis
                                hide={isMobile}
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickFormatter={(val) => formatPrice(val, { notation: 'compact', maximumFractionDigits: 0 })}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                allowEscapeViewBox={{ x: false, y: false }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#a855f7"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorDefi)"
                            />
                            <Brush
                                dataKey="time"
                                height={30}
                                stroke="#a855f7"
                                fill="#0b0e11"
                                tickFormatter={() => ''}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default GlobalDefiChart;
