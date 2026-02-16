import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import { ExchagesData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';

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

const CryptoExchanges = () => {
  const navigate = useNavigate();
  const TOTAL_EXCHANGES = 194;
  const [exchageData, setExchageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchExhageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ExchagesData(perPage, currentPage);
        if (response && Array.isArray(response)) {
          setExchageData(response);
        } else {
          throw new Error("No data received from CoinGecko");
        }
      }
      catch (error) {
        console.error("Exchange Data Fetch Error:", error);
        setError(error.message || "Failed to load exchange data");
      }
      finally {
        setLoading(false);
      }

    }
    fetchExhageData();
  }, [currentPage, perPage])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold'>Top Crypto Exchanges Ranked by Trust Score</h1>
          <p className='text-sm text-muted'>As of today, we track {TOTAL_EXCHANGES} crypto exchanges with a total 24h trading volume of $117 Billion, a -15.85% change in the last 24 hours. Currently, the 3 largest cryptocurrency exchanges are Binance, Gate, and Bybit. Total tracked crypto exchange reserves currently stands at $271 Billion.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-4 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px] text-left'>#</th>
              <th className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main z-30 w-[140px] min-w-[140px] md:w-[200px] md:min-w-[200px] text-left'>Exchange</th>
              <th className='py-4 px-4 w-[120px] text-center'>Trust Score</th>
              <th className='py-4 px-4 w-[140px] text-center'>Established</th>
              <th className='py-4 px-4 w-[150px] text-left'>Country</th>
              <th className='py-4 px-4 w-[150px] text-left'>Trading Incentives</th>
              <th className='py-4 px-4 w-[180px] text-right'>24h Volume</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-0">
                  <TableSkeleton rows={10} columns={7} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center text-red-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-white uppercase italic tracking-wider">Feed Interrupted</h3>
                      <p className="text-sm text-muted max-w-sm mx-auto">
                        {error.includes('429')
                          ? "API rate limit reached. The feed will resume automatically in a few seconds."
                          : error}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all border border-white/10 shadow-xl"
                    >
                      Refetch Data
                    </button>
                  </div>
                </td>
              </tr>
            ) : exchageData.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-20 text-center text-muted">No exchanges found.</td>
              </tr>
            ) : (
              exchageData.map((coin, index) => (
                <tr
                  key={coin.trust_score_rank || index}
                  onClick={() => navigate(`/exchanges/cryptoexchanges/${coin.id}`)}
                  className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'
                >
                  <td className='py-4 px-4 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px] text-left'>
                    <div className='flex items-center gap-2'>
                      <span>{coin.trust_score_rank}</span>
                    </div>
                  </td>
                  <td className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main group-hover:bg-card transition-colors z-10 w-[140px] min-w-[140px] md:w-[200px] md:min-w-[200px] text-left'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-6 h-6 rounded-full' />
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold truncate max-w-[150px]'>{coin.name}</span>
                        <span className='text-[10px] text-muted uppercase leading-none'>{coin.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <span className='px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold border border-green-500/20'>
                      {coin.trust_score || "N/A"}/10
                    </span>
                  </td>
                  <td className='py-4 px-4 text-center text-muted'>
                    {coin.year_established || "N/A"}
                  </td>
                  <td className='py-4 px-4 text-left truncate max-w-[150px]'>
                    {coin.country || "-"}
                  </td>
                  <td className='py-4 px-4 text-left'>
                    {coin.has_trading_incentive ?
                      <span className="text-green-500 font-medium">Yes</span> :
                      <span className="text-muted">No</span>
                    }
                  </td>
                  <td className='py-4 px-4 text-right font-medium'>
                    {coin.trade_volume_24h_btc.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "N/A"}
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
          totalItems={TOTAL_EXCHANGES}
        />
      </motion.div>

    </motion.div>
  )
}

export default CryptoExchanges