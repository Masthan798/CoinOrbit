import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion } from 'framer-motion';
import { CoinDetailData } from '../../services/AllcoinsData';
import { BellIcon, StarIcon } from 'lucide-react';
import CoinDetailGraph from '../../Components/Graphs/CoinDetailGraph';
import CoinInfoBlock from '../../Components/Coins/CoinInfoBlock';
import CoinPerformanceBlock from '../../Components/Coins/CoinPerformanceBlock';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
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
    const { currency, formatPrice } = useCurrency();
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
                fetchCoinCardsData(coinId, currency.code);
            } catch (error) {
                console.error("Error fetching coin details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoinDetail();
    }, [coinId]);

    const fetchCoinCardsData = async (id, vs_currency) => {
        try {
            const response = await CoinDetailData(id, vs_currency);
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
            <div className="p-6 bg-main rounded-xl min-h-screen flex flex-col gap-8 animate-pulse">
                {/* Breadcrumbs Skeleton */}
                <div className="h-4 bg-gray-800 rounded w-64"></div>

                {/* Header Grid Skeleton */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full'>
                    {/* Main Info Card Skeleton */}
                    <div className="p-6 border-gray-800 border-2 rounded-2xl bg-card/30 h-32 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                            <div className="flex flex-col gap-2">
                                <div className="h-4 w-24 bg-gray-800 rounded"></div>
                                <div className="h-3 w-16 bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                    {/* 4 Stats Cards Skeletons */}
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-6 border-gray-800 border-2 rounded-2xl bg-card/10 h-32 flex flex-col justify-center gap-3">
                            <div className="h-6 w-3/4 bg-gray-800 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-800 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid Skeleton */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Left Stats Column Skeleton */}
                    <div className='flex flex-col gap-6 w-full'>
                        <div className='w-full p-8 border-gray-800 border-2 rounded-3xl bg-card/20 h-[600px]'></div>
                    </div>
                    {/* Right Chart Column Skeleton */}
                    <div className='lg:col-span-2 flex flex-col gap-6'>
                        <div className='p-2 border-gray-800 border-2 rounded-3xl bg-card/5 h-[600px]'></div>
                    </div>
                </div>

                {/* Bottom Info Grid Skeleton */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='md:col-span-1 border-gray-800 border-2 rounded-3xl bg-[#0b0e11] h-64'></div>
                    <div className='md:col-span-2 border-gray-800 border-2 rounded-3xl bg-[#0b0e11] h-64'></div>
                </div>
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
            className="p-2 sm:p-6 bg-main rounded-xl min-h-full overflow-y-auto no-scrollbar flex flex-col gap-8"
        >
            {/* Breadcrumbs */}
            <Breadcrumbs
                crumbs={[
                    { label: 'Cryptocurrencies', path: '/' },
                    { label: 'Market Cap', path: '/marketcap' },
                    { label: `${coin.name} (${coin.symbol.toUpperCase()})` }
                ]}
            />

            {/* Main Data Grid: Header + Supplementary Cards */}
            <motion.div variants={itemVariants} className='w-full'>
                <motion.div
                    variants={containerVariants}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full'
                >
                    {/* Main Coin Info Card (First in the row) */}
                    <motion.div variants={itemVariants} className='flex flex-col items-start justify-center gap-3 p-4 sm:p-6 border-gray-800 border-2 rounded-2xl bg-card/30 backdrop-blur-sm h-full'>
                        <div className='flex items-center gap-3 w-full'>
                            <img src={coin.image.large} alt={coin.name} className='w-10 h-10 sm:w-12 sm:h-12 rounded-sm' />
                            <div className='flex flex-col min-w-0'>
                                <h1 className='text-xl sm:text-2xl font-bold tracking-tight truncate w-full'>{coin.name.toUpperCase()}</h1>
                                <div className='flex items-center gap-1.5 flex-wrap'>
                                    <span className='text-xs sm:text-sm text-muted font-bold'>{coin.symbol.toUpperCase()}</span>
                                    <span className='text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted border border-white/5 whitespace-nowrap font-bold'>RANK #{coin.market_cap_rank}</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-wrap items-baseline gap-2'>
                            <span className='text-2xl sm:text-3xl font-bold'>{formatPrice(coin.market_data.current_price[currency.code])}</span>
                            <span className={`text-xs sm:text-sm font-medium ${coin.market_data.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {coin.market_data.price_change_percentage_24h > 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Detailed Data Cards (from simple/price) */}
                    {[
                        { val: coincardsData?.[currency.code], label: `${coin.name} Price`, useLocal: true },
                        { val: coincardsData?.[`${currency.code}_market_cap`], label: 'Total Market Cap' },
                        { val: coincardsData?.[`${currency.code}_24h_vol`], label: '24h Volume' },
                        { val: coincardsData?.[`${currency.code}_24h_change`], label: '24h Change', isPerc: true }
                    ].map((card, idx) => (
                        <motion.div key={idx} variants={itemVariants} className='flex flex-col gap-1 sm:gap-2 justify-center items-start p-4 sm:p-6 border-gray-800 border-2 rounded-2xl bg-card/10 hover:bg-card/20 transition-all duration-300 group h-full overflow-hidden'>
                            {card.val !== undefined && card.val !== null ? (
                                <p className='text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap truncate w-full'>
                                    {card.isPerc ? (
                                        <span className={card.val >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {card.val > 0 ? '+' : ''}{card.val?.toFixed(2)}%
                                        </span>
                                    ) : (
                                        `${card.useLocal ? formatPrice(card.val) : formatPrice(card.val, { notation: 'compact' })}`
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
                    className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'
                >
                    {/* Compact Coin Stats Card */}
                    <div className='flex flex-col gap-8 w-full'>
                        {/* Compact Coin Stats Card */}
                        <div className='w-full p-4 sm:p-8 border-gray-800 border-2 rounded-3xl bg-card/20 backdrop-blur-md flex flex-col gap-4 sm:gap-6 shadow-2xl shadow-black/20'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3 sm:gap-4'>
                                    <div className='p-1 bg-white/5 rounded-full border border-white/10'>
                                        <img src={coin.image.large} alt={coin.name} className='w-10 h-10 sm:w-12 sm:h-12 rounded-sm' />
                                    </div>
                                    <div>
                                        <h3 className='text-xl sm:text-2xl font-bold'>{coin.name}</h3>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-muted uppercase font-bold tracking-widest leading-none'>{coin.symbol}</span>
                                            <span className='text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted font-bold'>#{coin.market_cap_rank}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className='p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 transition-all text-muted hover:text-white group'>
                                    <BellIcon size={18} className='group-hover:scale-110 transition-transform sm:w-5 sm:h-5' />
                                </button>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <div className='flex items-baseline gap-2'>
                                    <span className='text-3xl sm:text-5xl font-black tracking-tighter text-white'>{formatPrice(coin.market_data.current_price[currency.code])}</span>
                                    <span className={coin.market_data.price_change_percentage_24h > 0 ? 'text-xs sm:text-base font-bold bg-green-500/10 px-2.5 py-1 rounded-lg text-green-500' : 'text-xs sm:text-base font-bold bg-red-500/10 px-2.5 py-1 rounded-lg text-red-500'}>
                                        {coin.market_data.price_change_percentage_24h > 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
                                    </span>
                                </div>
                                <p className='text-xs sm:text-sm text-muted font-bold uppercase tracking-widest opacity-60'>Current Price ({currency.code.toUpperCase()})</p>
                            </div>

                            <div className='space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-800/50'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-xs text-muted font-black uppercase tracking-tighter'>Daily Range</span>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-muted font-bold'>{formatPrice(coin.market_data.low_24h[currency.code])}</span>
                                        <div className='w-16 sm:w-24 h-1 sm:h-1.5 bg-gray-800 rounded-full relative overflow-hidden'>
                                            <div
                                                className='absolute h-full bg-white/60'
                                                style={{
                                                    width: `${Math.min(100, Math.max(0,
                                                        ((coin.market_data.current_price[currency.code] - coin.market_data.low_24h[currency.code]) /
                                                            (coin.market_data.high_24h[currency.code] - coin.market_data.low_24h[currency.code])) * 100
                                                    ))}%`
                                                }}
                                            />
                                        </div>
                                        <span className='text-xs text-muted font-bold'>{formatPrice(coin.market_data.high_24h[currency.code])}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='pt-1 sm:pt-2 flex gap-3'>
                                <button className='flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 bg-card hover:bg-white/5 text-white text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl border border-white/10 transition-all active:scale-[0.98] shadow-lg shadow-black/20'>
                                    <StarIcon size={16} fill="currentColor" className="sm:w-[18px] sm:h-[18px]" />
                                    Add to Portfolio
                                </button>
                            </div>
                        </div>

                        {/* Stats List */}
                        <div className='w-full flex flex-col gap-0.5 sm:gap-1 mt-4 sm:mt-0'>
                            {[
                                { label: 'Market Cap', value: coin.market_data.market_cap[currency.code], tooltip: 'Current price multiplied by circulating supply.' },
                                { label: 'Fully Diluted Valuation', value: coin.market_data.fully_diluted_valuation[currency.code], tooltip: 'Market cap if max supply was in circulation.' },
                                { label: 'Circulating Supply', value: coin.market_data.circulating_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'Total Supply', value: coin.market_data.total_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'Max Supply', value: coin.market_data.max_supply, useLocal: true, symbol: coin.symbol.toUpperCase() },
                                { label: 'All-Time High', value: coin.market_data.ath[currency.code], isPrice: true, date: coin.market_data.ath_date[currency.code] },
                                { label: 'All-Time Low', value: coin.market_data.atl[currency.code], isPrice: true, date: coin.market_data.atl_date[currency.code] },
                            ].map((stat, idx) => (
                                <div key={idx} className='flex items-center justify-between py-2 sm:py-3 border-b border-gray-800/20 last:border-0 hover:bg-white/[0.03] px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-300 group'>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-sm sm:text-base text-muted font-bold group-hover:text-white/80 transition-colors'>{stat.label}</p>
                                        {stat.tooltip && <span className='text-[10px] sm:text-xs text-muted/30 cursor-help' title={stat.tooltip}>ⓘ</span>}
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        <p className='text-sm sm:text-base font-black tracking-tight text-white'>
                                            {stat.isPrice ? formatPrice(stat.value) :
                                                stat.useLocal ? `${stat.value?.toLocaleString() ?? '∞'} ${stat.symbol}` :
                                                    stat.value ? formatPrice(stat.value, { notation: 'compact' }) : 'N/A'}
                                        </p>
                                        {stat.date && <span className='text-xs text-muted/40 font-bold uppercase'>{new Date(stat.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Component Container */}
                    <div className='lg:col-span-2 flex flex-col gap-6'>
                        <div className='p-2 border-gray-800 border-2 rounded-3xl bg-card/5 overflow-hidden h-full'>
                            <CoinDetailGraph />
                        </div>
                    </div>
                </motion.div>

                {/* New Info & Performance Grid - Separate Row below */}
                <motion.div variants={containerVariants} className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6'>
                    {/* Left: Coin Info (1 col) */}
                    <div className='md:col-span-1 border-gray-800 border-2 rounded-3xl bg-[#0b0e11] overflow-hidden p-4 sm:p-6'>
                        <CoinInfoBlock coin={coin} />
                    </div>

                    {/* Right: Performance & News (2 cols) */}
                    <div className='md:col-span-2 border-gray-800 border-2 rounded-3xl bg-[#0b0e11] overflow-hidden p-4 sm:p-6'>
                        <CoinPerformanceBlock coin={coin} />
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default CoinDetail;
