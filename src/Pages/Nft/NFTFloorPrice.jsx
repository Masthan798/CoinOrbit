import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Flame, Layers, Star, ExternalLink, RefreshCcw } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const NFTCard = ({ nft, isTrending }) => {
  const data = (isTrending && nft.item) ? nft.item : nft;
  const stats = data?.data || null;

  if (!data) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[#0b0e11]/90 backdrop-blur-xl border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col h-full hover:border-cyan-500/50 transition-all duration-500 shadow-2xl"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Top Banner Area (Refined Gradient) */}
      <div className="relative aspect-[16/8] sm:aspect-[16/9] w-full bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent flex items-center justify-center border-b border-white/5">
        {/* NFT Name at Top Left */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
          <span className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-500/20 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-cyan-500/20 shadow-2xl">
            {data.name}
          </span>
        </div>

        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white/10 select-none">
          {data.asset_platform_id || 'CHAIN'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11] to-transparent" />
      </div>

      <div className="p-4 sm:p-8 flex flex-col flex-1 gap-4 sm:gap-6 relative">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-base sm:text-xl font-black text-white truncate group-hover:text-cyan-400 transition-colors tracking-tight italic uppercase">
              {data.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                {data.symbol}
              </span>
              {isTrending && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isTrending && (
              <div className={`p-1.5 sm:p-2 rounded-xl flex items-center gap-1 ${stats?.floor_price_in_usd_24h_percentage_change >= 0 ? 'bg-cyan-500/10 text-cyan-500' : 'bg-red-500/10 text-red-500'}`}>
                {stats?.floor_price_in_usd_24h_percentage_change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-[10px] sm:text-xs font-bold">{Math.abs(stats?.floor_price_in_usd_24h_percentage_change || 0).toFixed(1)}%</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.2, color: '#facc15' }}
              whileTap={{ scale: 0.9 }}
              className="p-2 sm:p-2.5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-white/40 hover:text-yellow-400 transition-all shadow-xl"
            >
              <Star size={16} sm:size={18} />
            </motion.button>
          </div>
        </div>

        {!isTrending && (
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 italic font-medium opacity-60">
            {data.asset_platform_id}. Verified contract: {data.contract_address?.slice(0, 6)}...
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Type</span>
            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-tighter">Collection Item</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 45 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 sm:p-3 bg-white/5 hover:bg-cyan-500 hover:text-white rounded-xl transition-all duration-300 text-cyan-400 shadow-lg border border-white/5"
          >
            <ArrowUpRight size={18} sm:size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div >
  );
};

const NFTFloorPrice = () => {
  const [trendingNfts, setTrendingNfts] = useState([]);
  const [allNfts, setAllNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeTab, setActiveTab] = useState('Trending');

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [trendingRes, listRes] = await Promise.all([
          coingeckoFetch('/search/trending'),
          coingeckoFetch('/nfts/list')
        ]);

        if (trendingRes?.nfts) setTrendingNfts(trendingRes.nfts);
        if (Array.isArray(listRes)) setAllNfts(listRes);
      } catch (err) {
        console.error("NFT Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const tabs = ['Trending', 'New', 'Top Gainers', 'Top Losers'];

  const getFilteredData = useMemo(() => {
    let baseList = [];

    // Choose base dataset based on tab
    if (activeTab === 'Trending') {
      baseList = trendingNfts;
    } else if (activeTab === 'Top Gainers') {
      baseList = [...trendingNfts].sort((a, b) =>
        (b.item?.data?.floor_price_in_usd_24h_percentage_change || 0) -
        (a.item?.data?.floor_price_in_usd_24h_percentage_change || 0)
      );
    } else if (activeTab === 'Top Losers') {
      baseList = [...trendingNfts].sort((a, b) =>
        (a.item?.data?.floor_price_in_usd_24h_percentage_change || 0) -
        (b.item?.data?.floor_price_in_usd_24h_percentage_change || 0)
      );
    } else {
      baseList = allNfts;
    }

    // Apply Search
    const fullList = baseList.filter(nft => {
      const data = nft.item || nft;
      return data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return {
      display: fullList.slice(0, visibleCount),
      totalCount: fullList.length
    };
  }, [activeTab, trendingNfts, allNfts, searchQuery, visibleCount]);

  const { display: filteredList, totalCount } = getFilteredData;
  const hasMore = visibleCount < totalCount;

  return (
    <div className='w-full min-h-screen flex flex-col gap-3 sm:gap-12 p-2 sm:p-8 pb-32 overflow-x-hidden'>
      <div className='w-full'>
        <Breadcrumbs crumbs={[{ label: 'NFTs', path: '/nft-floor' }, { label: 'Explore' }]} />
      </div>

      {/* Header Section - Modern Shrunken Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left px-1">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-none">NFT Markets</h1>
          <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-widest opacity-80">
            {totalCount} Collections Tracking
          </p>
        </div>

        {/* Search Bar - Full Width on Mobile */}
        <div className="relative group w-full md:w-[320px] px-1">
          <Search className="absolute left-4.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors ml-1" size={14} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(24);
            }}
            className="w-full bg-[#1a1c22] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Navigation Row - Category Tabs (Ultra-Shrunk & Scrollable) */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1 px-1">
        <div className="flex items-center gap-0.5 bg-[#1a1c22]/30 p-0.5 rounded-[8px] border border-white/5 w-fit sm:min-w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setVisibleCount(24);
              }}
              className={`whitespace-nowrap flex-none px-2 sm:px-6 py-1.5 rounded-[6px] text-[8px] sm:text-xs font-black uppercase tracking-tight transition-all duration-300 ${activeTab === tab
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6 px-1">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#0b0e11] border border-white/5 rounded-[1.2rem] sm:rounded-[2.5rem] aspect-[1/1] sm:aspect-[4/5]" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 gap-8 text-center bg-red-500/5 rounded-[1.5rem] sm:rounded-[3rem] border border-red-500/20 mx-1">
          <div className="p-8 sm:p-10 bg-red-500/10 rounded-full animate-bounce">
            <RefreshCcw className="text-red-500" size={48} sm:size={64} />
          </div>
          <div className="flex flex-col gap-3 px-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">Sync interrupted</h2>
            <p className="text-muted-foreground max-w-md font-bold uppercase tracking-widest text-[10px] sm:text-xs opacity-60">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-10 py-4 sm:px-12 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-blue-500/30 active:scale-95 text-xs sm:text-base">
            Re-initialize
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-10">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-6 border-2 border-dashed border-white/5 rounded-[1.5rem] sm:rounded-[3rem] mx-1">
              <Search className="text-white/5" size={60} sm:size={80} />
              <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm">No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6 px-1">
              <AnimatePresence mode="popLayout">
                {filteredList.map((nft) => (
                  <NFTCard key={nft.id || (nft.item && nft.item.id)} nft={nft} isTrending={activeTab !== 'New'} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-8 sm:pt-12 px-1">
              <button
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 bg-white/5 hover:bg-blue-600/10 border border-white/10 hover:border-blue-500/30 rounded-2xl transition-all"
              >
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em]">Load more collections</span>
                <ArrowUpRight className="text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} sm:size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTFloorPrice;
