import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion } from 'framer-motion'
import { Info, ArrowRight as ArrowRightIcon, ChevronUp, ChevronDown, ArrowUpRight } from 'lucide-react';
import Pagination from '../../Components/Pagination/Pagination';
import ExchangeDetailsGraph from '../../Components/Graphs/ExchangeDetailsGraph';
import ExchangeStats from '../../Components/Graphs/ExchangeStats';
import ExchangeInfo from '../../Components/Exchanges/ExchangeInfo';
import ExchangeTrustStats from '../../Components/Exchanges/ExchangeTrustStats';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';
import { useCurrency } from '../../Context/CurrencyContext';




const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            duration: 0.5
        }
    }
};

// const expandVariants = {
//     hidden: {
//         height: 0,
//         opacity: 0,
//         marginTop: 0,
//         transition: {
//             height: { duration: 0.3 },
//             opacity: { duration: 0.2 }
//         }
//     },
//     visible: {
//         height: "auto",
//         opacity: 1,
//         marginTop: 16,
//         transition: {
//             height: { duration: 0.3 },
//             opacity: { duration: 0.4 },
//             staggerChildren: 0.1
//         }
//     }
// };

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
        scale: 1.03,
        y: -4,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    }
};

const ExchangeDetail = () => {
    const { exchangeId } = useParams();
    const navigate = useNavigate();
    const { currency, formatPrice } = useCurrency();
    const [exchange, setExchange] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Spot');
    const [error, setError] = useState(null);
    const [exhangeData, setExchangeData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [volumeSparkline, setVolumeSparkline] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');


    const tabs = ['Spot', 'Perpetuals', 'Features'];

    // Sparkline component for mini charts
    const Sparkline = ({ data, color, height = 40 }) => (
        <div style={{ height }} className="w-24">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.map(v => ({ value: v }))}>
                    <defs>
                        <linearGradient id={`gradient-${color}-ex`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${color}-ex)`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    // Determine trend for volume card
    const getVolumeTrendColor = () => {
        if (!volumeSparkline || volumeSparkline.length < 2) return 'border-gray-800';
        const start = volumeSparkline[0];
        const end = volumeSparkline[volumeSparkline.length - 1];
        return end >= start ? 'hover:border-green-500' : 'hover:border-red-500';
    };

    const getSparklineColor = () => {
        if (!volumeSparkline || volumeSparkline.length < 2) return '#22c55e';
        const start = volumeSparkline[0];
        const end = volumeSparkline[volumeSparkline.length - 1];
        return end >= start ? '#22c55e' : '#ef4444';
    };

    useEffect(() => {
        const fetchExchangeDetail = async () => {
            setLoading(true);
            try {
                const response = await coingeckoFetch(`/exchanges/${exchangeId}`);
                setExchange(response);

                // Fetch 7-day volume chart for sparkline
                const volumeRes = await coingeckoFetch(`/exchanges/${exchangeId}/volume_chart?days=7`);
                // volume_chart returns array of [timestamp, volume]
                if (Array.isArray(volumeRes)) {
                    setVolumeSparkline(volumeRes.map(item => item[1]));
                }
            } catch (error) {
                console.error("Error fetching exchange details:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchExchangeDetail();
    }, [exchangeId]);

    const fetchExchangeData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'Perpetuals') {
                // Mock Perpetuals Data
                const mockPerps = Array(perPage).fill(null).map((_, i) => ({
                    base: `BTC`,
                    target: 'USD-PERP',
                    coin_id: `bitcoin-perp-${i}`,
                    last_traded_at: new Date(Date.now() - Math.random() * 10000000).toISOString(),
                    converted_last: { usd: 40000 + Math.random() * 2000 },
                    converted_volume: { usd: 1000000 + Math.random() * 5000000 },
                    bid_ask_spread_percentage: 0.01 + Math.random() * 0.05,
                    open_interest_usd: 50000000 + Math.random() * 10000000,
                    funding_rate: 0.01,
                    trade_url: '#'
                }));
                setExchangeData(mockPerps);
            } else if (activeTab === 'Spot') {
                // CoinGecko API returns 100 tickers per page and doesn't support a per_page parameter.
                // We calculate which API page we need and then slice the results.
                const apiPage = Math.floor(((currentPage - 1) * perPage) / 100) + 1;
                const res = await coingeckoFetch(`exchanges/${exchangeId}/tickers?page=${apiPage}&include_exchange_logo=true&depth=true`)

                let paginatedTickers = [];
                if (res.tickers && res.tickers.length > 0) {
                    const startIdx = ((currentPage - 1) * perPage) % 100;
                    paginatedTickers = res.tickers.slice(startIdx, startIdx + perPage);
                }

                if (paginatedTickers.length === 0) {
                    // Fallback mock for Spot
                    const mockTickers = Array(10).fill(null).map((_, i) => ({
                        base: `COIN${i + 1}`,
                        target: 'USD',
                        coin_id: `coin-${i + 1}`,
                        last_traded_at: new Date(Date.now() - Math.random() * 10000000).toISOString(),
                        converted_last: { usd: 100 + Math.random() * 900 },
                        converted_volume: { usd: 50000 + Math.random() * 500000 },
                        bid_ask_spread_percentage: Math.random() * 1,
                        cost_to_move_up_usd: 10000 + Math.random() * 5000,
                        cost_to_move_down_usd: 10000 + Math.random() * 5000,
                        trade_url: '#'
                    }));
                    setExchangeData(mockTickers);
                } else {
                    setExchangeData(paginatedTickers);
                }
            } else {
                setExchangeData([]); //Features or others
            }
        }
        catch (error) {
            console.error("Error fetching Exchange Details Data", error);
            const mockTickers = Array(10).fill(null).map((_, i) => ({
                base: `COIN${i + 1}`,
                target: 'USD',
                coin_id: `coin-${i + 1}`,
                last_traded_at: new Date(Date.now() - Math.random() * 10000000).toISOString(),
                converted_last: { usd: 100 + Math.random() * 900 },
                converted_volume: { usd: 50000 + Math.random() * 500000 },
                bid_ask_spread_percentage: Math.random() * 1,
                cost_to_move_up_usd: 10000 + Math.random() * 5000,
                cost_to_move_down_usd: 10000 + Math.random() * 5000,
                trade_url: '#'
            }));
            setExchangeData(mockTickers);
            if (error.message.includes('429')) {
                console.warn("Using mock tickers due to rate limit");
            } else {
                setError(error.message);
            }

        }
        finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchExchangeData();
    }, [exchangeId, currentPage, perPage, activeTab])

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedExhangeData = () => {
        let filteredData = exhangeData;
        if (searchQuery) {
            filteredData = exhangeData.filter(ticker =>
                ticker.base.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticker.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticker.coin_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Special handling for nested properties
            if (sortConfig.key === 'price') aVal = a.converted_last?.usd;
            if (sortConfig.key === 'price') bVal = b.converted_last?.usd;
            if (sortConfig.key === 'volume') aVal = a.converted_volume?.usd;
            if (sortConfig.key === 'volume') bVal = b.converted_volume?.usd;

            // For nested bid_ask_spread_percentage it's already top level in ticker object usually
            // but let's be safe if it's nested in some versions

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
            : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
    };


    if (loading) {
        return (
            <div className='w-full min-h-screen p-6 flex flex-col gap-8 animate-pulse'>
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-sm"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-8 bg-gray-800 rounded w-48"></div>
                        <div className="h-4 bg-gray-800 rounded w-24"></div>
                    </div>
                </div>

                {/* Top Cards Grid Skeleton */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>

                {/* Tabs & Graph Skeleton */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="h-10 w-24 bg-gray-800 rounded-full"></div>
                        <div className="h-10 w-24 bg-gray-800 rounded-full"></div>
                        <div className="h-10 w-24 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="h-[400px] bg-gray-800/20 rounded-xl w-full"></div>
                </div>

                {/* Info & Trust Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Info Section */}
                    <div className="lg:col-span-2 h-64 bg-gray-800/20 rounded-xl"></div>
                    {/* Trust Score Section */}
                    <div className="h-64 bg-gray-800/20 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!exchange) {
        return <div className="p-8 text-center text-red-500">Exchange not found.</div>;
    }

    return (
        <motion.div variants={containerVariants} initial='hidden' animate='visible' className="p-2 sm:p-6 bg-main rounded-xl min-h-screen">
            {/* Breadcrumbs */}

            <div className="flex flex-col gap-8">

                {/* Breadcrumbs */}
                <Breadcrumbs
                    crumbs={[
                        { label: 'Exchanges', path: '/' },
                        { label: 'Spot', path: '/exchanges/cryptoexchanges' },
                        { label: exchange.name }
                    ]}
                />

                {/* Exchange Header */}
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full overflow-hidden'>

                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                        <img src={exchange.image} alt={exchange.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-sm shrink-0" />
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 min-w-0'>
                            <p className='text-xl sm:text-3xl font-bold truncate'>{exchange.name}</p>
                            <p className='text-muted text-xs sm:text-sm p-1 px-2 rounded-md bg-card w-fit whitespace-nowrap'>{exchange.centralized ? 'Centralized' : 'Decentralized'} Exchange</p>
                        </div>
                    </div>


                </div>


                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'
                >
                    {/* first card of the exchage detailes based of the binance  */}
                    <motion.div variants={itemVariants} className='flex flex-col gap-2 h-[210px]'>
                        <div className={`flex items-center justify-between border-gray-800 border-2 rounded-2xl px-6 py-4 flex-1 bg-card/20 backdrop-blur-md transition-all duration-300 ${getVolumeTrendColor()}`}>
                            <div className='flex flex-col items-start justify-center'>
                                <p className='text-3xl font-bold tracking-tight'>
                                    {formatPrice(exchange.trade_volume_24h_btc_normalized || exchange.trade_volume_24h_btc || 0, { currency: 'BTC', style: 'decimal' })} ₿
                                </p>
                                <div className='flex items-center gap-2'>
                                    <span className='text-muted text-sm'>24h Trading Volume (BTC)</span>
                                </div>
                            </div>
                            <div className='w-24 h-16'>
                                {volumeSparkline && (
                                    <Sparkline data={volumeSparkline} color={getSparklineColor()} height={60} />
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col items-start border-gray-800 border-2 rounded-2xl px-6 py-4 flex-1 justify-center bg-card/20 backdrop-blur-md hover:border-gray-700 transition-colors'>
                            <p className='text-3xl font-bold text-green-500'>{exchange.trust_score || 0}/10</p>
                            <div className='flex items-center gap-2 text-muted'>
                                <span className='text-sm'>Trust Score</span>
                                <Info size={14} className='cursor-pointer hover:text-white transition-colors' />
                            </div>
                        </div>
                    </motion.div>

                    {/* second card for new listings */}
                    <motion.div variants={itemVariants} className='h-[210px]'>
                        <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col h-[210px] transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className='text-yellow-500 text-2xl'>✨</span>
                                    <h3 className="text-xl font-bold text-white">Latest Pairs</h3>
                                </div>
                            </div>
                            <div className='flex flex-col flex-1 justify-center'>
                                {exhangeData
                                    .sort((a, b) => new Date(b.last_traded_at) - new Date(a.last_traded_at))
                                    .slice(0, 3)
                                    .map((ticker, i) => (
                                        <div key={i} className='flex items-center justify-between p-2 border-b border-gray-800 last:border-0 hover:bg-card transition-colors cursor-pointer rounded-lg' onClick={() => navigate(`/cryptocurrencies/marketcap/${ticker.coin_id}`)}>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-sm font-medium text-gray-300 group-hover:text-white transition-colors'>{ticker.base}/{ticker.target}</span>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-sm font-bold text-gray-400'>{formatPrice(ticker.converted_last?.usd)}</span>
                                                <div className={`flex items-center gap-0.5 text-[10px] font-medium text-muted`}>
                                                    <span>{new Date(ticker.last_traded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Thrid card for new Largest Gainers */}
                    <motion.div variants={itemVariants} className='h-[210px]'>
                        <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col h-[210px] transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className='text-blue-400 text-2xl'>🚀</span>
                                    <h3 className="text-xl font-bold text-white">Top Volume Pairs</h3>
                                </div>
                            </div>
                            <div className='flex flex-col flex-1 justify-center'>
                                {exhangeData
                                    .sort((a, b) => (b.converted_volume?.usd || 0) - (a.converted_volume?.usd || 0))
                                    .slice(0, 3)
                                    .map((ticker, i) => (
                                        <div key={i} className='flex items-center justify-between p-2 border-b border-gray-800 last:border-0 hover:bg-card transition-colors cursor-pointer rounded-lg' onClick={() => navigate(`/cryptocurrencies/marketcap/${ticker.coin_id}`)}>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-sm font-medium text-gray-300 group-hover:text-white transition-colors'>{ticker.base}/{ticker.target}</span>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex flex-col items-end'>
                                                    <span className='text-sm font-bold text-gray-400'>{formatPrice(ticker.converted_volume?.usd, { notation: 'compact' })}</span>
                                                    {/* <span className='text-[10px] text-muted'>Vol</span> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>


                <div className="flex justify-between items-center px-2">
                    <TableFilterHeader
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        tabs={tabs}
                        placeholder="Search pairs..."
                    />
                </div>

                <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>

                    {/* Perpetual Badge */}


                    <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
                        <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
                            <tr>
                                <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[35px] min-w-[35px] md:w-[45px] md:min-w-[45px] text-[10px] md:text-xs'>#</th>
                                <th className='py-2 px-1 sticky left-[35px] md:left-[45px] bg-main z-30 w-[100px] min-w-[100px] md:w-[150px] md:min-w-[150px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('base')}>
                                    <div className="flex items-center gap-1">Coin <SortIcon columnKey="base" /></div>
                                </th>
                                <th className='py-2 px-2 w-[10%]'>Pair</th>
                                <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-1">Price <SortIcon columnKey="price" /></div>
                                </th>
                                <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('bid_ask_spread_percentage')}>
                                    <div className="flex items-center gap-1">spread <SortIcon columnKey="bid_ask_spread_percentage" /></div>
                                </th>
                                {activeTab === 'Perpetuals' ? (
                                    <>
                                        <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('open_interest_usd')}>
                                            <div className="flex items-center gap-1">Open Interest (USD) <SortIcon columnKey="open_interest_usd" /></div>
                                        </th>
                                        <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('funding_rate')}>
                                            <div className="flex items-center gap-1">Funding Rate <SortIcon columnKey="funding_rate" /></div>
                                        </th>
                                    </>
                                ) : (
                                    <>
                                        <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('cost_to_move_up_usd')}>
                                            <div className="flex items-center gap-1">+2% depth <SortIcon columnKey="cost_to_move_up_usd" /></div>
                                        </th>
                                        <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('cost_to_move_down_usd')}>
                                            <div className="flex items-center gap-1">-2% depth <SortIcon columnKey="cost_to_move_down_usd" /></div>
                                        </th>
                                    </>
                                )}
                                <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('volume')}>
                                    <div className="flex items-center gap-1">24h Volume <SortIcon columnKey="volume" /></div>
                                </th>
                                <th className='py-2 px-2 w-[15%]'>Volume %</th>
                                <th className='py-2 px-2 w-[15%]'>Updated</th>

                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-0">
                                        <TableSkeleton rows={15} columns={9} />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr className="h-40">
                                    <td colSpan="9" className="py-10 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                                <ArrowRightIcon className="text-red-500 rotate-90" size={24} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-lg font-bold text-white uppercase italic tracking-wider">Offline</h3>
                                                <p className="text-xs text-muted max-w-sm mx-auto">
                                                    {error.includes('429') ? "Rate limit" : "Error"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : exhangeData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-8 text-center text-muted text-xs">No coins found.</td>
                                </tr>
                            ) : (
                                getSortedExhangeData().map((ticker, index) => (
                                    <tr
                                        key={`${ticker.base}-${ticker.target}-${index}`}
                                        onClick={() => navigate(`/cryptocurrencies/marketcap/${ticker.coin_id}`)}
                                        className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'
                                    >
                                        <td className='py-3 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[35px] min-w-[35px] md:w-[45px] md:min-w-[45px] text-xs md:text-sm text-muted font-bold'>
                                            {(currentPage - 1) * perPage + index + 1}
                                        </td>
                                        <td className='py-3 px-1 sticky left-[35px] md:left-[45px] bg-main group-hover:bg-card transition-colors z-10 w-[100px] min-w-[100px] md:w-[150px] md:min-w-[150px]'>
                                            <div className='flex flex-col gap-0.5'>
                                                <span className='font-bold truncate max-w-[80px] md:max-w-[130px] text-sm md:text-lg'>{ticker.base}</span>
                                                <span className='text-xs text-muted uppercase leading-none font-bold'>{ticker.coin_id?.split('-')[0]}</span>
                                            </div>
                                        </td>
                                        <td className='py-3 px-2 font-bold text-white text-sm'>
                                            {activeTab === 'Perpetuals' ? (
                                                <span className='px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs font-bold border border-green-500/20 uppercase'>
                                                    Perp
                                                </span>
                                            ) : (
                                                <span className='text-muted group-hover:text-white transition-colors truncate max-w-[80px] block font-bold text-sm'>
                                                    {ticker.base}/{ticker.target}
                                                </span>
                                            )}
                                        </td>
                                        <td className='py-3 px-2 text-sm sm:text-base font-bold'>{formatPrice(ticker.converted_last?.usd, { maximumFractionDigits: 4 })}</td>
                                        <td className='py-3 px-2 text-muted text-sm font-bold'>{ticker.bid_ask_spread_percentage?.toFixed(2)}%</td>

                                        {activeTab === 'Perpetuals' ? (
                                            <>
                                                <td className='py-3 px-2 text-blue-400 text-sm sm:text-base font-bold'>{formatPrice(ticker.open_interest_usd || 0, { notation: 'compact' })}</td>
                                                <td className='py-3 px-2 text-green-400 text-sm sm:text-base font-bold'>{(ticker.funding_rate || 0).toFixed(4)}%</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className='py-3 px-2 text-green-500/80 text-sm sm:text-base font-bold'>{formatPrice(ticker.cost_to_move_up_usd, { notation: 'compact' })}</td>
                                                <td className='py-3 px-2 text-red-500/80 text-sm sm:text-base font-bold'>{formatPrice(ticker.cost_to_move_down_usd, { notation: 'compact' })}</td>
                                            </>
                                        )}

                                        <td className='py-3 px-2 text-sm sm:text-base font-bold text-gray-300'>{formatPrice(ticker.converted_volume?.usd, { notation: 'compact' })}</td>
                                        <td className='py-3 px-2 text-muted text-sm font-bold'>{((ticker.converted_volume?.usd / (exchange?.trade_volume_24h_btc_normalized || 1)) * 100).toFixed(2)}%</td>
                                        <td className='py-3 px-2 text-xs text-muted font-bold'>{new Date(ticker.last_traded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </motion.div>


                <motion.div variants={itemVariants} className="w-full">
                    <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        totalItems={200} // CoinGecko demo API usually shows around 100 tickers per exchange in results
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="w-full flex flex-col gap-8">
                    <ExchangeInfo exchange={exchange} />
                    <ExchangeStats tickers={exhangeData} />
                    <ExchangeDetailsGraph />
                    <ExchangeTrustStats exchange={exchange} tickers={exhangeData} />
                </motion.div>



            </div>



        </motion.div>
    );
};

export default ExchangeDetail;
