import React, { useEffect, useState, useRef } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, ComposedChart, Legend
} from 'recharts';
import { CoinMarketChartData } from '../../services/AllcoinsData';
import { TrendingUp, Download, Maximize2, Zap } from 'lucide-react';

const timeframes = [
    { label: '24H', value: '1', interval: 'hourly' },
    { label: '7D', value: '7', interval: 'daily' },
    { label: '1M', value: '30', interval: 'daily' },
    { label: '3M', value: '90', interval: 'daily' },
    { label: '1Y', value: '365', interval: 'daily' },
    { label: 'Max', value: 'max', interval: 'daily' },
];

const CompareGraph = ({ coin1Id, coin2Id, coin1Name, coin2Name, coin1Color = "#ef4444", coin2Color = "#3b82f6", dataType = 'prices' }) => {
    const [timeframe, setTimeframe] = useState(timeframes[1]); // Default 7D
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!coin1Id || !coin2Id) return;

            setLoading(true);
            setError(null);
            try {
                const [data1, data2] = await Promise.all([
                    CoinMarketChartData(coin1Id, timeframe.value, timeframe.interval === 'daily' ? 'daily' : undefined),
                    CoinMarketChartData(coin2Id, timeframe.value, timeframe.interval === 'daily' ? 'daily' : undefined)
                ]);

                if (!data1?.[dataType] || !data2?.[dataType]) {
                    setChartData([]);
                    return;
                }

                // Normalize data to align timestamps (roughly)
                // We'll use the shorter array or map based on time
                const map1 = new Map(data1[dataType].map(([t, v]) => [t, v]));
                const merged = data2[dataType].map(([t, v2]) => {
                    // Find closest timestamp in data1
                    // Since APIs return slightly different timestamps, we might need approximate matching or just use the separate arrays if recharts supports it. 
                    // For simplicity in Recharts with one X-axis, we need shared objects.
                    // Let's rely on the fact that if we request same range, we get similar timestamps.

                    // Simple approach: Iterate data1 and find match. 
                    // Actually, let's just format them.
                    return {
                        time: t,
                        coin2: v2,
                        coin1: null // placeholder
                    };
                });

                // Now fill coin1 data. Since timestamps might not match exactly, we'll look for closest.
                // Optimizing: Just assume similar length and index if 7D/daily. 
                // Better: Create a combined sorted list of all timestamps? No, that's too heavy.
                // Let's use the timestamps from the first coin and try to find the second coin's value at that time.

                const processData = (baseData, secondaryData) => {
                    return baseData.map(([t, v]) => {
                        // Find closest in secondary
                        const closest = secondaryData.reduce((prev, curr) => {
                            return (Math.abs(curr[0] - t) < Math.abs(prev[0] - t) ? curr : prev);
                        });

                        // Only accept if within reasonable delta (e.g. 1 hour for daily, 5 mins for hourly)
                        // distinct timestamps make this hard.
                        // ALTERNATIVE: Use 2 separate data arrays in Recharts? No, it prefers one array of objects.

                        return {
                            time: t,
                            value1: v,
                            value2: closest ? closest[1] : null
                        };
                    });
                };

                const formatted = processData(data1[dataType], data2[dataType]);
                setChartData(formatted);

            } catch (err) {
                console.error("Error fetching comparison chart data:", err);
                setError("Failed to load chart data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [coin1Id, coin2Id, timeframe, dataType]);

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        if (timeframe.value === '1') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatValue = (val) => {
        if (val === null || val === undefined) return 'N/A';
        if (dataType === 'prices') {
            return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        // For Market Cap and Volume, use compact notation if large
        if (val >= 1000000000) {
            return `$${(val / 1000000000).toFixed(2)}B`;
        }
        if (val >= 1000000) {
            return `$${(val / 1000000).toFixed(2)}M`;
        }
        return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 opacity-60 tracking-wider">
                        {new Date(label).toLocaleString(undefined, {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: entry.color }}>
                                {entry.name}
                            </span>
                            <span className="text-sm font-black text-white">
                                {formatValue(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 bg-[#0d0e12] rounded-3xl border border-white/5">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-white px-2">
                        {dataType === 'market_caps' ? 'Market Cap' : dataType === 'total_volumes' ? 'Volume' : 'Price'} Comparison
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 min-w-max">
                            {timeframes.map((tf) => (
                                <button
                                    key={tf.label}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black transition-all ${timeframe.label === tf.label ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {error ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0d0e12] rounded-2xl border border-white/5 p-8 text-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={coin1Color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={coin1Color} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={coin2Color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={coin2Color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickFormatter={formatXAxis}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                minTickGap={60}
                            />
                            {/* YAxis for Coin 1 */}
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                hide={true} // Hide mostly to keep it clean, or show via tooltip
                            />
                            {/* YAxis for Coin 2 */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                hide={true}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
                            <Legend />

                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="value1"
                                name={coin1Name}
                                stroke={coin1Color}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorValue1)"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="value2"
                                name={coin2Name}
                                stroke={coin2Color}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorValue2)"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default CompareGraph;
