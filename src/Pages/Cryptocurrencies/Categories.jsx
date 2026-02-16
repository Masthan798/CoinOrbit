import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star, Flame, Rocket, TrendingUp, TrendingDown, Eye, Lock, Zap, ArrowUpRight } from 'lucide-react';
import { CategoriesData, TrendingCoinsData, AllcoinsData } from '../../services/AllcoinsData';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../Components/Pagination/Pagination';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';

// Animation variants
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
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const Categories = () => {
  const TOTAL_COINS = 14000;
  // Tabs: 'all' | 'highlights'
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState([]);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await CategoriesData();
        setCategories(response);
      }
      catch (error) {
        console.error("CoinOrbit API Error:", error);
        setError("Failed to load categories. Please check your API key and connection.");
      }
      finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [])

  // Fetch Highlights Data when tab changes
  useEffect(() => {
    if (activeTab === 'highlights' && trendingCoins.length === 0) {
      const fetchHighlights = async () => {
        setHighlightsLoading(true);
        try {
          const [trendingRes, marketRes] = await Promise.all([
            TrendingCoinsData(),
            AllcoinsData() // Fetch top 200 for gainers/losers/volume
          ]);
          setTrendingCoins(trendingRes.coins || []);
          setMarketData(marketRes || []);
        } catch (err) {
          console.error("Error fetching highlights:", err);
        } finally {
          setHighlightsLoading(false);
        }
      };
      fetchHighlights();
    }
  }, [activeTab]);


  const toggleFavorite = (rank) => {
    setFavorites(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCategories = () => {
    if (!sortConfig.key) return categories;

    return [...categories].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

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

  const paginatedCategories = getSortedCategories().slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Deriving Stats for Highlights
  const topGainers = [...marketData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 10);
  const topLosers = [...marketData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 10);
  const highestVolume = [...marketData].sort((a, b) => b.total_volume - a.total_volume).slice(0, 10);
  const athChange = [...marketData].sort((a, b) => a.ath_change_percentage - b.ath_change_percentage).slice(0, 10); // Closest to ATH usually means close to 0 (negative)

  // Card Component for Highlights
  const HighlightCard = ({ title, icon, data, type = 'price', moreLink }) => {
    const navigate = useNavigate();
    return (
      <div className="bg-[#0d0e12] border border-gray-800 rounded-xl p-5 flex flex-col h-full hover:border-gray-700 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-md font-bold text-white">{title}</h3>
          </div>
          <span onClick={() => navigate(moreLink)} className="text-xs text-muted hover:text-white cursor-pointer transition-colors select-none">more &gt;</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-xs text-muted pb-2 border-b border-gray-800/50">
            <span>Coin</span>
            <div className="flex gap-4">
              <span>{type === 'volume' ? 'Volume' : 'Price'}</span>
              <span>{type === 'volume' ? '' : '24h'}</span>
            </div>
          </div>
          {data.map((coin, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/cryptocurrencies/marketcap/${coin.id || coin.item?.id}`)}
              className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-1 rounded"
            >
              <div className="flex items-center gap-2">
                <img src={coin.image || coin.thumb || coin.item?.thumb} alt={coin.name || coin.item?.name} className="w-5 h-5 rounded-full" />
                <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate max-w-[100px]">
                  {coin.symbol?.toUpperCase() || coin.item?.symbol}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-300">
                  {type === 'volume'
                    ? `$${(coin.total_volume || 0).toLocaleString(undefined, { notation: "compact" })}`
                    : (coin.current_price || coin.item?.data?.price)
                      ? `$${(coin.current_price || coin.item?.data?.price).toLocaleString()}`
                      : 'N/A'
                  }
                </span>
                {type !== 'volume' && (
                  <span className={`w-12 text-right ${(coin.price_change_percentage_24h || coin.item?.data?.price_change_percentage_24h?.usd) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(coin.price_change_percentage_24h || coin.item?.data?.price_change_percentage_24h?.usd || 0).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Cryptocurrencies', path: '/' },
            { label: 'Highlights' }
          ]}
        />
      </div>

      {/* Header & Tabs */}
      <motion.div variants={itemVariants} className='w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold'>Crypto Highlights</h1>
          <p className='text-sm text-muted'>Which cryptocurrencies are people more interested in? Track and discover the most interesting cryptocurrencies.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#0d0e12] p-1 rounded-lg border border-gray-800">
          {['all', 'highlights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-muted hover:text-white'
                } capitalize`}
            >
              {tab}
            </button>
          ))}
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted hover:text-white border-l border-gray-800 ml-2">
            Customize
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode='wait'>
        {activeTab === 'highlights' ? (
          <motion.div
            key="highlights"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {highlightsLoading ? (
              Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <HighlightCard
                  title="Trending Coins"
                  icon={<Flame size={18} className="text-orange-500" />}
                  data={trendingCoins.slice(0, 10)}
                  moreLink="/cryptocurrencies/highlights/trending"
                />
                <HighlightCard
                  title="Top Gainers"
                  icon={<TrendingUp size={18} className="text-green-500" />}
                  data={topGainers}
                  moreLink="/cryptocurrencies/highlights/top-gainers"
                />
                <HighlightCard
                  title="Top Losers"
                  icon={<TrendingDown size={18} className="text-red-500" />}
                  data={topLosers}
                  moreLink="/cryptocurrencies/highlights/top-losers"
                />
                <HighlightCard
                  title="New Coins"
                  icon={<Star size={18} className="text-yellow-500" />}
                  // Mocking 'New Coins' using trending data for now as strictly new coins api is cleaner in paid plans
                  data={trendingCoins.slice(5, 15)}
                  moreLink="/cryptocurrencies/highlights/new-coins"
                />
                <HighlightCard
                  title="Highest Volume"
                  icon={<Zap size={18} className="text-blue-500" />}
                  type="volume"
                  data={highestVolume}
                  moreLink="/cryptocurrencies/highlights/highest-volume"
                />
                <HighlightCard
                  title="Price Change since ATH"
                  icon={<Rocket size={18} className="text-purple-500" />}
                  data={athChange}
                  moreLink="/cryptocurrencies/highlights/ath-change"
                />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="all"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className='w-full'
          >
            <div className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-xl border border-gray-800/50'>
              <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
                <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
                  <tr>
                    <th className='py-4 px-4 sticky left-0 bg-main z-30 w-[60px] min-w-[60px]'>#</th>
                    <th className='py-4 px-4 sticky left-[60px] bg-main z-30 w-[200px] min-w-[200px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Category <SortIcon columnKey="name" /></div>
                    </th>
                    <th className='py-4 px-4'>Top Coins</th>
                    <th className='py-4 px-4 transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap_change_24h')}>
                      <div className="flex items-center gap-1">24h Change <SortIcon columnKey="market_cap_change_24h" /></div>
                    </th>
                    <th className='py-4 px-4 transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap')}>
                      <div className="flex items-center gap-1">Market Cap <SortIcon columnKey="market_cap" /></div>
                    </th>
                    <th className='py-4 px-4 transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('volume_24h')}>
                      <div className="flex items-center gap-1">24h Volume <SortIcon columnKey="volume_24h" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="p-0"><TableSkeleton rows={10} columns={6} /></td></tr>
                  ) : error ? (
                    <tr><td colSpan="6" className="py-20 text-center text-red-500">{error}</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan="6" className="py-20 text-center text-muted">No categories found.</td></tr>
                  ) : (
                    paginatedCategories.map((coin, index) => (
                      <tr key={coin.id || index} className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'>
                        <td className='py-4 px-4 sticky left-0 bg-main group-hover:bg-card transition-colors z-10'>
                          <div className='flex items-center gap-2'>
                            <Star
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite((currentPage - 1) * perPage + index + 1);
                              }}
                              className={`w-4 h-4 cursor-pointer transition-colors ${favorites.includes((currentPage - 1) * perPage + index + 1)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted hover:text-yellow-400'
                                }`}
                            />
                            <span>{(currentPage - 1) * perPage + index + 1}</span>
                          </div>
                        </td>
                        <td className='py-4 px-4 sticky left-[60px] bg-main group-hover:bg-card transition-colors z-10'>
                          <span className='font-bold truncate block max-w-[180px]'>{coin.name}</span>
                        </td>
                        <td className='py-4 px-4'>
                          <div className='flex items-center -space-x-2'>
                            {coin.top_3_coins?.map((img, i) => (
                              <img key={i} src={img} alt="" className='w-6 h-6 rounded-full border border-gray-900' />
                            ))}
                          </div>
                        </td>
                        <td className={`py-4 px-4 ${coin.market_cap_change_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {coin.market_cap_change_24h?.toFixed(2)}%
                        </td>
                        <td className='py-4 px-4'>₹{coin.market_cap?.toLocaleString()}</td>
                        <td className='py-4 px-4'>₹{coin.volume_24h?.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="w-full mt-4">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                perPage={perPage}
                setPerPage={setPerPage}
                totalItems={categories.length}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

export default Categories