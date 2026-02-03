import React, { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { CategoriesData } from '../../services/AllcoinsData';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../Components/Pagination/Pagination';
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

const Categories = () => {
  const TOTAL_COINS = 14000;
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [toggle, setToggle] = useState(() => {
    const saved = localStorage.getItem('categoriesHighlights');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const totalPages = Math.ceil(TOTAL_COINS / perPage);
  const [error, setError] = useState(null);

  const toggleHighlights = () => {
    const newState = !toggle;
    setToggle(newState);
    localStorage.setItem('categoriesHighlights', JSON.stringify(newState));
  }


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

  const toggleFavorite = (rank) => {
    setFavorites(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    );
  };

  const paginatedCategories = categories.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );


  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>

        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl'>Cryptocurrency Prices by Market Cap</h1>
          <p className='text-s text-muted'>The global cryptocurrency market cap today is $3.16 Trillion, a 2.1% change in the last 24 hours.</p>
        </div>

        <div className='flex items-center gap-2 '>
          <Toggle isOn={toggle} handleToggle={toggleHighlights} label="Highlights" />
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


                <motion.div variants={itemVariants} className='flex flex-col gap-2 h-[210px]'>

                  <div className='flex items-center justify-between gap-4 p-4 border-gray-500 border-2 rounded-xl w-full flex-1'>
                    <div className='flex flex-col min-w-0'>
                      <span className='text-xl truncate block font-bold'>
                        ₹{categories.reduce((acc, cat) => acc + (cat.market_cap || 0), 0).toLocaleString()}
                      </span>
                      <p className='text-sm text-muted'>Categories Total Market Cap</p>
                    </div>
                    <div className='w-24 h-16'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="value" stroke="#16c784" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className='flex items-center justify-between gap-4 p-4 border-gray-500 border-2 rounded-xl w-full flex-1'>
                    <div className='flex flex-col min-w-0'>
                      <span className='text-xl truncate block font-bold'>
                        ₹{categories.reduce((acc, cat) => acc + (cat.volume_24h || 0), 0).toLocaleString()}
                      </span>
                      <p className='text-sm text-muted'>Total 24h Volume</p>
                    </div>
                    <div className='w-24 h-16'>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="value" stroke="#ea3943" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>



                <motion.div variants={itemVariants} className='flex flex-col gap-1 w-full h-[210px] p-4 border-gray-500 border-2 rounded-xl overflow-hidden'>
                  <div className='flex items-center justify-between border-b border-gray-500 p-2'>
                    <p className='text-lg font-medium sm:text-sm lg:text-lg'>🔥 Trending Categories</p>
                    <span className='text-xs text-muted cursor-pointer hover:text-white transition-colors sm:text-sm lg:text-lg'>View More</span>
                  </div>

                  <div className='flex flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:hidden'>
                    {categories.slice(0, 3).map((cat, idx) => (
                      <div key={cat.id || idx} className='flex items-center justify-between p-2 hover:bg-card hover-soft rounded-xl cursor-pointer transition-all'>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm text-muted hover:text-white'>{cat.name}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className={`text-xs ${cat.market_cap_change_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {cat.market_cap_change_24h?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className='flex flex-col gap-1 w-full h-[210px] p-4 border-gray-500 border-2 rounded-xl overflow-hidden'>
                  <div className='flex items-center justify-between border-b border-gray-500 p-2'>
                    <p className='text-lg font-medium sm:text-sm lg:text-lg'>🚀 Top Gaining Categories</p>
                    <span className='text-xs text-muted cursor-pointer hover:text-white transition-colors sm:text-sm lg:text-lg'>View More</span>
                  </div>

                  <div className='flex flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:hidden'>
                    {[...categories]
                      .sort((a, b) => b.market_cap_change_24h - a.market_cap_change_24h)
                      .slice(0, 3)
                      .map((cat, idx) => (
                        <div key={cat.id || idx} className='flex items-center justify-between p-2 hover:bg-card hover-soft rounded-xl cursor-pointer transition-all'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm text-muted hover:text-white'>{cat.name}</p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-green-500 font-medium'>
                              +{cat.market_cap_change_24h?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
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
              <th className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>Category</th>
              <th className='py-4 px-2 w-[15%]'>Top Coins</th>
              <th className='py-4 px-2 w-[8%]'>24h Change</th>
              <th className='py-4 px-2 w-[15%]'>Market Cap</th>
              <th className='py-4 px-2 w-[15%]'>24h Volume</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-muted border-t-white rounded-full animate-spin"></div>
                    <p className="text-muted animate-pulse">Loading category data...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-red-500">
                  <p>{error}</p>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-muted">No categories found.</td>
              </tr>
            ) : (
              paginatedCategories.map((coin, index) => (
                <tr key={coin.id || index} className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer'>
                  <td className='py-4 px-2 sticky left-0 bg-main z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>
                    <div className='flex items-center gap-2'>
                      <Star
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite((currentPage - 1) * perPage + index + 1);
                        }}
                        className={`w-4 h-4 cursor-pointer transition-colors ${favorites.includes((currentPage - 1) * perPage + index + 1)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-500 hover:text-yellow-400'
                          }`}
                      />
                      <span>{(currentPage - 1) * perPage + index + 1}</span>
                    </div>
                  </td>
                  <td className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                    <div className='flex items-center gap-2'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold truncate max-w-[180px]'>{coin.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className='py-4 px-2'>
                    <div className='flex items-center gap-1'>
                      {coin.top_3_coins?.map((img, i) => (
                        <img key={i} src={img} alt="" className='w-6 h-6 rounded-full' />
                      ))}
                    </div>
                  </td>

                  <td className={`py-4 px-2 ${coin.market_cap_change_24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.market_cap_change_24h?.toFixed(1)}%
                  </td>
                  <td className='py-4 px-2'>₹{coin.market_cap?.toLocaleString()}</td>
                  <td className='py-4 px-2'>₹{coin.volume_24h?.toLocaleString()}</td>
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
          totalItems={categories.length}
        />
      </motion.div>

    </motion.div>
  )
}

export default Categories