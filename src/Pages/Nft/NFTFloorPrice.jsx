import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Flame, Layers, Star, ExternalLink, RefreshCcw } from 'lucide-react';

import { coingeckoFetch } from '../../api/coingeckoClient';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';


const NFTCard = ({ nft }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (nft.id && !details && !loading) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await coingeckoFetch(`/nfts/${nft.id}`);
          if (isMounted) {
            setDetails(res);
          }
        } catch (err) {
          console.error(`Error fetching details for ${nft.id}:`, err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      // Stagger requests slightly to avoid hitting rate limits immediately
      const delay = Math.floor(Math.random() * 5000) + 500;
      const timer = setTimeout(fetchDetails, delay);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [nft.id]);

  const data = details || nft;
  const nftTitle = data.name || data.title || 'Rare NFT';
  const collectionName = data.name || 'NFT Collection';
  const symbol = data.symbol || 'ITEM';

  // High-Fidelity Image Chain (Banner & Logo) - From CoinGecko response
  const bannerUrl = data.banner_image || data.image?.large || data.image?.small;
  const logoUrl = data.image?.small || data.image?.large || data.banner_image;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, transition: { duration: 0.4 } }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-[1.5rem] overflow-hidden flex flex-col h-full hover:border-[var(--text-muted)] transition-all duration-500 shadow-2xl"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />

      {/* Top Banner Area (Improved clarity) */}
      <div className="relative aspect-[16/9] w-full bg-[#0F0F0F] flex items-center justify-center border-b border-[var(--border-soft)] overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={nftTitle}
            className="w-full h-full object-cover transition-all duration-700 opacity-100 scale-100"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/600x400/141414/A1A1A1?text=NFT+Banner'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
        )}

        {/* Collection Name Tag */}
        <div className="absolute top-4 left-4 z-20">
          <span className="text-[var(--text-heading)] text-[9px] font-black uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 shadow-2xl">
            {collectionName}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent z-10" />
      </div>

      <div className="px-5 sm:px-8 pb-6 sm:pb-8 flex flex-col flex-1 gap-4 sm:gap-6 relative">
        {/* Profile/Logo Image Overlay (Cleaned borders) */}
        <div className="relative -mt-8 sm:-mt-12 mb-1 z-20">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-[var(--bg-card)] shadow-2xl bg-[#1A1A1A]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nftTitle}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://placehold.co/200x200/141414/A1A1A1?text=NFT'; }}
              />
            ) : (
              <div className="w-full h-full bg-white/5 animate-pulse" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-base sm:text-2xl font-black text-[var(--text-heading)] truncate leading-tight tracking-tight uppercase group-hover:text-white transition-colors">
              {nftTitle}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[var(--text-muted)] uppercase tracking-widest font-black opacity-60">
                {symbol}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-xs font-bold text-[var(--text-disabled)] tracking-widest uppercase">ID: {data.contract_address?.slice(2, 10).toUpperCase() || 'RARE'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.floor_price_in_usd_24h_percentage_change !== undefined && (
              <div className={`px-2 py-1 rounded-lg flex items-center gap-1 ${data.floor_price_in_usd_24h_percentage_change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.floor_price_in_usd_24h_percentage_change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="text-xs font-black tracking-tighter">{Math.abs(data.floor_price_in_usd_24h_percentage_change || 0).toFixed(1)}%</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all"
            >
              <Star size={16} />
            </motion.button>
          </div>
        </div>

        <p className="text-xs text-[var(--text-body)] leading-relaxed line-clamp-2 italic font-bold opacity-70 border-l-2 border-white/5 pl-3">
          {data.description || `Premium collection verified on the ${data.asset_platform_id || 'ethereum'} network. Official contract: ${data.contract_address?.slice(0, 6)}...`}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-muted)] uppercase font-black tracking-widest opacity-40">Floor Price</span>
            <span className="text-sm sm:text-base font-black text-[var(--text-heading)] uppercase tracking-tighter">
              {data.floor_price?.usd ? `$${data.floor_price.usd.toLocaleString()}` : 'N/A'}
            </span>
          </div>
          <Link to={`/nft-detail/${data.id || data.contract_address}`}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-[var(--bg-main)] hover:bg-white hover:text-black rounded-xl transition-all duration-500 text-[var(--text-heading)] shadow-lg border border-[var(--border-soft)]"
            >
              <ArrowUpRight size={20} />
            </motion.button>
          </Link>

        </div>
      </div>
    </motion.div >
  );
};

const NFTFloorPrice = () => {
  const [allNfts, setAllNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cgList = await coingeckoFetch('/nfts/list');

        if (Array.isArray(cgList)) {
          // Prioritize some well-known ones for better initial look if they exist
          const prioritizedIds = ['bored-ape-yacht-club', 'pudgy-penguins', 'mutant-ape-yacht-club', 'azuki', 'degods'];
          const prioritized = cgList.filter(n => prioritizedIds.includes(n.id));
          const others = cgList.filter(n => !prioritizedIds.includes(n.id));

          setAllNfts([...prioritized, ...others]);
        } else {
          setAllNfts([]);
        }
      } catch (err) {
        console.error("CoinGecko NFT Fetch Error:", err);
        setError("Could not sync with CoinGecko. Check your API key or rate limits.");
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const tabs = ['All', 'Trending', 'New', 'Top Gainers', 'Top Losers'];

  const getFilteredData = useMemo(() => {
    let baseList = allNfts;

    if (activeTab === 'Trending') {
      baseList = allNfts; // Default order from API
    } else if (activeTab === 'All') {
      baseList = allNfts;
    } else if (activeTab === 'New') {
      baseList = [...allNfts].reverse();
    } else if (activeTab === 'Top Gainers') {
      baseList = [...allNfts].sort((a, b) => (b.floor_price_in_usd_24h_percentage_change || b.image?.floor_price_in_usd_24h_percentage_change || 0) - (a.floor_price_in_usd_24h_percentage_change || a.image?.floor_price_in_usd_24h_percentage_change || 0));
    } else if (activeTab === 'Top Losers') {
      baseList = [...allNfts].sort((a, b) => (a.floor_price_in_usd_24h_percentage_change || a.image?.floor_price_in_usd_24h_percentage_change || 0) - (b.floor_price_in_usd_24h_percentage_change || b.image?.floor_price_in_usd_24h_percentage_change || 0));
    }

    const fullList = baseList.filter(item =>
      (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.symbol || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      display: fullList.slice(0, visibleCount),
      totalCount: fullList.length
    };
  }, [activeTab, allNfts, searchQuery, visibleCount]);

  const { display: filteredList, totalCount } = getFilteredData;
  const hasMore = visibleCount < totalCount;

  return (
    <div className='w-full min-h-screen flex flex-col gap-3 sm:gap-12 p-2 sm:p-8 pb-32 overflow-x-hidden rounded-xl bg-main'>
      <div className='w-full'>
        <Breadcrumbs crumbs={[{ label: 'NFTs', path: '/nft-floor' }, { label: 'Explore' }]} />
      </div>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl sm:text-5xl font-bold whitespace-nowrap text-white'>NFT Floor Price</h1>
          <p className='text-sm sm:text-xl text-muted'>
            Explore trending collections across all chains
          </p>
        </div>
      </motion.div>

      <TableFilterHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setVisibleCount(24);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setVisibleCount(24);
        }}
        placeholder="Search NFTs..."
      />

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
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3.5 sm:px-10 sm:py-4 bg-white/5 hover:bg-[var(--bg-card)] text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-[var(--border-strong)] hover:border-[var(--text-muted)] shadow-xl active:scale-95 text-[10px] sm:text-xs"
          >
            Re-initialize sync
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
            <div id="nft-market-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 sm:gap-6 px-1">
              <AnimatePresence mode="popLayout">
                {filteredList.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {(hasMore || visibleCount > 24) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 sm:pt-12 px-1">
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-3.5 bg-white/5 hover:bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[var(--text-muted)] rounded-xl transition-all shadow-xl shadow-black/20 active:scale-95"
                >
                  <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60 group-hover:opacity-100">Load more collections</span>
                  <ArrowUpRight className="text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" size={16} />
                </button>
              )}

              {visibleCount > 24 && (
                <button
                  onClick={() => {
                    setVisibleCount(24);
                    window.scrollTo({ top: document.getElementById('nft-market-grid')?.offsetTop - 100, behavior: 'smooth' });
                  }}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-3.5 bg-white/5 hover:bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-red-500/30 rounded-xl transition-all shadow-xl shadow-black/20 active:scale-95"
                >
                  <RefreshCcw className="text-[var(--text-muted)] group-hover:text-red-500 group-hover:rotate-180 transition-all duration-500" size={16} />
                  <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60 group-hover:opacity-100">Show less</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTFloorPrice;
