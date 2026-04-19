import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
    Eye,
    Trash2,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Search,
    ChevronRight,
    LayoutGrid,
    Table as TableIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { useCurrency } from '../../Context/CurrencyContext';
import { useWishlist } from '../../Context/WishlistContext';
import { coingeckoFetch } from '../../api/coingeckoClient';
import AddAssetModal from '../../Components/Portfolio/AddAssetModal';
import { Star, RefreshCw } from 'lucide-react';

const WatchingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-md animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5" />
                        <div className="flex flex-col gap-2">
                            <div className="w-24 h-4 bg-white/5 rounded" />
                            <div className="w-12 h-2 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-white/5" />
                </div>
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="w-16 h-2 bg-white/5 rounded" />
                        <div className="w-32 h-6 bg-white/5 rounded" />
                    </div>
                    <div className="w-12 h-4 bg-white/5 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const Portfolio = () => {
    const { currency, formatPrice } = useCurrency();
    const { coinWishlist, nftWishlist } = useWishlist();
    const [activeTab, setActiveTab] = useState('crypto');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [portfolioData, setPortfolioData] = useState(() => {
        const saved = localStorage.getItem('userPortfolio');
        return saved ? JSON.parse(saved) : { crypto: [], nfts: [] };
    });
    const [watchlistData, setWatchlistData] = useState({ crypto: [], nfts: [] });
    const [livePrices, setLivePrices] = useState({});
    const [loading, setLoading] = useState(false);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('userPortfolio', JSON.stringify(portfolioData));
    }, [portfolioData]);

    // Fetch live prices for portfolio items
    useEffect(() => {
        const fetchPrices = async () => {
            const coinIds = portfolioData.crypto.map(c => c.id).join(',');
            const nftIds = portfolioData.nfts.map(n => n.id).join(',');

            if (!coinIds && !nftIds && coinWishlist.length === 0 && nftWishlist.length === 0) return;

            setLoading(true);
            try {
                // Portfolio Prices
                let cryptoPrices = {};
                if (coinIds) {
                    cryptoPrices = await coingeckoFetch(`/simple/price?ids=${coinIds}&vs_currencies=${currency.code}&include_24hr_change=true`);
                }

                let nftPrices = {};
                if (nftIds) {
                    for (const nft of portfolioData.nfts) {
                        try {
                            const data = await coingeckoFetch(`/nfts/${nft.id}`);
                            // Coingecko returns floor_price object with currency keys
                            nftPrices[nft.id] = {
                                price: data.floor_price?.[currency.code] || data.floor_price?.usd || 0,
                                change: data.floor_price_in_usd_24h_percentage_change || 0
                            };
                        } catch (e) {
                            console.error(`Error fetching NFT price for ${nft.id}:`, e);
                        }
                    }
                }

                // Watchlist Data Fetching
                let watchlistCrypto = [];
                if (coinWishlist.length > 0) {
                    const ids = coinWishlist.join(',');
                    watchlistCrypto = await coingeckoFetch(`/coins/markets?vs_currency=${currency.code}&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`);
                }

                let watchlistNfts = [];
                if (nftWishlist.length > 0) {
                    for (const id of nftWishlist) {
                        try {
                            const data = await coingeckoFetch(`/nfts/${id}`);
                            watchlistNfts.push(data);
                        } catch (e) { console.error(e); }
                    }
                }

                setLivePrices({ crypto: cryptoPrices, nfts: nftPrices });
                setWatchlistData({ crypto: watchlistCrypto, nfts: watchlistNfts });
            } catch (err) {
                console.error("Price fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, [portfolioData, currency, coinWishlist, nftWishlist]);

    const addAsset = (asset) => {
        setPortfolioData(prev => ({
            ...prev,
            [asset.type === 'crypto' ? 'crypto' : 'nfts']: [...prev[asset.type === 'crypto' ? 'crypto' : 'nfts'], asset]
        }));
    };

    const removeAsset = (id, type) => {
        setPortfolioData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    // Calculations
    const stats = useMemo(() => {
        let total = 0;
        let change24h = 0;
        const chartData = [];
        // Calculate Sector Breakdown
        let cryptoTotal = 0;
        let nftTotal = 0;

        portfolioData.crypto.forEach(coin => {
            const price = livePrices.crypto?.[coin.id]?.[currency.code] || 0;
            cryptoTotal += (coin.amount || 0) * price;
        });
        portfolioData.nfts.forEach(nft => {
            const price = livePrices.nfts?.[nft.id]?.price || 0;
            nftTotal += (nft.amount || 0) * price;
        });

        // Calculate Watchlist Sector Breakdown (only if holdings are empty)
        let watchlistCryptoTotal = 0;
        let watchlistNftTotal = 0;
        if (cryptoTotal === 0 && nftTotal === 0) {
            watchlistData.crypto.forEach(coin => {
                watchlistCryptoTotal += (coin.current_price || 0);
            });
            watchlistData.nfts.forEach(nft => {
                watchlistNftTotal += (nft.floor_price?.[currency.code] || nft.floor_price?.usd || 0);
            });
        }

        const finalTotal = cryptoTotal + nftTotal;
        const finalWatchlistTotal = watchlistCryptoTotal + watchlistNftTotal;

        if (finalTotal > 0) {
            if (cryptoTotal > 0) chartData.push({ name: 'Cryptocurrencies', value: cryptoTotal });
            if (nftTotal > 0) chartData.push({ name: 'NFT Collections', value: nftTotal });
        } else if (finalWatchlistTotal > 0) {
            if (watchlistCryptoTotal > 0) chartData.push({ name: 'Watched Crypto', value: watchlistCryptoTotal });
            if (watchlistNftTotal > 0) chartData.push({ name: 'Watched NFTs', value: watchlistNftTotal });
        }

        return {
            total: finalTotal,
            change24h,
            chartData,
            watchlistTotal: finalWatchlistTotal
        };
    }, [portfolioData, livePrices, currency, watchlistData]);

    const COLORS = ['#FFFFFF', '#E5E5E5', '#A1A1A1', '#737373', '#404040', '#262626'];

    return (
        <div className='w-full flex flex-col justify-start bg-main min-h-full p-2 sm:p-8 pb-12 rounded-md gap-8'>
            {/* Header section */}
            <div className="w-full">
                <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Portfolio' }]} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mt-4">
                <h1 className='text-3xl md:text-4xl font-bold tracking-tight text-white'>My Portfolio</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-md font-bold uppercase tracking-widest transition-all active:scale-95 text-xs"
                >
                    <Plus className="w-4 h-4" />
                    Add New Asset
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Total Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 bg-gradient-to-br from-[#121212] to-black border border-white/5 rounded-md p-8 md:p-12 flex flex-col justify-between min-h-[300px] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-muted font-bold uppercase tracking-[0.3em] text-xs">
                                {stats.total > 0 ? 'Total Net Worth' : 'Watching Value'}
                            </span>
                            {stats.total === 0 && stats.watchlistTotal > 0 && (
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">
                                    Monitoring Only
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-4 mt-2">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums text-white">
                                {formatPrice(stats.total > 0 ? stats.total : stats.watchlistTotal)}
                            </h2>
                        </div>

                        {stats.total > 0 ? (
                            <div className={`flex items-center gap-2 font-bold text-lg ${stats.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                <span>{stats.change24h >= 0 ? '+' : ''}{formatPrice(Math.abs(stats.change24h))}</span>
                                <span className="text-muted text-sm opacity-50 uppercase tracking-widest">(24h)</span>
                            </div>
                        ) : stats.watchlistTotal > 0 ? (
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-yellow-500/50 uppercase font-black tracking-widest">Holdings Current Balance</span>
                                    <span className="text-xl font-black text-white/20 tracking-tight">{formatPrice(0)}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-white/5 mx-2"></div>
                                <p className="text-[10px] text-muted max-w-[200px] leading-tight font-bold italic opacity-60">
                                    Your watchlist is worth {formatPrice(stats.watchlistTotal)}. Add to holdings to see profit/loss.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted font-bold mt-2 opacity-40 uppercase tracking-widest">No assets tracked yet</p>
                        )}
                    </div>

                    <div className="flex gap-4 mt-8">
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm">
                            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Crypto Share</p>
                            <p className="text-xl font-black">
                                {Math.round(((portfolioData.crypto.length + watchlistData.crypto.length) /
                                    (portfolioData.crypto.length + watchlistData.crypto.length + portfolioData.nfts.length + watchlistData.nfts.length || 1)) * 100)}%
                            </p>
                        </div>
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm">
                            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">NFT Share</p>
                            <p className="text-xl font-black">
                                {Math.round(((portfolioData.nfts.length + watchlistData.nfts.length) /
                                    (portfolioData.crypto.length + watchlistData.crypto.length + portfolioData.nfts.length + watchlistData.nfts.length || 1)) * 100)}%
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Pie Chart Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-4 bg-[#121212] border border-white/5 rounded-md p-8 flex flex-col items-center justify-center relative group"
                >
                    <div className="absolute top-6 left-8 flex items-center gap-2 opacity-50">
                        <PieChartIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Asset Allocation</span>
                    </div>
                    {stats.chartData.length > 0 ? (
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '6px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-muted py-12">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                <Search className="w-6 h-6 opacity-20" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest">No data available</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Asset List Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('crypto')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'crypto' ? 'text-white' : 'text-muted hover:text-white/80'}`}
                        >
                            Crypto {activeTab === 'crypto' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('nfts')}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'nfts' ? 'text-white' : 'text-muted hover:text-white/80'}`}
                        >
                            NFTs {activeTab === 'nfts' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-10"
                    >
                        {/* Section 1: Holdings */}
                        {portfolioData[activeTab].length > 0 ? (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Your Holdings</span>
                                    <div className="h-[1px] flex-1 bg-white/5"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {portfolioData[activeTab].map((item, idx) => {
                                        const price = activeTab === 'crypto'
                                            ? livePrices.crypto?.[item.id]?.[currency.code]
                                            : livePrices.nfts?.[item.id]?.price;
                                        const change = activeTab === 'crypto'
                                            ? livePrices.crypto?.[item.id]?.[`${currency.code}_24h_change`]
                                            : livePrices.nfts?.[item.id]?.change;

                                        const totalValue = (item.amount || 0) * (price || 0);

                                        return (
                                            <div
                                                key={item.id + idx}
                                                onClick={() => {
                                                    if (activeTab === 'crypto') {
                                                        navigate(`/marketcap/${item.id}`);
                                                    } else {
                                                        navigate(`/nft-detail/${item.id}`);
                                                    }
                                                }}
                                                className="bg-[#121212]/50 border border-white/5 p-6 rounded-md hover:border-white/10 hover:bg-white/5 transition-all group flex flex-col gap-6 relative cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img src={item.thumb} alt="" className="w-12 h-12 rounded-full shadow-lg shadow-black/50" />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-xl text-white group-hover:text-white transition-colors">{item.name}</span>
                                                                {(activeTab === 'crypto' ? coinWishlist.includes(item.id) : nftWishlist.includes(item.id)) && (
                                                                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted uppercase font-bold font-mono tracking-widest">{item.amount} {item.symbol || 'Items'}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeAsset(item.id, activeTab)}
                                                        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-end justify-between mt-auto">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Curr. Value</span>
                                                        <span className="text-2xl font-bold tabular-nums">{formatPrice(totalValue)}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                        {Math.abs(change || 0).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            watchlistData[activeTab].length === 0 && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Your Holdings</span>
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                    </div>
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-dashed border-white/5 rounded-md text-center group hover:bg-white/[0.02] transition-colors">
                                        <Plus className="w-8 h-8 text-muted/20" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted/50">No holdings in this category</p>
                                        <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-white hover:text-gray-300 transition-colors underline decoration-white/20 underline-offset-4">Add your first asset +</button>
                                    </div>
                                </div>
                            )
                        )}

                        {/* Section 2: Watching */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/80">Watching</span>
                                <div className="h-[1px] flex-1 bg-yellow-500/10"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {loading ? (
                                    <div className="col-span-full">
                                        <WatchingSkeleton />
                                    </div>
                                ) : activeTab === 'crypto' ? (
                                    watchlistData.crypto.length > 0 ? (
                                        watchlistData.crypto.map((coin) => (
                                            <div 
                                                key={coin.id} 
                                                onClick={() => navigate(`/marketcap/${coin.id}`)}
                                                className="bg-white/[0.02] border border-white/5 p-5 rounded-md hover:border-yellow-500/20 transition-all group relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                                    <Star size={64} className="fill-current" />
                                                </div>
                                                <div className="flex items-center justify-between mb-4 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <img src={coin.image} alt="" className="w-10 h-10 rounded-full" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white group-hover:text-yellow-400 transition-colors">{coin.name}</span>
                                                            <span className="text-[10px] text-muted uppercase font-bold tracking-widest font-mono">{coin.symbol}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-yellow-500/10 rounded-md">
                                                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Mark. Price</span>
                                                        <span className="text-xl font-black tabular-nums">{formatPrice(coin.current_price)}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {coin.price_change_percentage_24h?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 border border-dashed border-white/5 rounded-md opacity-50">
                                            <Star size={20} className="text-muted/20" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/30">Not watching any coins yet</p>
                                            <Link to="/marketcap" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-white/5 transition-all mt-2">Browse Market</Link>
                                        </div>
                                    )
                                ) : (
                                    watchlistData.nfts.length > 0 ? (
                                        watchlistData.nfts.map((nft) => (
                                            <div 
                                                key={nft.id} 
                                                onClick={() => navigate(`/nft-detail/${nft.id}`)}
                                                className="bg-white/[0.02] border border-white/5 p-5 rounded-md hover:border-purple-500/20 transition-all group relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                                    <Star size={64} className="fill-current" />
                                                </div>
                                                <div className="flex items-center justify-between mb-4 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <img src={nft.image?.small} alt="" className="w-10 h-10 rounded-full" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white group-hover:text-purple-400 transition-colors">{nft.name}</span>
                                                            <span className="text-[10px] text-muted uppercase font-bold tracking-widest font-mono">{nft.symbol}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-purple-500/10 rounded-md">
                                                        <Star className="text-purple-400 fill-purple-400" size={12} />
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Floor Price</span>
                                                        <span className="text-xl font-black tabular-nums">{formatPrice(nft.floor_price?.usd)}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${nft.floor_price_in_usd_24h_percentage_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {nft.floor_price_in_usd_24h_percentage_change?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 border border-dashed border-white/5 rounded-md opacity-50">
                                            <Star size={20} className="text-muted/20" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/30">Not watching any collections yet</p>
                                            <Link to="/nft-floor" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-white/5 transition-all mt-2">Browse NFTs</Link>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AddAssetModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        type={activeTab === 'crypto' ? 'crypto' : 'nft'}
                        onAdd={addAsset}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Portfolio;
