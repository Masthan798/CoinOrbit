import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Area, Bar, Cell, ReferenceLine, Brush
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

const CoinDetailGraph = ({ coinId: propCoinId }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const chartHeight = isMobile ? "h-[300px]" : "h-[500px]";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const { coinId: paramCoinId } = useParams();
    const coinId = propCoinId || paramCoinId;
    const [dataType, setDataType] = useState('prices'); // 'prices' | 'market_caps'
    const [chartType, setChartType] = useState('line'); // 'line' | 'ohlc'
    const [timeframe, setTimeframe] = useState(timeframes[0]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);

    // Zoom state
    const [left, setLeft] = useState('dataMin');
    const [right, setRight] = useState('dataMax');
    const [top, setTop] = useState('auto');
    const [bottom, setBottom] = useState('auto');
    const [cursorTime, setCursorTime] = useState(null);

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

    // Reset zoom when timeframe or data type changes
    useEffect(() => {
        setLeft('dataMin');
        setRight('dataMax');
        setTop('auto');
        setBottom('auto');
    }, [timeframe, dataType]);

    const handleWheel = (e) => {
        if (!chartData || chartData.length === 0 || !e) return;

        const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95; // Slightly smoother factor

        // Block the entire website from scrolling
        if (e.cancelable) e.preventDefault();

        // Calculate focus point logic...
        const currentLeft = left === 'dataMin' ? chartData[0].time : left;
        const currentRight = right === 'dataMax' ? chartData[chartData.length - 1].time : right;
        const range = currentRight - currentLeft;

        const focusPoint = cursorTime || (currentLeft + currentRight) / 2;

        const newRange = range * zoomFactor;

        // Limits
        if (newRange < 60000 && zoomFactor < 1) return;
        if (newRange > (chartData[chartData.length - 1].time - chartData[0].time) * 3 && zoomFactor > 1) {
            setLeft('dataMin');
            setRight('dataMax');
            setTop('auto');
            setBottom('auto');
            return;
        }

        const leftRatio = (focusPoint - currentLeft) / range;
        const rightRatio = (currentRight - focusPoint) / range;

        const nextLeft = focusPoint - (newRange * leftRatio);
        const nextRight = focusPoint + (newRange * rightRatio);

        setLeft(nextLeft);
        setRight(nextRight);

        const visibleData = chartData.filter(d => d.time >= nextLeft && d.time <= nextRight);
        if (visibleData.length > 0) {
            const vals = visibleData.map(d => d.value);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            setBottom(min * 0.995);
            setTop(max * 1.005);
        }
    };

    // Native event listener for non-passive wheel events (to block page scroll)
    useEffect(() => {
        const chartElem = chartRef.current;
        if (chartElem) {
            chartElem.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (chartElem) {
                chartElem.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    const handleMouseMove = (e) => {
        if (e && e.activeLabel) {
            setCursorTime(e.activeLabel);
        }
    };

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
                <div className="bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl min-w-[140px] sm:min-w-[200px]">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-2 opacity-60 tracking-wider">
                        {new Date(data.time).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-tight">{dataType === 'prices' ? 'Price' : 'Cap'}</span>
                            <span className="text-xs sm:text-sm font-black text-white">
                                ${data.value?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-tight">Vol</span>
                            <span className="text-xs sm:text-sm font-black text-white/70">
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
        <div className="w-full h-full flex flex-col gap-4 sm:gap-6 p-2 sm:p-6 bg-[#0d0e12] rounded-2xl sm:rounded-3xl border border-white/5">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base sm:text-lg font-bold text-white px-2">Price & Market Cap Chart</h3>
                    <p className='text-[10px] sm:text-xs text-gray-400 px-2'>Historical performance and market capitalization trend.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setDataType('prices')}
                            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dataType === 'prices' ? 'bg-white text-black shadow-xl scale-102' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Price
                        </button>
                        <button
                            onClick={() => setDataType('market_caps')}
                            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dataType === 'market_caps' ? 'bg-white text-black shadow-xl scale-102' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Market Cap
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-1.5 rounded-lg transition-all ${chartType === 'line' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                                title="Line Chart"
                            >
                                <TrendingUp size={14} />
                            </button>
                            <button
                                onClick={() => setChartType('ohlc')}
                                className={`p-1.5 rounded-lg transition-all ${chartType === 'ohlc' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                                title="OHLC Chart"
                            >
                                <BarChart3 size={14} />
                            </button>
                        </div>

                        <div className="w-[1px] h-4 bg-white/10 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                            {timeframes.map((tf) => (
                                <button
                                    key={tf.label}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black transition-all ${timeframe.label === tf.label ? 'bg-white text-black shadow-xl' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`w-full ${isMobile ? 'min-h-[300px]' : 'min-h-[500px]'} relative`} ref={chartRef}>
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
                                {String(error).includes('401')
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
                ) : chartData.length === 0 ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0d0e12] rounded-2xl border border-white/5 p-8 text-center">
                        <BarChart3 size={32} className="text-gray-600 opacity-50" />
                        <p className="text-sm text-gray-500 italic">No historical data available for this coin.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setCursorTime(null)}
                            margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? 10 : 0, bottom: 0 }}
                        >
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
                                domain={[left, right]}
                                type="number"
                                scale="time"
                                allowDataOverflow
                            />
                            <YAxis
                                yAxisId="value"
                                orientation="right"
                                domain={[bottom, top]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => `$${val?.toLocaleString(undefined, { notation: 'compact' })}`}
                                allowDataOverflow
                                width={isMobile ? 0 : 60}
                            />
                            <YAxis
                                yAxisId="vol"
                                orientation="left"
                                domain={[0, (dataMax) => dataMax * 5]}
                                hide={true}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                                allowEscapeViewBox={{ x: false, y: false }}
                            />

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
                            <Brush
                                dataKey="time"
                                height={30}
                                stroke="#10b981"
                                fill="#0b0e11"
                                tickFormatter={() => ''}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}


            </div>

        </div >
    );
};

export default CoinDetailGraph;
