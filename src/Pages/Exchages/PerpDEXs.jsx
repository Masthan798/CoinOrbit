import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { PerpDerivativesData } from '../../services/AllcoinsData';
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


const PerpDEXs = () => {

  const [perpDexs, setPerpDexs] = useState([]);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchPerpDexsData = async () => {
    setloading(true);
    setError(null);
    try {
      const res = await PerpDerivativesData();
      setPerpDexs(Array.isArray(res) ? res : []);
    }
    catch (err) {
      console.error(err);
      setError("Failed to fetch perpetual DEXs data.");
    }
    finally {
      setloading(false)
    }
  }

  useEffect(() => {
    fetchPerpDexsData();
  }, []) // Fix infinite loop

  // Local pagination since the service function doesn't take params
  const paginatedData = perpDexs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-12'>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold'>Top Perpetual DEXs Exchanges Ranked by Open Interest & Trade Volume</h1>
          <p className='text-sm text-muted'>We track {perpDexs.length} perpetual derivative contracts across various exchanges.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-4 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px] text-left'>#</th>
              <th className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main z-30 w-[140px] min-w-[140px] md:w-[250px] md:min-w-[250px] text-left'>Market</th>
              <th className='py-4 px-4 w-[140px] text-center'>Contract Type</th>
              <th className='py-4 px-4 w-[140px] text-center'>Price</th>
              <th className='py-4 px-4 w-[120px] text-right'>Basis</th>
              <th className='py-4 px-4 w-[120px] text-right'>Spread</th>
              <th className='py-4 px-4 w-[150px] text-right'>Open Interest</th>
              <th className='py-4 px-4 w-[150px] text-right'>24h Volume</th>
              <th className='py-4 px-4 w-[180px] text-right'>Last Traded</th>
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
                <td colSpan="9" className="py-20 text-center text-red-500">
                  <p>{error}</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-20 text-center text-muted">No contracts found.</td>
              </tr>
            ) : (
              paginatedData.map((coin, index) => (
                <tr key={`${coin.market}-${coin.symbol}-${index}`} className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'>
                  <td className='py-4 px-4 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px] text-left'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-4 px-4 sticky left-[60px] md:left-[80px] bg-main group-hover:bg-card transition-colors z-10 w-[140px] min-w-[140px] md:w-[250px] md:min-w-[250px] text-left'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold truncate max-w-[200px]'>{coin.market}</span>
                      <span className='text-[10px] text-muted uppercase leading-none'>{coin.symbol}</span>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-center'>
                    <span className='px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold border border-green-500/20 uppercase'>
                      {coin.contract_type || "N/A"}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-center font-medium'>
                    ${Number(coin.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className={`py-4 px-4 text-right ${coin.basis < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.basis ? coin.basis.toFixed(4) : "-"}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    {coin.spread ? coin.spread.toFixed(4) : "-"}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    ${Number(coin.open_interest).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className='py-4 px-4 text-right font-medium'>
                    ${Number(coin.volume_24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className='py-4 px-4 text-right text-muted'>
                    {coin.last_traded_at ? new Date(coin.last_traded_at * 1000).toLocaleTimeString() : "-"}
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
          totalItems={perpDexs.length}
        />
      </motion.div>

    </motion.div>
  )
}

export default PerpDEXs
