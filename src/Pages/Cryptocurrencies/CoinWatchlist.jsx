import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Star, LayoutGrid, Info, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion, AnimatePresence } from 'framer-motion';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { useCurrency } from '../../Context/CurrencyContext';
import { useWishlist } from '../../Context/WishlistContext';
import { toast } from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const CoinWatchlist = () => {
    const navigate = useNavigate();
    const { currency, formatPrice } = useCurrency();
    const { coinWishlist, toggleCoinWishlist } = useWishlist();
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWatchlistCoins = async () => {
        if (coinWishlist.length === 0) {
            setCoins([]);
            return;
        }

        setLoading(true);
        try {
            const ids = coinWishlist.join(',');
            const res = await coingeckoFetch(`/coins/markets?vs_currency=${currency.code}&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`);
            if (Array.isArray(res)) {
                setCoins(res);
            }
        } catch (err) {
            console.error('Error fetching watchlist coins:', err);
            toast.error('Failed to update watchlist prices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlistCoins();
    }, [coinWishlist, currency.code]);

    const handleToggleFavorite = async (e, coinId) => {
        e.stopPropagation();
        const result = await toggleCoinWishlist(coinId);
        if (result.error) toast.error(result.error);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full min-h-screen flex flex-col gap-8 pb-32 bg-main rounded-md px-4 sm:px-10 lg:px-12"
        >
            <div className="w-full">
                <Breadcrumbs
                    crumbs={[
                        { label: 'Cryptocurrencies', path: '/' },
                        { label: 'Watchlist' }
                    ]}
                />
            </div>

            <motion.div variants={itemVariants} className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400/10 rounded-md">
                            <Star className="text-yellow-400" size={24} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">Coin Watchlist</h1>
                    </div>
                    <p className="text-sm sm:text-xl text-muted font-medium">
                        Monitoring <span className="text-white font-bold">{coinWishlist.length}</span> digital assets in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-md border border-white/10">
                    <Link to="/" className="px-4 py-2 text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
                        All Markets
                    </Link>
                    <button className="p-2 bg-white/10 rounded-md text-white">
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </motion.div>

            {loading && coins.length === 0 ? (
                <TableSkeleton />
            ) : coinWishlist.length === 0 ? (
                <motion.div 
                    variants={itemVariants} 
                    className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-md gap-6"
                >
                    <div className="p-10 bg-white/5 rounded-full">
                        <Star size={64} className="text-white/10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your watchlist is empty</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto font-medium">Keep an eye on the assets that matter most. Start adding coins from the market overview.</p>
                    </div>
                    <Link 
                        to="/" 
                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-md hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
                    >
                        Explore Markets
                    </Link>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="w-full overflow-x-auto relative rounded-md border border-gray-800/50">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-700 text-muted sticky top-0 bg-main z-20">
                            <tr>
                                <th className="py-4 pl-10 pr-2 uppercase tracking-widest text-[10px] font-black opacity-60"># Rank</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60">Asset</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60">Price</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60">1h</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60">24h</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60">7d</th>
                                <th className="py-4 px-2 uppercase tracking-widest text-[10px] font-black opacity-60 text-right">Market Cap</th>
                                <th className="py-4 px-2 pr-10 uppercase tracking-widest text-[10px] font-black opacity-60 text-right">Last 7 Days</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {coins.map((coin) => (
                                    <motion.tr
                                        layout
                                        key={coin.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => navigate(`/marketcap/${coin.id}`)}
                                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 pl-10 pr-2">
                                            <div className="flex items-center gap-3">
                                                <Star
                                                    size={14}
                                                    onClick={(e) => handleToggleFavorite(e, coin.id)}
                                                    className="text-yellow-400 fill-yellow-400 cursor-pointer"
                                                />
                                                <span className="text-muted font-bold">{coin.market_cap_rank}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black uppercase text-sm tracking-tight">{coin.symbol}</span>
                                                    <span className="text-[10px] text-muted font-bold">{coin.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 font-black text-white">{formatPrice(coin.current_price)}</td>
                                        <td className={`py-4 px-2 font-bold ${coin.price_change_percentage_1h_in_currency >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {coin.price_change_percentage_1h_in_currency?.toFixed(1)}%
                                        </td>
                                        <td className={`py-4 px-2 font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {coin.price_change_percentage_24h?.toFixed(1)}%
                                        </td>
                                        <td className={`py-4 px-2 font-bold ${coin.price_change_percentage_7d_in_currency >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {coin.price_change_percentage_7d_in_currency?.toFixed(1)}%
                                        </td>
                                        <td className="py-4 px-2 text-right text-muted font-black">{formatPrice(coin.market_cap, { notation: 'compact' })}</td>
                                        <td className="py-4 px-2 pr-10">
                                            <div className="w-24 h-10 ml-auto">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={coin.sparkline_in_7d?.price?.map(p => ({ value: p })) || []}>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke={coin.price_change_percentage_7d_in_currency >= 0 ? '#10b981' : '#ef4444'}
                                                            strokeWidth={2}
                                                            dot={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="mt-auto p-6 bg-blue-500/5 border border-blue-500/10 rounded-md flex items-center gap-4">
                <Info className="text-blue-500 shrink-0" size={24} />
                <p className="text-xs sm:text-sm text-blue-500/80 font-bold leading-relaxed">
                    Watchlist prices are refreshed automatically based on your selected currency. All data is securely stored in your Supabase profile.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default CoinWatchlist;
