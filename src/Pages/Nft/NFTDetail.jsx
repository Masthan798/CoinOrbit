import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Globe,
    Twitter,
    MessageCircle,
    ExternalLink,
    Copy,
    Check,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Info,
    Calendar,
    Layers,
    Star,
    Share2,
    Bell,
    MoreHorizontal
} from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import NFTDetailGraph from '../../Components/Graphs/NFTDetailGraph';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { useCurrency } from '../../Context/CurrencyContext';

const StatRow = ({ label, value, change, isPositive, tooltip }) => (
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-800/20 last:border-0 hover:bg-white/[0.03] px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-300 group">
        <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-muted font-bold group-hover:text-white/80 transition-colors uppercase tracking-tight">{label}</span>
            {tooltip && <span className='text-[10px] sm:text-xs text-muted/30 cursor-help' title={tooltip}>ⓘ</span>}
        </div>
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">{value}</span>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-1.5 py-0.5 rounded`}>
                        {isPositive ? '+' : ''}{change?.toFixed(1)}%
                    </div>
                )}
            </div>
        </div>
    </div>
);

const NFTDetail = () => {
    const { contractAddress } = useParams();
    const { currency, formatPrice } = useCurrency();
    const [nftData, setNftData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Overview');
    const [copied, setCopied] = useState(false);
    const [showExplorers, setShowExplorers] = useState(false);
    const [dataType, setDataType] = useState('price'); // 'price' or 'market_cap'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await coingeckoFetch(`/nfts/${contractAddress}`);
                setNftData(data);
                setError(null);
            } catch (err) {
                try {
                    const isEvm = contractAddress.startsWith('0x');
                    const chain = isEvm ? 'ethereum' : 'solana';
                    const data = await coingeckoFetch(`/nfts/${chain}/contract/${contractAddress.toLowerCase()}`);
                    setNftData(data);
                    setError(null);
                } catch (innerErr) {
                    setError("Could not load collection details.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (contractAddress) fetchData();
    }, [contractAddress]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0b0e11] p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (error || !nftData) return (
        <div className="min-h-screen bg-[#0b0e11] p-8 text-center flex flex-col items-center justify-center">
            <div className="p-10 bg-rose-500/5 rounded-3xl border border-gray-800 max-w-md w-full">
                <Info size={48} className="text-rose-500 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-white mb-2">Collection Not Found</h2>
                <Link to="/nft-floor" className="text-emerald-500 font-bold hover:underline">Go to Market</Link>
            </div>
        </div>
    );

    const priceChange = nftData.floor_price_in_usd_24h_percentage_change || 0;
    const isPositive = priceChange >= 0;

    return (
        <div className="min-h-screen bg-[#0b0e11] text-white p-2 sm:p-6 flex flex-col gap-6">
            <Breadcrumbs
                crumbs={[
                    { label: 'NFT', path: '/nft-floor' },
                    { label: `${nftData.asset_platform_id?.toUpperCase()}`, path: '/nft-floor' },
                    { label: nftData.name }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT SIDEBAR - The Master Info Column */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6">

                    {/* Header Info Block */}
                    <div className="p-4 sm:p-8 border-gray-800 border-2 rounded-3xl bg-card/20 backdrop-blur-md flex flex-col gap-4 sm:gap-6 shadow-2xl shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-1 bg-white/5 rounded-full border border-white/10">
                                    <img
                                        src={nftData.image?.small || nftData.image?.large}
                                        alt={nftData.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">{nftData.name}</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted uppercase font-bold tracking-widest leading-none">{nftData.asset_platform_id?.toUpperCase()}</span>
                                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted font-bold">RANK #{nftData.market_cap_rank || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className='p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 transition-all text-muted hover:text-white group'>
                                <Bell size={18} className='group-hover:scale-110 transition-transform sm:w-5 sm:h-5' />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-5xl font-black tracking-tighter text-white">
                                    {nftData.floor_price?.native_currency?.toLocaleString()} {nftData.native_currency_symbol?.toUpperCase()}
                                </span>
                                <div className={`text-xs sm:text-base font-bold px-2.5 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-muted font-bold uppercase tracking-widest opacity-60 mt-1">
                                ≈ {formatPrice(nftData.floor_price?.[currency.code.toLowerCase()] || nftData.floor_price?.usd)}
                            </p>
                        </div>

                        <div className='pt-1 sm:pt-2 flex gap-3'>
                            <button className="flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 bg-card hover:bg-white/5 text-white text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl border border-white/10 transition-all active:scale-[0.98] shadow-lg shadow-black/20 group">
                                <Star size={16} fill="currentColor" className="group-hover:scale-110 transition-transform sm:w-[18px] sm:h-[18px]" />
                                <span>Add to Watchlist</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats List Block */}
                    <div className="w-full flex flex-col gap-0.5 sm:gap-1">
                        <StatRow
                            label="Market Cap"
                            value={`${nftData.market_cap?.native_currency?.toLocaleString()} ${nftData.native_currency_symbol?.toUpperCase()}`}
                            change={nftData.market_cap_24h_percentage_change?.native_currency}
                            isPositive={nftData.market_cap_24h_percentage_change?.native_currency >= 0}
                        />
                        <StatRow
                            label="24h Volume"
                            value={`${nftData.volume_24h?.native_currency?.toLocaleString()} ${nftData.native_currency_symbol?.toUpperCase()}`}
                            change={nftData.volume_24h_percentage_change?.native_currency}
                            isPositive={nftData.volume_24h_percentage_change?.native_currency >= 0}
                        />
                        <StatRow
                            label="24h Sales"
                            value={nftData.one_day_sales || '-'}
                            change={nftData.one_day_sales_24h_percentage_change}
                            isPositive={nftData.one_day_sales_24h_percentage_change >= 0}
                        />
                        <StatRow
                            label="24h Average Sale Price"
                            value={nftData.one_day_average_sale_price ? `${nftData.one_day_average_sale_price.toFixed(2)} ${nftData.native_currency_symbol?.toUpperCase()}` : '-'}
                            change={nftData.one_day_average_sale_price_24h_percentage_change}
                            isPositive={nftData.one_day_average_sale_price_24h_percentage_change >= 0}
                        />
                        <StatRow
                            label="Unique Owners"
                            value={nftData.number_of_unique_addresses ? `${nftData.number_of_unique_addresses.toLocaleString()} (${((nftData.number_of_unique_addresses / nftData.total_supply) * 100).toFixed(2)}%)` : '-'}
                        />
                        <StatRow label="Total Assets" value={nftData.total_supply?.toLocaleString() || '-'} />

                        <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-800/20 last:border-0 hover:bg-white/[0.03] px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-300 group">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted font-black uppercase tracking-tighter">All-Time High</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                                    {formatPrice(nftData.ath?.[currency.code.toLowerCase()] || nftData.ath?.usd)}
                                </p>
                                <div className={`text-[10px] font-bold flex items-center gap-0.5 ${nftData.ath_change_percentage?.native_currency < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {nftData.ath_change_percentage?.native_currency?.toFixed(1)}%
                                </div>
                                <span className="text-[10px] text-muted/40 font-bold uppercase">{nftData.ath_date?.native_currency ? new Date(nftData.ath_date.native_currency).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="p-6 border-gray-800 border-2 rounded-2xl bg-card/5 space-y-5">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Info</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Categories</span>
                                <div className="flex gap-1">
                                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/60">NFT</span>
                                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/60">PFP</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Website</span>
                                <a href={nftData.links?.homepage} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-white flex items-center gap-1 hover:text-emerald-400 transition-colors bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                                    {nftData.links?.homepage ? new URL(nftData.links.homepage).hostname.replace('www.', '') : 'Website'}
                                    <ExternalLink size={10} />
                                </a>
                            </div>

                            <div className="flex items-center justify-between relative">
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Explorers</span>
                                <button
                                    onClick={() => setShowExplorers(!showExplorers)}
                                    className="text-[10px] font-bold text-white px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    Etherscan <ChevronDown size={12} className={showExplorers ? 'rotate-180' : ''} />
                                </button>
                                {showExplorers && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                        {nftData.explorers?.map((exp, idx) => (
                                            <a key={idx} href={exp.link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-[10px] text-white font-bold transition-colors">
                                                {exp.name} <ExternalLink size={10} className="text-muted-foreground" />
                                            </a>
                                        ))}
                                        <a href={`https://etherscan.io/address/${contractAddress}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg text-[10px] text-white font-bold transition-colors">Etherscan <ExternalLink size={10} /></a>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Community</span>
                                <div className="flex gap-2">
                                    <a href={nftData.links?.twitter} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"><Twitter size={14} /></a>
                                    <a href={nftData.links?.discord} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"><MessageCircle size={14} /></a>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase">API ID</span>
                                <button onClick={() => handleCopy(nftData.id)} className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10 hover:text-emerald-400 transition-colors">
                                    <span className="text-[10px] font-bold text-white/50">{nftData.id}</span>
                                    {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-muted-foreground" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT MAIN CONTENT - Tabs and Charts */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                    {/* Navigation Bar */}
                    <div className="flex gap-8 items-center justify-start border-b border-gray-800/50 pb-0 px-2 overflow-x-auto no-scrollbar">
                        {['Overview', 'About', 'Markets', 'Guides'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm sm:text-lg font-bold tracking-wider transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-muted-foreground hover:text-white/80'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'Overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">

                            {/* Chart Controls Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex p-0.5 bg-gray-800/20 border border-gray-800 rounded-lg w-fit">
                                    {['price', 'market_cap'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setDataType(type)}
                                            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${dataType === type ? 'bg-card text-white shadow-lg scale-[1.02] border border-white/10' : 'text-muted-foreground hover:text-white'}`}
                                        >
                                            {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Chart Area */}
                            <div className="p-2 border-gray-800 border-2 rounded-3xl bg-card/5 overflow-hidden">
                                <NFTDetailGraph address={contractAddress} dataType={dataType} />
                            </div>

                            <div className="flex items-center justify-between p-2 flex-wrap gap-4">
                                <div className="flex items-center gap-2 group cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                    <input type="checkbox" id="usd-compare" className="w-3.5 h-3.5 rounded border-gray-800 bg-transparent text-emerald-500 focus:ring-emerald-500" />
                                    <label htmlFor="usd-compare" className="text-[11px] font-bold text-muted-foreground group-hover:text-white cursor-pointer uppercase tracking-wider">Compare with: <span className="text-emerald-400">USD</span></label>
                                </div>
                                <div className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                    Need more data? <a href="https://www.coingecko.com/en/api" target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 border-b border-emerald-500/30">Explore our API</a>
                                </div>
                            </div>

                            {/* Performance Grid */}
                            <div className="bg-card/10 border-gray-800 border-2 rounded-2xl overflow-hidden mt-4">
                                <div className="grid grid-cols-6 border-b border-gray-800 bg-white/[0.02]">
                                    {['24h', '7d', '14d', '30d', '60d', '1y'].map(time => (
                                        <div key={time} className="py-2.5 text-center border-r border-gray-800 last:border-0">
                                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">{time}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-6">
                                    {['24h', '7d', '14d', '30d', '60d', '1y'].map((time, idx) => {
                                        const field = `floor_price_${time}_percentage_change`;
                                        const valObj = nftData[field];
                                        const val = typeof valObj === 'number' ? valObj : (valObj?.native_currency || valObj?.usd || 0);
                                        return (
                                            <div key={idx} className="py-4 text-center border-r border-gray-800 last:border-0 hover:bg-white/[0.03] transition-colors">
                                                <div className={`text-[12px] font-bold flex items-center justify-center gap-1 ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {val >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {Math.abs(val || 0).toFixed(1)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-6 pt-10 border-t border-gray-800/50">
                                <h2 className="text-2xl font-black text-white tracking-tight">What is {nftData.name}?</h2>
                                <div className="space-y-5 text-muted-foreground text-[14px] font-medium leading-[1.8]">
                                    <p>{nftData.description || `The ${nftData.name} collection is one of the premier digital assets on the ${nftData.asset_platform_id?.toUpperCase()} blockchain.`}</p>
                                    <div className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <Info size={14} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Market Insight</span>
                                        </div>
                                        <p className="text-xs italic leading-relaxed opacity-70">
                                            As of today, {nftData.name} consists of {nftData.total_supply?.toLocaleString()} items with a floor price of {nftData.floor_price?.native_currency} {nftData.native_currency_symbol?.toUpperCase()}.
                                            The collection has {nftData.number_of_unique_addresses?.toLocaleString()} unique owners, with a holder distribution of {((nftData.number_of_unique_addresses / nftData.total_supply) * 100).toFixed(1)}%.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'About' && (
                        <div className="bg-card/10 rounded-3xl p-10 border-gray-800 border-2 space-y-8 animate-in fade-in duration-500">
                            <h1 className="text-3xl font-black text-white tracking-tighter">About {nftData.name}</h1>
                            <div className="text-[15px] text-muted-foreground leading-[1.9] font-medium space-y-6">
                                {nftData.description?.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NFTDetail;
