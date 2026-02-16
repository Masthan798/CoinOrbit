import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Star, Share2, Bell, Info } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import CoinDetailGraph from '../../Components/Graphs/CoinDetailGraph';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
};

const CoinConversionDetail = () => {
    const { coinId, currencyCode } = useParams();
    const navigate = useNavigate();

    // State
    const [coinData, setCoinData] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(true);

    // Converter State
    const [amount, setAmount] = useState(1);

    // FAQ State
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Coin Details
                const coinRes = await coingeckoFetch(`coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
                setCoinData(coinRes);

                // Fetch Rate
                const priceRes = await coingeckoFetch(`simple/price?ids=${coinId}&vs_currencies=${currencyCode}&include_last_updated_at=true`);
                if (priceRes[coinId] && priceRes[coinId][currencyCode]) {
                    setExchangeRate(priceRes[coinId][currencyCode]);
                }
            } catch (error) {
                console.error("Error fetching conversion details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (coinId && currencyCode) {
            fetchData();
        }
    }, [coinId, currencyCode]);

    const formatCurrency = (val, code) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code.toUpperCase(),
            maximumFractionDigits: 2
        }).format(val);
    };

    const calculatedValue = exchangeRate ? amount * exchangeRate : 0;

    if (loading) {
        return (
            <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-main text-white pb-20 animate-pulse">
                {/* Breadcrumbs Skeleton */}
                <div className="h-4 bg-gray-800 rounded w-64"></div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN Skeleton */}
                    <div className="col-span-1 flex flex-col gap-6">
                        {/* Coin Identity Card Skeleton */}
                        <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col gap-6 h-[500px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-6 w-32 bg-gray-800 rounded"></div>
                                    <div className="h-4 w-16 bg-gray-800 rounded"></div>
                                </div>
                            </div>
                            <div className="h-10 w-48 bg-gray-800 rounded"></div>
                            <div className="h-4 w-full bg-gray-800 rounded"></div>
                            <div className="space-y-4 mt-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className="h-4 w-24 bg-gray-800 rounded"></div>
                                        <div className="h-4 w-16 bg-gray-800 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN Skeleton */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Converter Box Skeleton */}
                        <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 md:p-10 h-64"></div>
                        {/* Chart Section Skeleton */}
                        <div className="h-[500px] w-full bg-[#0b0e11] rounded-3xl border border-gray-800 p-2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!coinData || !exchangeRate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white gap-4">
                <h2 className="text-2xl font-bold text-red-500">Data Not Found</h2>
                <button onClick={() => navigate('/tools/converter')} className="px-4 py-2 bg-blue-600 rounded-lg">Back</button>
            </div>
        );
    }

    // Helper for Range Bar
    const low24h = coinData.market_data.low_24h.usd;
    const high24h = coinData.market_data.high_24h.usd;
    const currentPrice = coinData.market_data.current_price.usd;
    const rangePercentage = Math.min(100, Math.max(0, ((currentPrice - low24h) / (high24h - low24h)) * 100));


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="w-full min-h-full p-4 md:p-6 flex flex-col gap-6 bg-main text-white pb-20"
        >
            {/* Breadcrumbs */}
            <div className='flex items-center gap-2 text-xs md:text-sm text-muted'>
                <span className='cursor-pointer hover:text-white transition-colors' onClick={() => navigate('/tools/converter')}>Cryptocurrencies</span>
                <span>/</span>
                <span className='cursor-pointer hover:text-white transition-colors' onClick={() => navigate(`/tools/converter/${coinId}/${currencyCode}`)}>{coinData.name}</span>
                <span>/</span>
                <span className='text-white font-semibold'>{coinData.symbol.toUpperCase()} / {currencyCode.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Sidebar Stats */}
                <div className="col-span-1 flex flex-col gap-6">

                    {/* Coin Identity Card */}
                    <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">

                        <div className="flex items-center gap-4">
                            <img src={coinData.image.large} alt={coinData.name} className="w-12 h-12 rounded-full" />
                            <div>
                                <h1 className="text-xl font-bold">{coinData.name} <span className="text-muted text-sm font-normal">{coinData.symbol.toUpperCase()} / {currencyCode.toUpperCase()}</span></h1>
                                <span className="bg-gray-800 text-[10px] px-2 py-0.5 rounded text-gray-300">#{coinData.market_cap_rank}</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl md:text-4xl font-bold">{formatCurrency(exchangeRate, currencyCode)}</h2>
                                <span className={`text-sm font-bold flex items-center ${coinData.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coinData.market_data.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coinData.market_data.price_change_percentage_24h).toFixed(1)}% (24h)
                                </span>
                            </div>
                            <span className="text-xs text-muted mt-1">1.0000 {coinData.symbol.toUpperCase()}</span>
                        </div>

                        {/* 24h Range */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs text-muted font-medium">
                                <span>{formatCurrency(low24h, 'usd')}</span>
                                <span>24h Range</span>
                                <span>{formatCurrency(high24h, 'usd')}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 bottom-0 left-0 bg-white" style={{ width: `${rangePercentage}%` }}></div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-card border border-gray-700 rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2 text-sm font-bold">
                                <Star size={16} /> Add to Portfolio
                            </button>
                            <button className="p-2.5 bg-card border border-gray-700 rounded-xl hover:bg-gray-700 transition">
                                <Bell size={18} />
                            </button>
                        </div>

                        {/* Key Stats List */}
                        <div className="flex flex-col gap-4 mt-2">
                            {[
                                { label: 'Market Cap', value: coinData.market_data.market_cap.usd, isCurrency: true },
                                { label: 'Fully Diluted Valuation', value: coinData.market_data.fully_diluted_valuation.usd, isCurrency: true },
                                { label: '24 Hour Trading Vol', value: coinData.market_data.total_volume.usd, isCurrency: true },
                                { label: 'Circulating Supply', value: coinData.market_data.circulating_supply, suffix: coinData.symbol.toUpperCase() },
                                { label: 'Total Supply', value: coinData.market_data.total_supply, suffix: coinData.symbol.toUpperCase() },
                                { label: 'Max Supply', value: coinData.market_data.max_supply, suffix: coinData.symbol.toUpperCase() }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-1 text-muted">
                                        {stat.label} <Info size={12} className="opacity-50" />
                                    </div>
                                    <span className="font-bold">
                                        {stat.value ? (
                                            stat.isCurrency ? `$${stat.value.toLocaleString()}` : `${stat.value.toLocaleString()} ${stat.suffix || ''}`
                                        ) : '∞'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <a
                            href={coinData.links?.homepage?.[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-card border border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-700 transition flex items-center justify-center"
                        >
                            Find out more info
                        </a>

                    </div>


                    {/* FAQs */}
                    <div className="flex flex-col gap-4 p-2">
                        <h3 className="font-bold">FAQs</h3>
                        {[
                            { q: `How much is 1 ${coinData.name} worth in ${currencyCode.toUpperCase()}?`, a: `The current price of 1 ${coinData.name} is ${formatCurrency(exchangeRate, currencyCode)}. This price is updated in real-time and reflects the latest market activity.` },
                            { q: `How many ${coinData.symbol.toUpperCase()} can I buy for 1 ${currencyCode.toUpperCase()}?`, a: `With 1 ${currencyCode.toUpperCase()}, you can buy approximately ${(1 / exchangeRate).toFixed(8)} ${coinData.symbol.toUpperCase()}. This is calculated by dividing 1 by the current exchange rate.` },
                            { q: `How do I convert the price of ${coinData.symbol.toUpperCase()} to ${currencyCode.toUpperCase()}?`, a: `You can use the converter tool on this page to calculate the value. Simply enter the amount of ${coinData.symbol.toUpperCase()} you want to convert, and it will automatically display the equivalent value in ${currencyCode.toUpperCase()}.` },
                            { q: `What is the highest price of ${coinData.symbol.toUpperCase()}/${currencyCode.toUpperCase()} in history?`, a: `The all-time high price of ${coinData.name} was ${formatCurrency(coinData.market_data.ath[currencyCode.toLowerCase()] || coinData.market_data.ath.usd, currencyCode)} on ${new Date(coinData.market_data.ath_date[currencyCode.toLowerCase()] || coinData.market_data.ath_date.usd).toLocaleDateString()}.` },
                            { q: `What is the price trend of ${coinData.name} in ${currencyCode.toUpperCase()}?`, a: `Over the last 24 hours, the price has changed by ${coinData.market_data.price_change_percentage_24h.toFixed(2)}%. In the last 7 days, the price has moved by ${coinData.market_data.price_change_percentage_7d.toFixed(2)}%.` }
                        ].map((item, i) => (
                            <div key={i} className="border-b border-gray-800 pb-2">
                                <div
                                    className="flex justify-between items-center py-2 cursor-pointer group"
                                    onClick={() => toggleFAQ(i)}
                                >
                                    <span className="text-sm text-gray-400 group-hover:text-white transition font-medium">{item.q}</span>
                                    <span className="text-gray-400 text-xl font-light">{expandedFAQ === i ? '−' : '+'}</span>
                                </div>
                                <motion.div
                                    initial={false}
                                    animate={{ height: expandedFAQ === i ? 'auto' : 0, opacity: expandedFAQ === i ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-xs text-muted leading-relaxed pb-2 pl-1">
                                        {item.a}
                                    </p>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* RIGHT COLUMN: Converter & Chart */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Converter Section */}
                    <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-2">Convert {coinData.name} to {currencyCode.toUpperCase()} ({coinData.symbol.toUpperCase()} to {currencyCode.toUpperCase()})</h2>
                        <p className="text-sm text-muted mb-6">
                            The price of converting 1 {coinData.name} ({coinData.symbol.toUpperCase()}) to {currencyCode.toUpperCase()} is {formatCurrency(exchangeRate, currencyCode)} today.
                        </p>

                        <div className="flex flex-col md:flex-row items-center gap-0 md:gap-4 bg-[#0d0f14] p-1 rounded-2xl border border-gray-800">

                            <div className="flex-1 w-full bg-transparent flex items-center px-4 h-14 border-b md:border-b-0 md:border-r border-gray-800 relative">
                                <span className="text-white text-lg font-mono w-full">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        className="bg-transparent w-full text-white outline-none"
                                    />
                                </span>
                                <span className="text-muted font-bold text-sm ml-2">{coinData.symbol.toUpperCase()}</span>
                            </div>

                            <div className="md:p-2">
                                <ArrowRightLeft className="text-gray-500" size={20} />
                            </div>

                            <div className="flex-1 w-full bg-transparent flex items-center px-4 h-14">
                                <span className="text-white text-lg font-mono font-bold w-full">
                                    {calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-muted font-bold text-sm ml-2">{currencyCode.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 text-xs font-medium">
                            <span className="text-muted">1 {coinData.symbol.toUpperCase()} = {formatCurrency(exchangeRate, currencyCode)}</span>
                            <span className="text-blue-400 cursor-pointer hover:underline">How to Buy {coinData.symbol.toUpperCase()} with {currencyCode.toUpperCase()} Show</span>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-xl font-bold">{coinData.symbol.toUpperCase()} to {currencyCode.toUpperCase()} Chart</h3>
                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                                {coinData.name} ({coinData.symbol.toUpperCase()}) is worth <span className="text-white font-bold">{formatCurrency(exchangeRate, currencyCode)}</span> today, which is a <span className={coinData.market_data.price_change_percentage_1h_in_currency?.usd >= 0 ? "text-green-500" : "text-red-500"}>{coinData.market_data.price_change_percentage_1h_in_currency?.usd?.toFixed(1)}%</span> change from an hour ago and a <span className={coinData.market_data.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>{coinData.market_data.price_change_percentage_24h.toFixed(1)}%</span> change since yesterday.
                            </p>
                        </div>

                        <div className="h-[500px] w-full bg-[#0b0e11] rounded-3xl border border-gray-800 p-2 overflow-hidden relative">
                            <CoinDetailGraph coinId={coinId} chartHeight="h-full" />
                        </div>

                        {/* Price Performance Table */}
                        <div className="mt-6 bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 overflow-x-auto no-scrollbar">
                            <h3 className="text-lg font-bold mb-4">{coinData.name} Price Performance ({currencyCode.toUpperCase()})</h3>
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        {['1h', '24h', '7d', '14d', '30d', '1y'].map(h => (
                                            <th key={h} className="text-left py-3 text-sm text-muted font-medium uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {[
                                            coinData.market_data.price_change_percentage_1h_in_currency?.usd,
                                            coinData.market_data.price_change_percentage_24h,
                                            coinData.market_data.price_change_percentage_7d,
                                            coinData.market_data.price_change_percentage_14d,
                                            coinData.market_data.price_change_percentage_30d,
                                            coinData.market_data.price_change_percentage_1y
                                        ].map((val, idx) => (
                                            <td key={idx} className={`py-4 text-sm font-bold ${val >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {val ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </motion.div>
    );
};

export default CoinConversionDetail;
