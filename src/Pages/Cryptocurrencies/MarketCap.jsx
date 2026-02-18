import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star, Flame, Rocket, ArrowRight, ArrowUpRight } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Pagination from '../../Components/Pagination/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '../../Components/Toggles/Toggle';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import CardSkeleton from '../../Components/Loadings/CardSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import SearchBar from '../../Components/Inputs/SearchBar';


const data = [
  { value: 4000 },
  { value: 3000 },
  { value: 2000 },
  { value: 2780 },
  { value: 1890 },
  { value: 2390 },
  { value: 3490 },
];

const MarketCap = () => {
  const navigate = useNavigate();
  const TOTAL_COINS = 14000;
  const [favorites, setFavorites] = useState([]);
  const [Allcoins, SetallCoins] = useState([]);
  const [highlights, setHighlights] = useState([]); // Kept for now if other logic uses it, but main cards use new state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [toggle, setToggle] = useState(() => {
    const saved = localStorage.getItem('marketCapHighlights');
    return saved !== null ? JSON.parse(saved) : true; // Default to true if not saved
  });
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Stats State
  const [globalData, setGlobalData] = useState(null);
  const [sparklineData, setSparklineData] = useState(null);
  const [trendingData, setTrendingData] = useState([]);
  const [gainersData, setGainersData] = useState([]);

  const totalPages = Math.ceil(TOTAL_COINS / perPage);

  const toggleFavorite = (rank) => {
    setFavorites(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    );
  };

  useEffect(() => {
    const fetchGlobalStats = async () => {
      setHighlightsLoading(true);
      try {
        // 1. Fetch Global Data
        const globalJson = await coingeckoFetch('/global');
        if (globalJson?.data) setGlobalData(globalJson.data);

        // 2. Fetch 7-Day Sparkline Data (BTC Proxy)
        const sparkJson = await coingeckoFetch('/coins/bitcoin/market_chart?days=7&vs_currency=usd');
        if (sparkJson?.market_caps) {
          setSparklineData({
            market_caps: sparkJson.market_caps.map(item => item[1]),
            total_volumes: sparkJson.total_volumes.map(item => item[1]),
          });
        }

        // 3. Fetch Trending Coins
        const trendingJson = await coingeckoFetch('/search/trending');
        if (trendingJson?.coins) {
          const topTrending = trendingJson.coins.slice(0, 3);
          const ids = topTrending.map(c => c.item.id).join(',');

          // Fetch simple prices for trending coins
          const priceJson = await coingeckoFetch(`/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);

          const trendingWithPrices = topTrending.map(coin => ({
            ...coin,
            price: priceJson?.[coin.item.id]?.usd,
            change: priceJson?.[coin.item.id]?.usd_24h_change
          }));
          setTrendingData(trendingWithPrices);
        }

        // 4. Fetch Top Gainers
        const marketsJson = await coingeckoFetch('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
        if (Array.isArray(marketsJson)) {
          const sorted = [...marketsJson].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
          setGainersData(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching global stats:", err);
      } finally {
        setTimeout(() => setHighlightsLoading(false), 300);
      }
    };
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    const fetchAllcoins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await coingeckoFetch(
          `/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=${perPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,24h,7d`
        );
        if (response && Array.isArray(response)) {
          SetallCoins(response);
        } else {
          throw new Error("No data received from CoinGecko");
        }
      }
      catch (err) {
        console.error("Market Data Fetch Error:", err);
        setError(err.message || "Connection to CoinGecko failed");
      } finally {
        setLoading(false);
      }
    }
    fetchAllcoins();
  }, [currentPage, perPage])

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

  const expandVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    },
    visible: {
      height: "auto",
      opacity: 1,
      marginTop: 16,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.4 },
        staggerChildren: 0.1
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
      scale: 1.03,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const toggleHiglights = () => {
    const newState = !toggle;
    setToggle(newState);
    localStorage.setItem('marketCapHighlights', JSON.stringify(newState));
  }

  const formatCurrency = (val, maximumFractionDigits = 0) => {
    if (val === undefined || val === null) return '...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: maximumFractionDigits
    }).format(val);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCoins = () => {
    let filteredCoins = Allcoins;
    if (searchQuery) {
      filteredCoins = Allcoins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!sortConfig.key) return filteredCoins;

    return [...filteredCoins].sort((a, b) => {
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

  // Improved Sparkline Logic for Mini Charts (Internal Component)
  const Sparkline = ({ data, color, height = 40 }) => (
    <div style={{ height }} className="w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map(v => ({ value: v }))}>
          <defs>
            <linearGradient id={`gradient-${color}-mc`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color}-mc)`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className='w-full flex flex-col justify-start items-center bg-main min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-8'
    >
      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Cryptocurrencies', path: '/' },
            { label: 'Market Cap' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>

        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl sm:text-3xl font-bold'>Cryptocurrency Prices</h1>
          <p className='text-xs sm:text-s text-muted'>
            Global cap: <span className="text-white font-bold">{globalData ? formatCurrency(globalData.total_market_cap.usd) : '...'}</span>
            <span className={`ml-1 ${globalData?.market_cap_change_percentage_24h_usd >= 0 ? "text-green-500" : "text-red-500"}`}>
              {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
            </span>
          </p>
        </div>

        <div className='flex items-center gap-2 '>
          <Toggle isOn={toggle} handleToggle={toggleHiglights} label="Highlights" />
        </div>

      </motion.div>


      <motion.div variants={itemVariants} className='w-full'>
        <AnimatePresence>
          {toggle && (
            <motion.div
              variants={expandVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className='overflow-hidden'
            >
              <motion.div
                variants={containerVariants}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full'
              >
                {highlightsLoading ? (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                ) : (
                  <>
                    {/* Column 1: Stats */}
                    <div className='flex flex-col gap-2 min-h-[180px] sm:min-h-[210px]'>
                      <div className='flex items-center justify-between gap-4 p-3 border-gray-800 border-2 rounded-xl w-full flex-1 hover:border-green-500 transition-all duration-300 bg-[#0b0e11] min-w-0'>

                        <div className='flex flex-col min-w-0'>
                          <span className='text-xl truncate block font-bold text-white'>
                            {globalData ? formatCurrency(globalData.total_market_cap.usd) : '...'}
                          </span>
                          <p className='text-sm text-muted'>Total Market Cap</p>
                        </div>
                        <div className='w-24 h-16'>
                          {sparklineData?.market_caps && (
                            <Sparkline data={sparklineData.market_caps} color="#22c55e" height={60} />
                          )}
                        </div>
                      </div>

                      <div className='flex items-center justify-between gap-4 p-3 border-gray-800 border-2 rounded-xl w-full flex-1 hover:border-red-500 transition-all duration-300 bg-[#0b0e11] min-w-0'>

                        <div className='flex flex-col min-w-0'>
                          <span className='text-xl truncate block font-bold text-white'>
                            {globalData ? formatCurrency(globalData.total_volume.usd) : '...'}
                          </span>
                          <p className='text-sm text-muted'>Total 24h Volume</p>
                        </div>
                        <div className='w-24 h-16'>
                          {sparklineData?.total_volumes && (
                            <Sparkline data={sparklineData.total_volumes} color="#ef4444" height={60} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Trending Coins */}
                    <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col h-[210px] transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Flame className="text-orange-500" size={20} />
                          <h3 className="text-lg font-bold text-white">Trending</h3>
                        </div>
                        <Link to="/highlights/trending" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                          View More <ArrowRight size={12} />
                        </Link>
                      </div>

                      <div className="flex flex-col flex-1 justify-center divide-y divide-gray-800">
                        {trendingData.map((coin) => (
                          <div
                            key={coin.item.id}
                            onClick={() => navigate(`/marketcap/${coin.item.id}`)}
                            className="flex items-center justify-between p-2 hover:bg-white/5 transition-colors cursor-pointer rounded-lg px-2 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <img src={coin.item.thumb} alt={coin.item.name} className="w-5 h-5" />
                              <span className="text-sm font-medium text-gray-300">{coin.item.symbol}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{formatCurrency(coin.price, 2)}</span>
                              {coin.change !== undefined && (
                                <span className={`text-[10px] font-bold ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 3: Top Gainers */}
                    <div className="bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col h-[210px]  transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Rocket className="text-green-500" size={20} />
                          <h3 className="text-lg font-bold text-white">Top Gainers</h3>
                        </div>
                        <Link to="/highlights/gainers-losers" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                          View More <ArrowRight size={12} />
                        </Link>
                      </div>

                      <div className="flex flex-col flex-1 justify-center divide-y divide-gray-800">
                        {gainersData.map((coin) => (
                          <div
                            key={coin.id}
                            onClick={() => navigate(`/marketcap/${coin.id}`)}
                            className="flex items-center justify-between p-2 hover:bg-white/5 transition-colors cursor-pointer rounded-lg px-2 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                              <span className="text-sm font-medium text-gray-300">{coin.symbol.toUpperCase()}</span>
                            </div>
                            <span className="text-xs font-bold text-green-500">
                              +{coin.price_change_percentage_24h?.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



      </motion.div>

      <motion.div variants={itemVariants} className='w-full flex justify-end'>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search coins..."
        />
      </motion.div>



      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-xl border border-gray-800/50'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap_rank')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider"># <SortIcon columnKey="market_cap_rank" /></div>
              </th>
              <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main z-30 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Coin <SortIcon columnKey="name" /></div>
              </th>
              <th className='py-2 px-2 w-[10%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('current_price')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Price <SortIcon columnKey="current_price" /></div>
              </th>
              <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_1h_in_currency')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">1h <SortIcon columnKey="price_change_percentage_1h_in_currency" /></div>
              </th>
              <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_24h')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">24h <SortIcon columnKey="price_change_percentage_24h" /></div>
              </th>
              <th className='py-2 px-2 w-[8%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_7d_in_currency')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">7d <SortIcon columnKey="price_change_percentage_7d_in_currency" /></div>
              </th>
              <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_volume')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">24h Volume <SortIcon columnKey="total_volume" /></div>
              </th>
              <th className='py-2 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Market Cap <SortIcon columnKey="market_cap" /></div>
              </th>
              <th className='py-2 px-2 w-[15%] text-[10px] md:text-xs uppercase tracking-wider'>Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-0">
                  <TableSkeleton rows={10} columns={9} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                      <ArrowRightIcon className="text-red-500 rotate-90" size={32} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-white uppercase italic tracking-wider">Data Feed Offline</h3>
                      <p className="text-sm text-muted max-w-sm mx-auto">
                        {error.includes('429')
                          ? "Rate limit exceeded. CoinGecko has temporarily throttled requests. Please wait a minute or check your API key."
                          : error}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all border border-white/10 shadow-xl"
                    >
                      Retry Connection
                    </button>
                  </div>
                </td>
              </tr>
            ) : Allcoins.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-20 text-center text-muted">No coins found for this page.</td>
              </tr>
            ) : (
              getSortedCoins().map((coin, index) => (
                <tr
                  key={coin.id || index}
                  onClick={() => navigate(`/marketcap/${coin.id}`)}
                  className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'
                >
                  <td className='py-2 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-xs text-muted'>
                    <div className='flex items-center gap-1'>
                      <Star
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin.market_cap_rank);
                        }}
                        className={`w-3 h-3 cursor-pointer transition-colors ${favorites.includes(coin.market_cap_rank)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-500 hover:text-yellow-400'
                          }`}
                      />
                      <span>{coin.market_cap_rank}</span>
                    </div>
                  </td>
                  <td className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px]'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6' />
                      <div className='flex flex-col gap-0.5 min-w-0'>
                        <span className='font-bold truncate text-[11px] sm:text-sm'>{coin.name}</span>
                        <span className='text-[9px] sm:text-[10px] text-muted uppercase leading-none'>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-2 px-2 text-[11px] sm:text-xs font-semibold'>₹{coin.current_price?.toLocaleString()}</td>
                  <td className={`py-2 px-2 text-[11px] sm:text-xs font-bold ${coin.price_change_percentage_1h_in_currency < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_1h_in_currency?.toFixed(1)}%
                  </td>
                  <td className={`py-2 px-2 text-[11px] sm:text-xs font-bold ${coin.price_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </td>
                  <td className={`py-2 px-2 text-[11px] sm:text-xs font-bold ${coin.price_change_percentage_7d_in_currency < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_7d_in_currency?.toFixed(1)}%
                  </td>
                  <td className='py-2 px-2 text-[11px] sm:text-xs text-muted font-mono'>₹{coin.total_volume?.toLocaleString(undefined, { notation: 'compact' })}</td>
                  <td className='py-2 px-2 text-[11px] sm:text-xs text-muted font-mono'>₹{coin.market_cap?.toLocaleString(undefined, { notation: 'compact' })}</td>
                  <td className='py-2 px-2'>
                    <div className='w-20 sm:w-28 h-8 sm:h-10'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline_in_7d?.price?.map(p => ({ value: p })) || []}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={coin.price_change_percentage_7d_in_currency < 0 ? '#ea3943' : '#16c784'}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
          totalItems={TOTAL_COINS}
        />
      </motion.div>

    </motion.div >
  )
}

export default MarketCap