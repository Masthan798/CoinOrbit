import React, { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Pagination from '../../Components/Pagination/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import Toggle from '../../Components/Toggles/Toggle';


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
  const TOTAL_COINS = 14000;
  const [favorites, setFavorites] = useState([]);
  const [Allcoins, SetallCoins] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(() => {
    const saved = localStorage.getItem('marketCapHighlights');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  const totalPages = Math.ceil(TOTAL_COINS / perPage);

  const toggleFavorite = (rank) => {
    setFavorites(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    );
  };

  useEffect(() => {
    const fetchHighlights = async () => {
      setHighlightsLoading(true);
      try {
        const response = await coingeckoFetch(
          `/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
        );
        setHighlights(response);
      } catch (error) {
        console.error("Highlights Fetch Error:", error);
      } finally {
        setHighlightsLoading(false);
      }
    };
    fetchHighlights();
  }, []);

  useEffect(() => {
    const fetchAllcoins = async () => {
      setLoading(true);
      try {
        const response = await coingeckoFetch(
          `/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=${perPage}&page=${currentPage}&sparkline=true&price_change_percentage=1h,24h,7d`
        );
        SetallCoins(response)
      }
      catch (error) {
        console.log(error);
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





  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'
    >
      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>

        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl'>Cryptocurrency Prices by Market Cap</h1>
          <p className='text-s text-muted'>The global cryptocurrency market cap today is $3.16 Trillion, a 2.1% change in the last 24 hours.</p>
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
                className='grid grid-cols-1 lg:grid-cols-3 gap-8 w-full'
              >



                {/* Column 1: Stats */}
                <motion.div variants={itemVariants} className='flex flex-col gap-2 h-[210px]'>
                  <div className='flex items-center justify-between gap-4 p-3 border-gray-500 border-2 rounded-xl w-full flex-1 hover:border-green-500 transition-all duration-300 bg-card/20 min-w-0'>

                    <div className='flex flex-col min-w-0'>
                      <span className='text-xl truncate block font-bold'>
                        {highlightsLoading ? "---" : `₹${highlights.reduce((acc, coin) => acc + (coin.market_cap || 0), 0).toLocaleString()}`}
                      </span>
                      <p className='text-sm text-muted'>Total Market Cap</p>
                    </div>
                    <div className='w-24 h-16'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={highlights[0]?.sparkline_in_7d?.price?.slice(-10).map(v => ({ value: v })) || data}>
                          <Line type="monotone" dataKey="value" stroke="#16c784" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className='flex items-center justify-between gap-4 p-3 border-gray-500 border-2 rounded-xl w-full flex-1 hover:border-red-500 transition-all duration-300 bg-card/20 min-w-0'>

                    <div className='flex flex-col min-w-0'>
                      <span className='text-xl truncate block font-bold'>
                        {highlightsLoading ? "---" : `₹${highlights.reduce((acc, coin) => acc + (coin.total_volume || 0), 0).toLocaleString()}`}
                      </span>
                      <p className='text-sm text-muted'>Total 24h Volume</p>
                    </div>
                    <div className='w-24 h-16'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={highlights[1]?.sparkline_in_7d?.price?.slice(-10).map(v => ({ value: v })) || data}>
                          <Line type="monotone" dataKey="value" stroke="#ea3943" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>


                {/* Column 2: Trending */}
                <motion.div variants={itemVariants} className='flex flex-col gap-1 w-full h-[210px] p-4 border-gray-500 border-2 rounded-xl overflow-hidden bg-card/20'>
                  <div className='flex items-center justify-between border-b border-gray-500 pb-2 mb-1'>
                    <p className='text-base font-medium whitespace-nowrap lg:text-lg sm:text-sm'>🔥 Trending</p>
                    <span className='text-[10px] text-muted cursor-pointer hover:text-white transition-colors sm:text-sm lg:text-lg'>View More</span>
                  </div>

                  {highlightsLoading ? (
                    <div className="flex-1 flex items-center justify-center py-4"><div className="w-6 h-6 border-2 border-muted border-t-white rounded-full animate-spin"></div></div>
                  ) : (
                    <div className='flex flex-col justify-between flex-1 overflow-hidden py-1'>
                      {highlights.slice(0, 3).map((coin, idx) => (
                        <div key={coin.id || idx} className='flex items-center justify-between p-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-all min-w-0'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <img src={coin.image} alt="" className='w-5 h-5 rounded-full flex-shrink-0' />
                            <p className='text-sm text-muted hover:text-white truncate'>{coin.name}</p>
                          </div>
                          <div className='flex items-center gap-2 ml-1 flex-shrink-0'>
                            <span className={`text-sm font-medium ${coin.price_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {coin.price_change_percentage_24h?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Column 3: Top Gainers */}
                <motion.div variants={itemVariants} className='flex flex-col gap-1 w-full h-[210px] p-4 border-gray-500 border-2 rounded-xl overflow-hidden bg-card/20'>
                  <div className='flex items-center justify-between border-b border-gray-500 pb-2 mb-1'>
                    <p className='text-base font-medium whitespace-nowrap lg:text-lg sm:text-sm'>🚀 Top Gainers</p>
                    <span className='text-[10px] text-muted cursor-pointer hover:text-white transition-colors sm:text-sm lg:text-lg'>View More</span>
                  </div>

                  {highlightsLoading ? (
                    <div className="flex-1 flex items-center justify-center py-4"><div className="w-6 h-6 border-2 border-muted border-t-white rounded-full animate-spin"></div></div>
                  ) : (
                    <div className='flex flex-col justify-between flex-1 overflow-hidden py-1'>
                      {[...highlights]
                        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                        .slice(0, 3)
                        .map((coin, idx) => (
                          <div key={coin.id || idx} className='flex items-center justify-between p-1.5 hover:bg-white/5 rounded-lg cursor-pointer transition-all min-w-0'>
                            <div className='flex items-center gap-2 min-w-0'>
                              <img src={coin.image} alt="" className='w-5 h-5 rounded-full flex-shrink-0' />
                              <p className='text-sm text-muted hover:text-white truncate'>{coin.name}</p>
                            </div>
                            <div className='flex items-center gap-2 ml-1 flex-shrink-0'>
                              <span className='text-sm font-medium text-green-500'>
                                +{coin.price_change_percentage_24h?.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </motion.div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



      </motion.div>



      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-2 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>#</th>
              <th className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>Coin</th>
              <th className='py-4 px-2 w-[10%]'>Price</th>
              <th className='py-4 px-2 w-[8%]'>1h</th>
              <th className='py-4 px-2 w-[8%]'>24h</th>
              <th className='py-4 px-2 w-[8%]'>7d</th>
              <th className='py-4 px-2 w-[15%]'>24h Volume</th>
              <th className='py-4 px-2 w-[15%]'>Market Cap</th>
              <th className='py-4 px-2 w-[15%]'>Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-muted border-t-white rounded-full animate-spin"></div>
                    <p className="text-muted animate-pulse">Loading market data...</p>
                  </div>
                </td>
              </tr>
            ) : Allcoins.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-20 text-center text-muted">No coins found for this page.</td>
              </tr>
            ) : (
              Allcoins.map((coin, index) => (
                <tr key={coin.id || index} className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer'>
                  <td className='py-4 px-2 sticky left-0 bg-main z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>
                    <div className='flex items-center gap-2'>
                      <Star
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin.market_cap_rank);
                        }}
                        className={`w-4 h-4 cursor-pointer transition-colors ${favorites.includes(coin.market_cap_rank)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-500 hover:text-yellow-400'
                          }`}
                      />
                      <span>{coin.market_cap_rank}</span>
                    </div>
                  </td>
                  <td className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-6 h-6' />
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold truncate max-w-[180px]'>{coin.name}</span>
                        <span className='text-xs text-muted uppercase'>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-2'>₹{coin.current_price?.toLocaleString()}</td>
                  <td className={`py-4 px-2 ${coin.price_change_percentage_1h_in_currency < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_1h_in_currency?.toFixed(1)}%
                  </td>
                  <td className={`py-4 px-2 ${coin.price_change_percentage_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </td>
                  <td className={`py-4 px-2 ${coin.price_change_percentage_7d_in_currency < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.price_change_percentage_7d_in_currency?.toFixed(1)}%
                  </td>
                  <td className='py-4 px-2'>₹{coin.total_volume?.toLocaleString()}</td>
                  <td className='py-4 px-2'>₹{coin.market_cap?.toLocaleString()}</td>
                  <td className='py-4 px-2'>
                    <div className='w-28 h-10'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline_in_7d?.price?.map(p => ({ value: p })) || []}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={coin.price_change_percentage_7d_in_currency < 0 ? '#ea3943' : '#16c784'}
                            strokeWidth={2}
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