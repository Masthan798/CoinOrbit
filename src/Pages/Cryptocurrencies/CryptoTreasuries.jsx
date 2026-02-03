import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TreasuriesData } from '../../services/AllcoinsData';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Pagination from '../../Components/Pagination/Pagination';

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
  }
};

const CryptoTreasuries = () => {

  const [treasuries, setTreasuries] = useState([])
  const [summary, setSummary] = useState({ total_holdings: 0, total_value_usd: 0, market_cap: 0 })
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchTreasuriesData = async () => {
      setLoading(true)
      try {
        const response = await TreasuriesData()

        const companies = response?.companies || [];

        if (companies.length > 0) {
          console.log("First company example:", companies[0]);
        }

        setTreasuries(companies);
        setSummary({
          total_holdings: response?.total_holdings || 0,
          total_value_usd: response?.total_value_usd || 0,
          market_cap: response?.market_cap_dominance || 0
        });

        // Since this response is currently for Bitcoin, we default to 'bitcoin'
        // If the service is updated to support other coins, this should be dynamic
        const coinId = 'bitcoin';
        const imageMap = await fetchCoinsImages([coinId]);
        setImages(imageMap);
      }
      catch (error) {
        console.error("Error fetching treasuries:", error);
      }
      finally {
        setLoading(false);
      }
    }
    fetchTreasuriesData();
  }, [])

  const fetchCoinsImages = async (ids) => {
    try {
      const data = await coingeckoFetch(
        `/coins/markets?vs_currency=usd&ids=${ids.join(",")}`
      );
      return Object.fromEntries(data.map((c) => [c.id, c.image]))
    }
    catch (error) {
      console.error("Error fetching coin images:", error);
      return {};
    }
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = treasuries.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold'>Crypto Treasuries</h1>
          <p className='text-sm text-muted'>Public companies that have disclosed their Bitcoin holdings.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='w-full'>
        <motion.div
          variants={containerVariants}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full'
        >
          <motion.div variants={itemVariants} className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
            <p className='text-2xl font-bold sm:text-2xl'>{treasuries.length}</p>
            <span className='text-sm text-muted'>Total Entities</span>
          </motion.div>

          <motion.div variants={itemVariants} className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
            <p className='text-2xl font-bold sm:text-2xl'>
              {[...new Set(treasuries.map(t => t.country))].length}
            </p>
            <span className='text-sm text-muted'>Countries</span>
          </motion.div>

          <motion.div variants={itemVariants} className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
            <p className='text-2xl font-bold'>
              {Number(summary.total_holdings).toLocaleString()}
            </p>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted'>Total Holdings</span>
              <span className='text-xs text-muted'>ⓘ</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
            <p className='text-2xl font-bold'>
              ${(summary.total_value_usd / 1e9).toFixed(1)}B
            </p>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted'>Total Value in USD</span>
              <span className='text-xs text-muted'>ⓘ</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
            <p className='text-2xl font-bold sm:text-2xl'>
              {summary.market_cap}
            </p>
            <span className='text-sm text-muted'>Market Cap Dominance</span>
          </motion.div>

        </motion.div>
      </motion.div>


      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-2 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>#</th>
              <th className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>Entity</th>
              <th className='py-4 px-2 w-[10%]'>Type</th>
              <th className='py-4 px-2 w-[15%]'>Top Holdings</th>
              <th className='py-4 px-2 w-[10%]'>Country</th>
              <th className='py-4 px-2 w-[15%]'>Total Holdings</th>
              <th className='py-4 px-2 w-[15%]'>Total Value</th>
              <th className='py-4 px-2 w-[15%]'>Total Current Value</th>
              <th className='py-4 px-2 w-[15%]'>Total Supply%</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-muted border-t-white rounded-full animate-spin"></div>
                    <p className="text-muted animate-pulse">Loading treasury data...</p>
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-20 text-center text-muted">No data found.</td>
              </tr>
            ) : (
              currentItems.map((entity, index) => {
                const amount = entity.total_holdings || 0;
                const percentage = entity.percentage_of_total_supply || 0;

                return (
                  <tr key={entity.id || index} className='border-b border-gray-800 hover:bg-card/10 transition-colors'>
                    <td className='py-4 px-2 sticky left-0 bg-main z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-white'>{entity.name || "Unknown"}</span>
                        <span className='text-xs text-muted uppercase'>{entity.symbol || "N/A"}</span>
                      </div>
                    </td>
                    <td className='py-4 px-2 capitalize'>
                      <p className='bg-green-500 text-white rounded-md text-center'>Company</p>
                    </td>
                    <td className='py-4 px-2 '>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1 bg-card/20 p-1 rounded-md px-2 border border-white/5'>
                          {images['bitcoin'] && (
                            <img
                              src={images['bitcoin']}
                              className='w-5 h-5 rounded-full'
                              alt="bitcoin"
                            />
                          )}
                          <span className='text-xs font-medium'>BTC</span>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-2'>{entity.country || "N/A"}</td>
                    <td className='py-4 px-2 font-medium'>
                      {Number(amount).toLocaleString()}
                    </td>
                    <td className='py-4 px-2 font-medium'>
                      ${Number(entity.total_entry_value_usd || 0).toLocaleString()}
                    </td>
                    <td className='py-4 px-2 font-medium'>
                      ${Number(entity.total_current_value_usd || 0).toLocaleString()}
                    </td>
                    <td className='py-4 px-2 text-green-500'>
                      {percentage}%
                    </td>
                  </tr>
                );
              })
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
          totalItems={treasuries.length}
        />
      </motion.div>

    </motion.div>
  )
}

export default CryptoTreasuries