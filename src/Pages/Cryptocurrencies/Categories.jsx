import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star, Flame, Rocket, TrendingUp, TrendingDown, Eye, Lock, Zap, ArrowUpRight, Search } from 'lucide-react';
import { CategoriesData, TrendingCoinsData, AllcoinsData, GlobalData } from '../../services/AllcoinsData';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../Components/Pagination/Pagination';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';
import { useCurrency } from '../../Context/CurrencyContext';

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
  const { currency, formatPrice } = useCurrency();
  const TOTAL_COINS = 14000;
  // Tabs: 'all' | 'highlights'
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const response = await GlobalData();
        if (response && response.data) setGlobalData(response.data);
      } catch (err) {
        console.error("Global Data Error:", err);
      }
    };

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
    fetchGlobalData();
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
    let filteredCategories = categories;
    if (searchQuery) {
      filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!sortConfig.key) return filteredCategories;

    return [...filteredCategories].sort((a, b) => {
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

  const sortedCategoriesList = getSortedCategories();
  const paginatedCategories = sortedCategoriesList.slice(
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
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          <span onClick={() => navigate(moreLink)} className="text-sm text-muted hover:text-white cursor-pointer transition-colors select-none">more &gt;</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm text-muted pb-2 border-b border-gray-800/50">
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
                <img src={coin.image || coin.thumb || coin.item?.thumb} alt={coin.name || coin.item?.name} className="w-5 h-5 rounded-sm" />
                <span className="text-lg font-medium text-gray-200 group-hover:text-white truncate max-w-[100px]">
                  {coin.symbol?.toUpperCase() || coin.item?.symbol}
                </span>
              </div>
              <div className="flex gap-4 text-lg">
                <span className="text-gray-300">
                  {type === 'volume'
                    ? formatPrice(coin.total_volume || 0, { notation: "compact" })
                    : (coin.current_price || coin.item?.data?.price)
                      ? formatPrice(coin.current_price || coin.item?.data?.price)
                      : 'N/A'
                  }
                </span>
                {type !== 'volume' && (
                  <span className={`w-14 text-right text-sm ${(coin.price_change_percentage_24h || coin.item?.data?.price_change_percentage_24h?.usd) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-4 sm:gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Cryptocurrencies', path: '/' },
            { label: 'Categories' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl sm:text-5xl font-bold whitespace-nowrap'>Top Crypto Categories</h1>
          <p className='text-sm sm:text-xl text-muted'>
            Global cap: <span className="text-white font-bold">{globalData ? formatPrice(globalData.total_market_cap[currency.code]) : '...'}</span>
            <span className={`ml-1 ${globalData?.market_cap_change_percentage_24h_usd >= 0 ? "text-green-500" : "text-red-500"}`}>
              {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
            </span>
          </p>
        </div>
      </motion.div>

      <TableFilterHeader
        activeTab={activeTab === 'all' ? 'All' : 'Highlights'}
        onTabChange={(tab) => {
          if (tab === 'All') setActiveTab('all');
          else if (tab === 'Highlights') setActiveTab('highlights');
          setCurrentPage(1);
          setSearchQuery('');
        }}
        tabs={['All', 'Highlights']}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search..."
      />

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
                  moreLink="/highlights/trending"
                />
                <HighlightCard
                  title="Top Gainers"
                  icon={<TrendingUp size={18} className="text-green-500" />}
                  data={topGainers}
                  moreLink="/highlights/top-gainers"
                />
                <HighlightCard
                  title="Top Losers"
                  icon={<TrendingDown size={18} className="text-red-500" />}
                  data={topLosers}
                  moreLink="/highlights/top-losers"
                />
                <HighlightCard
                  title="New Coins"
                  icon={<Star size={18} className="text-yellow-500" />}
                  // Mocking 'New Coins' using trending data for now as strictly new coins api is cleaner in paid plans
                  data={trendingCoins.slice(5, 15)}
                  moreLink="/highlights/new-coins"
                />
                <HighlightCard
                  title="Highest Volume"
                  icon={<Zap size={18} className="text-blue-500" />}
                  type="volume"
                  data={highestVolume}
                  moreLink="/highlights/highest-volume"
                />
                <HighlightCard
                  title="Price Change since ATH"
                  icon={<Rocket size={18} className="text-purple-500" />}
                  data={athChange}
                  moreLink="/highlights/ath-change"
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
            <div className='w-full overflow-x-auto min-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-xl border border-white/5'>
              <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
                <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
                  <tr>
                    <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-[10px] md:text-xs uppercase tracking-wider'>#</th>
                    <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main z-30 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] transition-colors hover:text-white cursor-pointer select-none text-[10px] md:text-xs uppercase tracking-wider' onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Category <SortIcon columnKey="name" /></div>
                    </th>
                    <th className='py-2 px-2 text-[10px] md:text-xs uppercase tracking-wider'>Top Coins</th>
                    <th className='py-2 px-2 transition-colors hover:text-white cursor-pointer select-none text-[10px] md:text-xs uppercase tracking-wider' onClick={() => handleSort('market_cap_change_24h')}>
                      <div className="flex items-center gap-1 whitespace-nowrap">24h Change <SortIcon columnKey="market_cap_change_24h" /></div>
                    </th>
                    <th className='py-2 px-2 transition-colors hover:text-white cursor-pointer select-none text-[10px] md:text-xs uppercase tracking-wider' onClick={() => handleSort('market_cap')}>
                      <div className="flex items-center gap-1 whitespace-nowrap">Market Cap <SortIcon columnKey="market_cap" /></div>
                    </th>
                    <th className='py-2 px-2 transition-colors hover:text-white cursor-pointer select-none text-[10px] md:text-xs uppercase tracking-wider' onClick={() => handleSort('volume_24h')}>
                      <div className="flex items-center gap-1 whitespace-nowrap">24h Vol <SortIcon columnKey="volume_24h" /></div>
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
                        <td className='py-3 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 text-sm text-muted'>
                          <div className='flex items-center gap-1'>
                            <Star
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite((currentPage - 1) * perPage + index + 1);
                              }}
                              className={`w-3.5 h-3.5 cursor-pointer transition-colors ${favorites.includes((currentPage - 1) * perPage + index + 1)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted hover:text-yellow-400'
                                }`}
                            />
                            <span>{(currentPage - 1) * perPage + index + 1}</span>
                          </div>
                        </td>
                        <td className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10'>
                          <span className='font-bold truncate block max-w-[110px] sm:max-w-[180px] text-sm sm:text-lg'>{coin.name}</span>
                        </td>
                        <td className='py-2 px-2'>
                          <div className='flex items-center -space-x-1 sm:-space-x-2'>
                            {coin.top_3_coins?.map((img, i) => (
                              <img key={i} src={img} alt="" className='w-5 h-5 sm:w-6 sm:h-6 rounded-sm border border-gray-900' />
                            ))}
                          </div>
                        </td>
                        <td className={`py-3 px-2 text-sm sm:text-base font-bold ${coin.market_cap_change_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {coin.market_cap_change_24h?.toFixed(1)}%
                        </td>
                        <td className='py-3 px-2 text-sm sm:text-base font-bold text-gray-300'>{formatPrice(coin.market_cap, { notation: 'compact' })}</td>
                        <td className='py-3 px-2 text-sm sm:text-base font-bold text-gray-300'>{formatPrice(coin.volume_24h, { notation: 'compact' })}</td>
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
                totalItems={sortedCategoriesList.length}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

export default Categories