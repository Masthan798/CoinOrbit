import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend, Brush
} from 'recharts';
import { coingeckoFetch } from '../../api/coingeckoClient';

const timeframes = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '1M', value: '30' },
    { label: '3M', value: '90' },
    { label: '1Y', value: '365' },
    { label: 'Max', value: 'max' },
];

const GlobalStablecoinsChart = () => {
    const [timeframe, setTimeframe] = useState(timeframes[0]); // Default to 24H
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch top 3 stablecoins: Tether, USDC, Dai
                const [usdtData, usdcData, daiData] = await Promise.all([
                    coingeckoFetch(`coins/tether/market_chart?days=${timeframe.value}&vs_currency=usd`),
                    coingeckoFetch(`coins/usd-coin/market_chart?days=${timeframe.value}&vs_currency=usd`),
                    coingeckoFetch(`coins/dai/market_chart?days=${timeframe.value}&vs_currency=usd`)
                ]);

                if (usdtData.market_caps && usdcData.market_caps && daiData.market_caps) {
                    const length = Math.min(usdtData.market_caps.length, usdcData.market_caps.length, daiData.market_caps.length);
                    const formattedData = [];

                    for (let i = 0; i < length; i++) {
                        formattedData.push({
                            time: usdtData.market_caps[i][0],
                            usdt: usdtData.market_caps[i][1],
                            usdc: usdcData.market_caps[i][1],
                            dai: daiData.market_caps[i][1]
                        });
                    }
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error("Error fetching stablecoin chart:", err);
                setError("Failed to load stablecoin data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [timeframe]);

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
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-bold text-white">USDT: ${(payload[0].value / 1e9).toFixed(2)}B</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-bold text-white">USDC: ${(payload[1].value / 1e9).toFixed(2)}B</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-bold text-white">DAI: ${(payload[2].value / 1e9).toFixed(2)}B</span>
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
                    <h3 className="text-lg font-bold text-white">Stablecoin Market Cap Chart</h3>
                    <p className="text-xs text-gray-400 max-w-xl mt-1">
                        Market capitalization of top stablecoins (USDT, USDC, DAI).
                    </p>
                </div>
                <div className="flex items-center bg-white/5 p-1 rounded-xl">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.label}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${timeframe.label === tf.label ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorUsdt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsdc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDai" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
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
                            <Area type="monotone" dataKey="usdt" stackId="1" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorUsdt)" name="Tether" />
                            <Area type="monotone" dataKey="usdc" stackId="1" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsdc)" name="USDC" />
                            <Area type="monotone" dataKey="dai" stackId="1" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorDai)" name="Dai" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
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
            </div>
        </div>
    );
};

export default GlobalStablecoinsChart;
