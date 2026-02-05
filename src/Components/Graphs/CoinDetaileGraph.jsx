import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Area, Bar, Cell, ReferenceLine
} from 'recharts';
import { CoinMarketChartData, CoinOHLCData } from '../../services/AllcoinsData';
import { TrendingUp, BarChart3, Maximize2, Download, Calendar, MessageSquare, Zap } from 'lucide-react';

const timeframes = [
    { label: '24H', value: '1', interval: 'hourly' },
    { label: '7D', value: '7', interval: 'daily' },
    { label: '1M', value: '30', interval: 'daily' },
    { label: '3M', value: '90', interval: 'daily' },
    { label: '1Y', value: '365', interval: 'daily' },
    { label: 'Max', value: 'max', interval: 'daily' },
];

const CoinDetaileGraph = () => {
    const { coinId } = useParams();
    const [dataType, setDataType] = useState('prices'); // 'prices' | 'market_caps'
    const [chartType, setChartType] = useState('line'); // 'line' | 'ohlc'
    const [timeframe, setTimeframe] = useState(timeframes[0]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (dataType === 'market_caps') {
                    const response = await CoinMarketChartData(coinId, timeframe.value, timeframe.interval === 'daily' ? 'daily' : undefined);
                    if (!response || !response.market_caps) {
                        setChartData([]);
                        return;
                    }

                    const rawData = response.market_caps;
                    const formattedData = rawData.map(([timestamp, value], index) => {
                        const open = index > 0 ? rawData[index - 1][1] : value;
                        const close = value;
                        const high = Math.max(open, close);
                        const low = Math.min(open, close);
                        return {
                            time: timestamp,
                            value: value,
                            vol: response.total_volumes?.[index]?.[1] || 0,
                            open, high, low, close,
                            body: [open, close],
                            wick: [low, high],
                            isUp: close >= open
                        };
                    });
                    setChartData(formattedData);
                } else {
                    // Price mode
                    if (chartType === 'line') {
                        const response = await CoinMarketChartData(coinId, timeframe.value, timeframe.interval === 'daily' ? 'daily' : undefined);
                        if (!response || !response.prices) {
                            setChartData([]);
                            return;
                        }
                        const formattedData = response.prices.map(([timestamp, value], index) => {
                            const prevVal = index > 0 ? response.prices[index - 1][1] : value;
                            return {
                                time: timestamp,
                                value: value,
                                vol: response.total_volumes?.[index]?.[1] || 0,
                                open: prevVal, close: value, high: Math.max(prevVal, value), low: Math.min(prevVal, value),
                                body: [prevVal, value],
                                wick: [Math.min(prevVal, value), Math.max(prevVal, value)],
                                isUp: value >= prevVal
                            };
                        });
                        setChartData(formattedData);
                    } else {
                        // OHLC Mode for Price
                        const [ohlcRes, marketRes] = await Promise.all([
                            CoinOHLCData(coinId, timeframe.value),
                            CoinMarketChartData(coinId, timeframe.value, timeframe.value === '1' ? undefined : 'daily')
                        ]);

                        if (!ohlcRes || !marketRes) {
                            setChartData([]);
                            return;
                        }

                        const formattedData = ohlcRes.map(([timestamp, open, high, low, close]) => {
                            const volEntry = marketRes.total_volumes?.find(v => Math.abs(v[0] - timestamp) < 3600000);
                            return {
                                time: timestamp,
                                open, high, low, close,
                                value: close,
                                vol: volEntry ? volEntry[1] : 0,
                                body: [open, close],
                                wick: [low, high],
                                isUp: close >= open
                            };
                        });
                        setChartData(formattedData);
                    }
                }
            } catch (err) {
                console.error("Error fetching chart data:", err);
                setError(err.message || "Failed to load chart data");
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [coinId, timeframe, dataType, chartType]);

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        if (timeframe.value === '1') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 opacity-60 tracking-wider">
                        {new Date(data.time).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{dataType === 'prices' ? 'Price' : 'Market Cap'}</span>
                            <span className="text-sm font-black text-white">
                                ${data.value?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">Vol</span>
                            <span className="text-sm font-black text-white/70">
                                ${data.vol?.toLocaleString(undefined, { notation: 'compact' })}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 bg-[#0d0e12] rounded-3xl border border-white/5">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setDataType('prices')}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${dataType === 'prices' ? 'bg-[#2d2f39] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Price
                        </button>
                        <button
                            onClick={() => setDataType('market_caps')}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${dataType === 'market_caps' ? 'bg-[#2d2f39] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Market Cap
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-[1px] h-4 bg-white/10 mx-1 sm:mx-2" />
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-1.5 rounded-lg transition-all ${chartType === 'line' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            title="Line Chart"
                        >
                            <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => setChartType('ohlc')}
                            className={`p-1.5 rounded-lg transition-all ${chartType === 'ohlc' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            title="OHLC Chart"
                        >
                            <BarChart3 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>

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
                    <div className="w-[1px] h-4 bg-white/10 mx-1 sm:mx-2 flex-shrink-0" />
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <button className="p-1.5 text-gray-500 hover:text-white transition-all"><Calendar size={13} className="sm:w-3.5 sm:h-3.5" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-white transition-all"><Download size={13} className="sm:w-3.5 sm:h-3.5" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-white transition-all"><Maximize2 size={13} className="sm:w-3.5 sm:h-3.5" /></button>
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
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <Zap size={32} className="text-red-500 opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 italic tracking-tight">DATA FEED OFFLINE</h3>
                            <p className="text-sm text-gray-500 max-w-[300px] leading-relaxed">
                                {error.includes('401')
                                    ? "Unauthorized access. Your CoinGecko API Key seems to be invalid or missing."
                                    : error}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all border border-white/5"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff20" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="#ffffff05" stopOpacity={0} />
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
                            <YAxis
                                yAxisId="value"
                                orientation="right"
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => `$${val.toLocaleString(undefined, { notation: 'compact' })}`}
                            />
                            <YAxis
                                yAxisId="vol"
                                orientation="left"
                                domain={[0, (dataMax) => dataMax * 5]}
                                hide={true}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />

                            <Bar
                                yAxisId="vol"
                                dataKey="vol"
                                fill="url(#volGradient)"
                                barSize={6}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`vol-cell-${index}`} fill={entry.isUp ? '#22c55e10' : '#ef444410'} />
                                ))}
                            </Bar>

                            {chartType === 'line' ? (
                                <Area
                                    yAxisId="value"
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1000}
                                    isAnimationActive={true}
                                />
                            ) : (
                                <>
                                    <Bar yAxisId="value" dataKey="wick" barSize={1} animationDuration={1000}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-wick-${index}`} fill={entry.isUp ? '#22c55e' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                    <Bar yAxisId="value" dataKey="body" barSize={8} animationDuration={1000}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-body-${index}`} fill={entry.isUp ? '#22c55e' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </>
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}

                <div className="absolute bottom-10 right-10 opacity-40 pointer-events-none flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Zap size={14} className="text-white fill-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-white uppercase italic">COIN<span className="text-blue-500">ORBIT</span></span>
                </div>
            </div>
        </div>
    );
};

export default CoinDetaileGraph;
