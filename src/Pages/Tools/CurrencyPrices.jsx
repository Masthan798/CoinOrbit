import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star, Flame, Rocket, ArrowRight, ArrowUpRight } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Pagination from '../../Components/Pagination/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '../../Components/Toggles/Toggle';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const CurrencyPrices = () => {
    const { currencyCode } = useParams();
    const navigate = useNavigate();
    const currency = currencyCode?.toLowerCase() || 'usd';
    const currencyUpper = currency.toUpperCase();

    const [coins, setCoins] = useState([]);
    const [globalData, setGlobalData] = useState(null);
    const [sparklineData, setSparklineData] = useState(null);
    const [trendingData, setTrendingData] = useState([]);
    const [gainersData, setGainersData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [highlightsLoading, setHighlightsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [favorites, setFavorites] = useState([]);

    const [showHighlights, setShowHighlights] = useState(() => {
        const saved = localStorage.getItem('currencyPricesHighlights');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const API_KEY = 'CG-YuB3NdXKuFv58irhTuLNk2S9';
    const options = {
        method: 'GET',
        headers: { 'x-cg-demo-api-key': API_KEY }
    };

    const toggleFavorite = (rank) => {
        setFavorites(prev =>
            prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
        );
    };

    const formatCurrency = (val, maximumFractionDigits = 0) => {
        if (val === undefined || val === null) return '...';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyUpper,
                minimumFractionDigits: 0,
                maximumFractionDigits: maximumFractionDigits
            }).format(val);
        } catch (e) {
            return `${currencyUpper} ${val.toLocaleString()}`;
        }
    };

    // Fetch Global and Highlights Data
    useEffect(() => {
        const fetchHighlights = async () => {
            setHighlightsLoading(true);
            try {
                // 1. Global Data
                const globalJson = await coingeckoFetch('global');
                if (globalJson.data) setGlobalData(globalJson.data);

                // 2. Sparkline Proxy (BTC)
                const sparkJson = await coingeckoFetch(`coins/bitcoin/market_chart?days=7&vs_currency=${currency}`);
                if (sparkJson.market_caps) {
                    setSparklineData({
                        market_caps: sparkJson.market_caps.map(item => item[1]),
                        total_volumes: sparkJson.total_volumes.map(item => item[1]),
                    });
                }

                // 3. Trending
                const trendingRes = await coingeckoFetch('search/trending');
                if (trendingRes.coins) {
                    const topTrending = trendingRes.coins.slice(0, 3);
                    const ids = topTrending.map(c => c.item.id).join(',');
                    // Fetch real prices for these trending coins in the target currency
                    const priceRes = await coingeckoFetch(`simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true`);

                    const trendingWithPrices = topTrending.map(coin => ({
                        ...coin,
                        price: priceRes[coin.item.id]?.[currency],
                        change: priceRes[coin.item.id]?.[`${currency}_24h_change`]
                    }));
                    setTrendingData(trendingWithPrices);
                }

                // 4. Top Gainers
                const marketsJson = await coingeckoFetch(`coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`);
                if (Array.isArray(marketsJson)) {
                    const sorted = [...marketsJson].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
                    setGainersData(sorted.slice(0, 3));
                }
            } catch (err) {
                console.error("Error fetching highlights:", err);
            } finally {
                setHighlightsLoading(false);
            }
        };
        fetchHighlights();
    }, [currency]);

    // Fetch Main Table Data
    useEffect(() => {
        const fetchMarkets = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await coingeckoFetch(
                    `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,24h,7d`
                );
                if (Array.isArray(response)) {
                    setCoins(response);
                } else {
                    throw new Error("No data received");
                }
            } catch (err) {
                setError(err.message || "Failed to fetch market data");
            } finally {
                setLoading(false);
            }
        };
        fetchMarkets();
    }, [currency, currentPage, perPage]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedCoins = useMemo(() => {
        if (!sortConfig.key) return coins;
        return [...coins].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [coins, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
            : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
    };

    const SparklineChart = ({ data, color, height = 40 }) => (
        <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.map(v => ({ value: v }))}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center bg-main min-h-screen p-2 pb-20 gap-8"
        >
            <div className="w-full">
                <Breadcrumbs
                    crumbs={[
                        { label: 'Cryptocurrencies', path: '/' },
                        { label: 'Converter', path: '/converter' },
                        { label: `Price ${currencyUpper}` }
                    ]}
                />
            </div>

            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white">Cryptocurrency Prices in {globalData?.total_market_cap?.[currency] ? '' : ''} {currencyUpper}</h1>
                    <p className="text-muted text-sm">Find the price of top cryptocurrencies in {currencyUpper}. Price and market data are updated frequently.</p>
                </div>
                <Toggle
                    isOn={showHighlights}
                    handleToggle={() => {
                        const next = !showHighlights;
                        setShowHighlights(next);
                        localStorage.setItem('currencyPricesHighlights', JSON.stringify(next));
                    }}
                    label="Highlights"
                />
            </div>

            <AnimatePresence>
                {showHighlights && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {highlightsLoading ? (
                                <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-3 min-h-[210px]">
                                        <div className="bg-[#0b0e11] border border-gray-800 rounded-2xl p-4 flex flex-1 items-center justify-between hover:border-green-500 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-bold text-white">{formatCurrency(globalData?.total_market_cap?.[currency])}</span>
                                                <span className="text-sm text-muted">Market Cap</span>
                                            </div>
                                            <div className="w-24 h-12">
                                                {sparklineData?.market_caps && <SparklineChart data={sparklineData.market_caps} color="#22c55e" />}
                                            </div>
                                        </div>
                                        <div className="bg-[#0b0e11] border border-gray-800 rounded-2xl p-4 flex flex-1 items-center justify-between hover:border-red-500 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-bold text-white">{formatCurrency(globalData?.total_volume?.[currency])}</span>
                                                <span className="text-sm text-muted">24h Trading Volume</span>
                                            </div>
                                            <div className="w-24 h-12">
                                                {sparklineData?.total_volumes && <SparklineChart data={sparklineData.total_volumes} color="#ef4444" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#0b0e11] border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 h-[210px]">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2"><Flame size={18} className="text-orange-500" /><h3 className="font-bold">Trending</h3></div>
                                            <Link to="/highlights/trending" className="text-xs text-muted hover:text-white flex items-center gap-1">View more <ArrowRight size={12} /></Link>
                                        </div>
                                        <div className="flex flex-col divide-y divide-gray-800">
                                            {trendingData.map(coin => (
                                                <div
                                                    key={coin.item.id}
                                                    onClick={() => navigate(`/marketcap/${coin.item.id}`)}
                                                    className="flex justify-between items-center py-2 hover:bg-white/5 transition-colors rounded-lg px-2 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <img src={coin.item.thumb} alt="" className="w-5 h-5 rounded-sm" />
                                                        <span className="text-sm truncate">{coin.item.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-white">{formatCurrency(coin.price, 2)}</span>
                                                        {coin.change !== undefined && (
                                                            <span className={`text-[10px] font-bold ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-[#0b0e11] border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 h-[210px]">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2"><Rocket size={18} className="text-green-500" /><h3 className="font-bold">Top Gainers</h3></div>
                                            <Link to="/highlights/gainers-losers" className="text-xs text-muted hover:text-white flex items-center gap-1">View more <ArrowRight size={12} /></Link>
                                        </div>
                                        <div className="flex flex-col divide-y divide-gray-800">
                                            {gainersData.map(coin => (
                                                <div
                                                    key={coin.id}
                                                    onClick={() => navigate(`/marketcap/${coin.id}`)}
                                                    className="flex justify-between items-center py-2 hover:bg-white/5 transition-colors rounded-lg px-2 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <img src={coin.image} alt="" className="w-5 h-5 rounded-sm" />
                                                        <span className="text-sm truncate">{coin.name}</span>
                                                    </div>
                                                    <span className="text-sm text-green-500 font-bold">+{coin.price_change_percentage_24h?.toFixed(2)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full overflow-x-auto h-[600px] overflow-y-auto no-scrollbar relative rounded-3xl border border-gray-800 bg-[#0b0e11]">
                <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                    <thead className="text-muted border-b border-gray-800 sticky top-0 bg-[#0b0e11] z-20">
                        <tr>
                            <th className="p-4 w-12 text-center sticky left-0 bg-[#0b0e11] z-30">#</th>
                            <th className="p-4 transition-colors hover:text-white cursor-pointer sticky left-12 bg-[#0b0e11] z-30 min-w-[150px]" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1">Coin <SortIcon columnKey="name" /></div>
                            </th>
                            <th className="p-4 transition-colors hover:text-white cursor-pointer" onClick={() => handleSort('current_price')}>
                                <div className="flex items-center gap-1">Price <SortIcon columnKey="current_price" /></div>
                            </th>
                            <th className="p-4 text-center">1h</th>
                            <th className="p-4 text-center">24h</th>
                            <th className="p-4 text-center">7d</th>
                            <th className="p-4 transition-colors hover:text-white cursor-pointer" onClick={() => handleSort('total_volume')}>
                                <div className="flex items-center gap-1">24h Volume <SortIcon columnKey="total_volume" /></div>
                            </th>
                            <th className="p-4 transition-colors hover:text-white cursor-pointer" onClick={() => handleSort('market_cap')}>
                                <div className="flex items-center gap-1">Market Cap <SortIcon columnKey="market_cap" /></div>
                            </th>
                            <th className="p-4 w-32">Last 7 Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="p-0"><TableSkeleton rows={perPage} columns={9} /></td></tr>
                        ) : error ? (
                            <tr><td colSpan="9" className="py-20 text-center text-red-500 italic">{error}</td></tr>
                        ) : (
                            sortedCoins.map((coin, idx) => (
                                <tr key={coin.id} onClick={() => navigate(`/marketcap/${coin.id}`)} className="border-b border-gray-800/50 hover:bg-card/50 transition-colors cursor-pointer group">
                                    <td className="p-4 text-center text-muted font-medium sticky left-0 bg-[#0b0e11] group-hover:bg-card/50 z-10">{(currentPage - 1) * perPage + idx + 1}</td>
                                    <td className="p-4 sticky left-12 bg-[#0b0e11] group-hover:bg-card/50 z-10 min-w-[150px]">
                                        <div className="flex items-center gap-3">
                                            <img src={coin.image} alt="" className="w-6 h-6 rounded-sm" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white transition-colors">{coin.name}</span>
                                                <span className="text-xs text-muted uppercase">{coin.symbol}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-white">{formatCurrency(coin.current_price, 2)}</td>
                                    <td className={`p-4 text-center font-medium ${coin.price_change_percentage_1h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {coin.price_change_percentage_1h_in_currency?.toFixed(1)}%
                                    </td>
                                    <td className={`p-4 text-center font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {coin.price_change_percentage_24h?.toFixed(1)}%
                                    </td>
                                    <td className={`p-4 text-center font-medium ${coin.price_change_percentage_7d_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {coin.price_change_percentage_7d_in_currency?.toFixed(1)}%
                                    </td>
                                    <td className="p-4 font-medium">{formatCurrency(coin.total_volume)}</td>
                                    <td className="p-4 font-medium">{formatCurrency(coin.market_cap)}</td>
                                    <td className="p-4">
                                        <div className="w-24 h-10">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={coin.sparkline_in_7d?.price?.map(p => ({ v: p })) || []}>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="v"
                                                        stroke={coin.price_change_percentage_7d_in_currency >= 0 ? '#22c55e' : '#ef4444'}
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="w-full">
                <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    totalItems={100} // Basic limitation for this specific view
                />
            </div>
        </motion.div>
    );
};

export default CurrencyPrices;
