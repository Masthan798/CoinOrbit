import React, { useEffect, useState, useRef } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Brush
} from 'recharts';
import { Zap } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';

const timeframes = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '1M', value: '30' },
    { label: '3M', value: '90' },
    { label: '1Y', value: '365' },
    { label: 'Max', value: 'max' },
];

const GlobalMarketGraph = ({ apiKey }) => {
    const [timeframe, setTimeframe] = useState(timeframes[5]); // Default to Max
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Using Bitcoin as a proxy for Global Market Trend since Global Historical Data is restricted on Demo Plan
                const options = {
                    method: 'GET',
                    headers: { 'x-cg-demo-api-key': apiKey || 'CG-YuB3NdXKuFv58irhTuLNk2S9' }
                };

                const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?days=${timeframe.value}&vs_currency=usd`, options);

                if (!response.ok) throw new Error('Failed to fetch chart data');

                const data = await response.json();

                if (data.market_caps) {
                    const formattedData = data.market_caps.map(item => ({
                        time: item[0],
                        value: item[1]
                    }));
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error("Error fetching chart:", err);
                setError("Failed to load chart data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [timeframe, apiKey]);

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 opacity-60 tracking-wider">
                        {new Date(label).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                            ${(payload[0].value / 1e9).toFixed(2)} Billion
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 p-6 bg-[#0d0e12] rounded-3xl border border-white/5 relative overflow-hidden">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Market Trend Chart (BTC)</h3>
                    <p className="text-xs text-gray-400 max-w-xl mt-1">
                        Displaying Bitcoin market cap history as a reference for global market trends.
                    </p>
                </div>
                <div className="flex items-center bg-white/5 p-1 rounded-xl">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.label}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${timeframe.label === tf.label ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMarketCap)"
                            />
                            <Brush
                                dataKey="time"
                                height={30}
                                stroke="#22c55e"
                                fill="#0b0e11"
                                tickFormatter={() => ''}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                <div className="absolute bottom-4 right-4 opacity-40 pointer-events-none flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Zap size={14} className="text-white fill-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-white uppercase italic">COIN<span className="text-blue-500">ORBIT</span></span>
                </div>
            </div>
        </div>
    );
};

export default GlobalMarketGraph;
