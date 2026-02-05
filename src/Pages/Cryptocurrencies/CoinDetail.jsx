import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion } from 'framer-motion';
import { CoinDetailData } from '../../services/AllcoinsData';
import { BellIcon, StarIcon } from 'lucide-react';
import CoinDetaileGraph from '../../Components/Graphs/CoinDetaileGraph';


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

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const CoinDetail = () => {
    const { coinId } = useParams();
    const navigate = useNavigate();
    const [coin, setCoin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coincardsData, setCoinsCardData] = useState(null);

    useEffect(() => {
        const fetchCoinDetail = async () => {
            setLoading(true);
            try {
                const response = await coingeckoFetch(`/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`);
                setCoin(response);
                // Call fetchCoinCardsData once we have the coin's full name and symbol
                fetchCoinCardsData(coinId, response.name, response.symbol);
            } catch (error) {
                console.error("Error fetching coin details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoinDetail();
    }, [coinId]);


    const fetchCoinCardsData = async (id, name, symbol) => {
        try {
            const response = await CoinDetailData(id, name, symbol);
            setCoinsCardData(response[id] || null);
        }
        catch (error) {
            console.log("Error fetching coin cards data:", error);
        }
    }


    const formatCompactNumber = (val) => {
        if (val === undefined || val === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 2
        }).format(val);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-muted border-t-white rounded-full animate-spin"></div>
                <p className="mt-4 text-muted">Loading {coinId} details...</p>
            </div>
        );
    }

    if (!coin) {
        return <div className="p-8 text-center text-red-500">Coin not found.</div>;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 bg-main rounded-xl min-h-full overflow-y-auto no-scrollbar flex flex-col gap-8"
        >
            {/* Breadcrumbs */}
            <motion.div variants={itemVariants} className='flex items-center gap-2 text-sm'>
                <span className='text-muted cursor-pointer hover:text-white transition-colors' onClick={() => navigate('/')}>Cryptocurrencies</span>
                <span className='text-muted'>/</span>
                <span className='text-muted cursor-pointer hover:text-white transition-colors' onClick={() => navigate('/')}>marketcap</span>
                <span className='text-muted'>/</span>
                <span className='text-white font-semibold'>{coin.name}</span>
            </motion.div>

            {/* Main Data Grid: Header + Supplementary Cards */}
            <motion.div variants={itemVariants} className='w-full'>
                <motion.div
                    variants={containerVariants}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full'
                >
                    {/* Main Coin Info Card (First in the row) */}
                    <motion.div variants={itemVariants} className='flex flex-col items-start justify-center gap-3 p-4 sm:p-6 border-gray-800 border-2 rounded-2xl bg-card/30 backdrop-blur-sm h-full'>
                        <div className='flex items-center gap-3 w-full'>
                            <img src={coin.image.large} alt={coin.name} className='w-10 h-10 sm:w-12 sm:h-12 rounded-full' />
                            <div className='flex flex-col min-w-0'>
                                <h1 className='text-lg sm:text-xl font-bold tracking-tight truncate w-full'>{coin.name.toUpperCase()}</h1>
                                <div className='flex items-center gap-1.5 flex-wrap'>
                                    <span className='text-[10px] sm:text-xs text-muted font-medium'>{coin.symbol.toUpperCase()}</span>
                                    <span className='text-[8px] sm:text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-muted border border-white/5 whitespace-nowrap'>RANK #{coin.market_cap_rank}</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-wrap items-baseline gap-2'>
                            <span className='text-xl sm:text-2xl font-bold'>${coin.market_data.current_price.usd.toLocaleString()}</span>
                            <span className={`text-xs sm:text-sm font-medium ${coin.market_data.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {coin.market_data.price_change_percentage_24h > 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Detailed Data Cards (from simple/price) */}
                    {[
                        { val: coincardsData?.usd, label: `${coin.name} Price`, useLocal: true },
                        { val: coincardsData?.usd_market_cap, label: 'Total Market Cap' },
                        { val: coincardsData?.usd_24h_vol, label: '24h Volume' },
                        { val: coincardsData?.usd_24h_change, label: '24h Change', isPerc: true }
                    ].map((card, idx) => (
                        <motion.div key={idx} variants={itemVariants} className='flex flex-col gap-1 sm:gap-2 justify-center items-start p-4 sm:p-6 border-gray-800 border-2 rounded-2xl bg-card/10 hover:bg-card/20 transition-all duration-300 group h-full overflow-hidden'>
                            {card.val !== undefined && card.val !== null ? (
                                <p className='text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap truncate w-full'>
                                    {card.isPerc ? (
                                        <span className={card.val >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {card.val > 0 ? '+' : ''}{card.val?.toFixed(2)}%
                                        </span>
                                    ) : (
                                        `$${card.useLocal ? card.val.toLocaleString() : formatCompactNumber(card.val)}`
                                    )}
                                </p>
                            ) : (
                                <div className="h-6 sm:h-8 w-20 sm:w-24 bg-white/5 animate-pulse rounded-md" />
                            )}
                            <span className='text-[10px] sm:text-xs text-muted font-medium uppercase tracking-wider group-hover:text-white/70 transition-colors truncate w-full'>{card.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Advanced Overview/Portfolio Section */}
            <motion.div variants={itemVariants} className='w-full'>
                <motion.div
                    variants={containerVariants}
                    className='grid grid-cols-1 lg:grid-cols-3 gap-6'
                >
                    {/* Compact Coin Stats Card */}
                    <div className='flex flex-col gap-8 w-full'>
                        {/* Compact Coin Stats Card */}
                        <div className='w-full p-8 border-gray-800 border-2 rounded-3xl bg-card/20 backdrop-blur-md flex flex-col gap-6 shadow-2xl shadow-black/20'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-4'>
                                    <div className='p-1 bg-white/5 rounded-full border border-white/10'>
                                        <img src={coin.image.large} alt={coin.name} className='w-12 h-12 rounded-full' />
                                    </div>
                                    <div>
                                        <h3 className='text-xl font-bold'>{coin.name}</h3>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-muted uppercase font-bold tracking-widest'>{coin.symbol}</span>
                                            <span className='text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted'>#{coin.market_cap_rank}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className='p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-muted hover:text-white group'>
                                    <BellIcon size={20} className='group-hover:scale-110 transition-transform' />
                                </button>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-4xl font-extrabold tracking-tighter'>${coin.market_data.current_price.usd.toLocaleString()}</span>
                                    <span className={coin.market_data.price_change_percentage_24h > 0 ? 'text-green-500 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded-lg' : 'text-red-500 text-sm font-bold bg-red-500/10 px-2 py-0.5 rounded-lg'}>
                                        {coin.market_data.price_change_percentage_24h > 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
                                    </span>
                                </div>
                                <p className='text-xs text-muted font-bold uppercase tracking-widest opacity-60'>Current Price (USD)</p>
                            </div>

                            <div className='space-y-4 pt-4 border-t border-gray-800/50'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-xs text-muted font-black uppercase tracking-tighter'>Daily Range</span>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-[10px] text-muted font-bold'>${coin.market_data.low_24h.usd.toLocaleString()}</span>
                                        <div className='w-24 h-1.5 bg-gray-800 rounded-full relative overflow-hidden'>
                                            <div
                                                className='absolute h-full bg-white/60'
                                                style={{
                                                    width: `${Math.min(100, Math.max(0,
                                                        ((coin.market_data.current_price.usd - coin.market_data.low_24h.usd) /
                                                            (coin.market_data.high_24h.usd - coin.market_data.low_24h.usd)) * 100
                                                    ))}%`
                                                }}
                                            />
                                        </div>
                                        <span className='text-[10px] text-muted font-bold'>${coin.market_data.high_24h.usd.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='pt-2 flex gap-3'>
                                <button className='flex-1 flex items-center justify-center gap-2 p-4 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg shadow-white/10'>
                                    <StarIcon size={18} fill="currentColor" />
                                    Add to Portfolio
                                </button>
                            </div>
                        </div>

                        {/* Stats List */}
                        <div className='w-full flex flex-col gap-1'>
                            {[
                                { label: 'Market Cap', value: coin.market_data.market_cap.usd, tooltip: 'Current price multiplied by circulating supply.' },
                                { label: 'Fully Diluted Valuation', value: coin.market_data.fully_diluted_valuation.usd, tooltip: 'Market cap if max supply was in circulation.' },
                                { label: 'Circulating Supply', value: coin.market_data.circulating_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'Total Supply', value: coin.market_data.total_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'Max Supply', value: coin.market_data.max_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'All-Time High', value: coin.market_data.ath.usd, isPrice: true, date: coin.market_data.ath_date.usd },
                                { label: 'All-Time Low', value: coin.market_data.atl.usd, isPrice: true, date: coin.market_data.atl_date.usd },
                            ].map((stat, idx) => (
                                <div key={idx} className='flex items-center justify-between py-3 border-b border-gray-800/20 last:border-0 hover:bg-white/[0.03] px-3 rounded-xl transition-all duration-300 group'>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-sm text-muted font-semibold group-hover:text-white/80 transition-colors'>{stat.label}</p>
                                        {stat.tooltip && <span className='text-[10px] text-muted/30 cursor-help' title={stat.tooltip}>ⓘ</span>}
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        <p className='text-sm font-bold tracking-tight'>
                                            {stat.isPrice ? `$${stat.value?.toLocaleString()}` :
                                                stat.useLocal ? `${stat.value?.toLocaleString() ?? '∞'} ${stat.symbol}` :
                                                    stat.value ? `$${stat.value.toLocaleString()}` : 'N/A'}
                                        </p>
                                        {stat.date && <span className='text-[10px] text-muted/40 font-bold uppercase'>{new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Component Container */}
                    <div className='lg:col-span-2 p-2 border-gray-800 border-2 rounded-3xl bg-card/5 overflow-hidden'>
                        <CoinDetaileGraph />
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default CoinDetail;
