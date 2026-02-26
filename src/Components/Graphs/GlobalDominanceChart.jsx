import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend, Brush
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

const GlobalDominanceChart = () => {
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
                // Fetch BTC and ETH data concurrently
                const [btcData, ethData] = await Promise.all([
                    coingeckoFetch(`coins/bitcoin/market_chart?days=${timeframe.value}&vs_currency=${currency.code}`),
                    coingeckoFetch(`coins/ethereum/market_chart?days=${timeframe.value}&vs_currency=${currency.code}`)
                ]);

                if (btcData.market_caps && ethData.market_caps) {
                    // Combine data based on shortest length to avoid index mismatch
                    const length = Math.min(btcData.market_caps.length, ethData.market_caps.length);
                    const formattedData = [];

                    for (let i = 0; i < length; i++) {
                        formattedData.push({
                            time: btcData.market_caps[i][0],
                            btc: btcData.market_caps[i][1],
                            eth: ethData.market_caps[i][1]
                        });
                    }
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error("Error fetching dominance data:", err);
                setError("Failed to load dominance data.");
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
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-[11px] sm:text-sm font-bold text-white">BTC: {formatPrice(payload[0].value, { notation: 'compact' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-[11px] sm:text-sm font-bold text-white">ETH: {formatPrice(payload[1].value, { notation: 'compact' })}</span>
                        </div>
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
                    <h3 className="text-base sm:text-lg font-bold text-white">Bitcoin vs Ethereum Dominance</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 max-w-xl mt-1">
                        Market capitalization trends comparison.
                    </p>
                </div>
                <div className="flex items-center bg-white/5 p-0.5 sm:p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.label}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${timeframe.label === tf.label ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 w-full ${isMobile ? 'h-[300px]' : 'h-[500px]'} relative`}>
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin"></div>
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
                                <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                dataKey="btc"
                                stackId="1"
                                stroke="#f97316"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBtc)"
                                name="Bitcoin"
                            />
                            <Area
                                type="monotone"
                                dataKey="eth"
                                stackId="1"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorEth)"
                                name="Ethereum"
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Brush
                                dataKey="time"
                                height={30}
                                stroke="#f97316"
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

export default GlobalDominanceChart;
