import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion } from 'framer-motion'
import { Info, ArrowRight as ArrowRightIcon } from 'lucide-react';
import Pagination from '../../Components/Pagination/Pagination';
import ExchangeDetailsGraph from '../../Components/Graphs/ExchangeDetailsGraph';
import ExchangeStats from '../../Components/Graphs/ExchangeStats';
import ExchangeInfo from '../../Components/Exchanges/ExchangeInfo';
import ExchangeTrustStats from '../../Components/Exchanges/ExchangeTrustStats';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';




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
    const [exchange, setExchange] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Spot');
    const [error, setError] = useState(null);
    const [exhangeData, setExchangeData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [volumeSparkline, setVolumeSparkline] = useState(null);


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


    if (loading) {
        return (
            <div className='w-full min-h-screen p-6 flex flex-col gap-8 animate-pulse'>
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
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
        <motion.div variants={containerVariants} initial='hidden' animate='visible' className="p-6 bg-main rounded-xl min-h-screen">
            {/* Breadcrumbs */}

            <div className="flex flex-col gap-8">

                <div className='flex items-center gap-2 text-sm'>
                    <span className='text-muted cursor-pointer' onClick={() => navigate('/')}>Exchanges</span>
                    <span className='text-muted'>/</span>
                    <span className='text-muted cursor-pointer' onClick={() => navigate('/exchanges/cryptoexchanges')}>cryptoexchanges</span>
                    <span className='text-muted'>/</span>
                    <span className='text-white font-semibold'>{exchange.name}</span>
                </div>

                {/* Exchange Header */}
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full overflow-hidden'>

                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                        <img src={exchange.image} alt={exchange.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shrink-0" />
                        <div className='flex flex-col sm:flex-row sm:items-center gap-2 min-w-0'>
                            <p className='text-xl sm:text-3xl font-bold truncate'>{exchange.name}</p>
                            <p className='text-muted text-xs sm:text-sm p-1 px-2 rounded-md bg-card w-fit whitespace-nowrap'>{exchange.centralized ? 'Centralized' : 'Decentralized'} Exchange</p>
                        </div>
                    </div>

                    <div className='flex items-center md:justify-end w-full md:w-auto'>
                        <div className='flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 bg-card rounded-md w-fit max-w-full no-scrollbar overflow-x-auto'>
                            {tabs.map((tab) => (
                                <span
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-md cursor-pointer transition-colors duration-200 ${activeTab === tab
                                        ? 'bg-main text-white'
                                        : 'text-muted hover:bg-main hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </span>
                            ))}
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
                                <p className='text-2xl font-bold tracking-tight'>₿{(exchange.trade_volume_24h_btc_normalized || exchange.trade_volume_24h_btc || 0)?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
                            <p className='text-2xl font-bold text-green-500'>{exchange.trust_score || 0}/10</p>
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
                                    <span className='text-yellow-500 text-xl'>✨</span>
                                    <h3 className="text-lg font-bold text-white">Latest Pairs</h3>
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
                                                <span className='text-xs font-bold text-gray-400'>${ticker.converted_last?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                                    <span className='text-blue-400 text-xl'>🚀</span>
                                    <h3 className="text-lg font-bold text-white">Top Volume Pairs</h3>
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
                                                    <span className='text-xs font-bold text-gray-400'>${ticker.converted_volume?.usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                    {/* <span className='text-[10px] text-muted'>Vol</span> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>

                    {/* Perpetual Badge */}


                    <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
                        <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
                            <tr>
                                <th className='py-4 px-2 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>#</th>
                                <th className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>Coin</th>
                                <th className='py-4 px-2 w-[10%]'>Pair</th>
                                <th className='py-4 px-2 w-[8%]'>Price</th>
                                <th className='py-4 px-2 w-[8%]'>spread</th>
                                {activeTab === 'Perpetuals' ? (
                                    <>
                                        <th className='py-4 px-2 w-[15%]'>Open Interest (USD)</th>
                                        <th className='py-4 px-2 w-[15%]'>Funding Rate</th>
                                    </>
                                ) : (
                                    <>
                                        <th className='py-4 px-2 w-[8%]'>+2% depth</th>
                                        <th className='py-4 px-2 w-[15%]'>-2% depth</th>
                                    </>
                                )}
                                <th className='py-4 px-2 w-[15%]'>24h Volume</th>
                                <th className='py-4 px-2 w-[15%]'>Volume %</th>
                                <th className='py-4 px-2 w-[15%]'>Last Updated</th>

                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-0">
                                        <TableSkeleton rows={10} columns={9} />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                                <ArrowRightIcon className="text-red-500 rotate-90" size={32} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold text-white uppercase italic tracking-wider">Data Feed Offline</h3>
                                                <p className="text-sm text-muted max-w-sm mx-auto">
                                                    {error.includes('429')
                                                        ? "Rate limit exceeded. CoinGecko has temporarily throttled requests. Please wait a minute or check your API key."
                                                        : error}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all border border-white/10 shadow-xl"
                                            >
                                                Retry Connection
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : exhangeData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center text-muted">No coins found for this page.</td>
                                </tr>
                            ) : (
                                exhangeData.map((ticker, index) => (
                                    <tr
                                        key={`${ticker.base}-${ticker.target}-${index}`}
                                        onClick={() => navigate(`/cryptocurrencies/marketcap/${ticker.coin_id}`)}
                                        className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'
                                    >
                                        <td className='py-4 px-2 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>
                                            <div className='flex items-center gap-2'>
                                                <span>{(currentPage - 1) * perPage + index + 1}</span>
                                            </div>
                                        </td>
                                        <td className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main group-hover:bg-card transition-colors z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                                            <div className='flex items-center gap-2'>
                                                <div className='flex flex-col gap-0.5'>
                                                    <span className='font-bold truncate max-w-[180px]'>{ticker.base}</span>
                                                    <span className='text-xs text-muted uppercase'>{ticker.coin_id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-4 px-2 font-medium text-white'>
                                            {activeTab === 'Perpetuals' ? (
                                                <span className='px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold border border-green-500/20 uppercase tracking-wider'>
                                                    Perpetual
                                                </span>
                                            ) : (
                                                <a href={ticker.trade_url} className='py-2 px-3 bg-card rounded-md hover:bg-main text-muted hover:text-white transition-colors'>
                                                    {ticker.base}/{ticker.target}
                                                </a>
                                            )}
                                        </td>
                                        <td className='py-4 px-2'>${ticker.converted_last?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                        <td className='py-4 px-2 text-muted'>{ticker.bid_ask_spread_percentage?.toFixed(2)}%</td>

                                        {activeTab === 'Perpetuals' ? (
                                            <>
                                                <td className='py-4 px-2 text-blue-400'>${(ticker.open_interest_usd || 0).toLocaleString()}</td>
                                                <td className='py-4 px-2 text-green-400'>{(ticker.funding_rate || 0).toFixed(4)}%</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className='py-4 px-2 text-green-500/80'>${ticker.cost_to_move_up_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className='py-4 px-2 text-red-500/80'>${ticker.cost_to_move_down_usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            </>
                                        )}

                                        <td className='py-4 px-2'>${ticker.converted_volume?.usd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                        <td className='py-4 px-2 text-muted'>{((ticker.converted_volume?.usd / (exchange?.trade_volume_24h_btc_normalized || 1)) * 100).toFixed(2)}%</td>
                                        <td className='py-4 px-2 text-xs text-muted'>{new Date(ticker.last_traded_at).toLocaleTimeString()}</td>
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
