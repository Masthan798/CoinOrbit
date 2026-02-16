import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DerivativesData } from '../../services/AllcoinsData';
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

const Derivatives = () => {
  const [derivaties, setDervatiesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchDerivatiesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await DerivativesData();
        setDervatiesData(res);
      }
      catch (err) {
        console.error(err);
        setError("Failed to fetch derivatives data.");
      }
      finally {
        setLoading(false);
      }
    }

    fetchDerivatiesData();
  }, []) // Fetch once, then paginate locally if API doesn't support it

  // Local pagination since the service function doesn't take params
  const paginatedData = derivaties.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold'>Top Derivative Exchanges Ranked by Open Interest & Trade Volume</h1>
          <p className='text-sm text-muted'>The total derivatives volume is $398 Billion, a change in the last 24 hours. We track {derivaties.length} crypto derivative exchanges.</p>
        </div>
      </motion.div>


      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-4 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>#</th>
              <th className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>Exchange</th>
              <th className='py-4 px-4 w-[15%]'>Open Interest</th>
              <th className='py-4 px-4 w-[15%]'>24h Volume</th>
              <th className='py-4 px-4 w-[10%]'>Perpetual</th>
              <th className='py-4 px-4 w-[10%]'>Futures</th>
              <th className='py-4 px-4 w-[10%]'>Established</th>
              <th className='py-4 px-4 w-[15%]'>Country</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-0">
                  <TableSkeleton rows={10} columns={8} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="py-20 text-center text-red-500">
                  <p>{error}</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-20 text-center text-muted">No derivative exchanges found.</td>
              </tr>
            ) : (
              paginatedData.map((coin, index) => (
                <tr key={coin.id || index} className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'>
                  <td className='py-4 px-4 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main group-hover:bg-card transition-colors z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-6 h-6 rounded-full' />
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold truncate max-w-[180px]'>{coin.name}</span>
                        <span className='text-[10px] text-muted uppercase leading-none'>{coin.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className='py-4 px-4'>
                    {Number(coin.open_interest_btc).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className='py-4 px-4'>
                    {Number(coin.trade_volume_24h_btc).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className='py-4 px-4 text-center'>{coin.number_of_perpetual_pairs || 0}</td>
                  <td className='py-4 px-4 text-center'>{coin.number_of_futures_pairs || 0}</td>
                  <td className='py-4 px-4 text-muted'>{coin.year_established || "N/A"}</td>
                  <td className='py-4 px-4 truncate max-w-[150px]'>{coin.country || "-"}</td>
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
          totalItems={derivaties.length}
        />
      </motion.div>

    </motion.div>
  )
}

export default Derivatives
