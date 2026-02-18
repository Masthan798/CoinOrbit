import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { PerpDerivativesData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import SearchBar from '../../Components/Inputs/SearchBar';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Local search and pagination
  const filteredData = perpDexs.filter(dex =>
    dex.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dex.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Exchanges', path: '/' },
            { label: 'Perpetual DEXs' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-1 text-left'>
          <h1 className='text-2xl sm:text-3xl font-bold'>Perpetual DEXs</h1>
          <p className='text-xs sm:text-sm text-muted'>Ranked by Open Interest & Trade Volume. Tracking {perpDexs.length} contracts.</p>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search markets..."
        />
      </motion.div>

      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-xl border border-gray-800/50'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left transition-colors hover:text-white'>
                <div className="text-[10px] md:text-xs uppercase tracking-wider">#</div>
              </th>
              <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main z-30 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left transition-colors hover:text-white'>
                <div className="text-[10px] md:text-xs uppercase tracking-wider">Market</div>
              </th>
              <th className='py-2 px-2 w-[120px] text-center transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Type</div></th>
              <th className='py-2 px-2 w-[120px] text-center transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Price</div></th>
              <th className='py-2 px-2 w-[100px] text-right transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Basis</div></th>
              <th className='py-2 px-2 w-[100px] text-right transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Spread</div></th>
              <th className='py-2 px-2 w-[130px] text-right transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Open Int</div></th>
              <th className='py-2 px-2 w-[130px] text-right transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">24h Vol</div></th>
              <th className='py-2 px-2 w-[150px] text-right transition-colors hover:text-white'><div className="text-[10px] md:text-xs uppercase tracking-wider">Updated</div></th>
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
                  <td className='py-2 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left text-xs text-muted'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left'>
                    <div className='flex flex-col gap-0.5 min-w-0'>
                      <span className='font-bold truncate text-[11px] sm:text-sm'>{coin.market}</span>
                      <span className='text-[9px] sm:text-[10px] text-muted uppercase leading-none'>{coin.symbol}</span>
                    </div>
                  </td>
                  <td className='py-2 px-2 text-center'>
                    <span className='px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] md:text-xs font-bold border border-green-500/20 uppercase'>
                      {coin.contract_type || "N/A"}
                    </span>
                  </td>
                  <td className='py-2 px-2 text-center font-medium text-[11px] sm:text-xs'>
                    ${Number(coin.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                  <td className={`py-2 px-2 text-right text-[11px] sm:text-xs ${coin.basis < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.basis ? coin.basis.toFixed(4) : "-"}
                  </td>
                  <td className='py-2 px-2 text-right text-[11px] sm:text-xs text-muted'>
                    {coin.spread ? coin.spread.toFixed(4) : "-"}
                  </td>
                  <td className='py-2 px-2 text-right text-[11px] sm:text-xs font-mono text-muted'>
                    ${Number(coin.open_interest).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })}
                  </td>
                  <td className='py-2 px-2 text-right font-medium text-[11px] sm:text-xs font-mono text-muted'>
                    ${Number(coin.volume_24h).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })}
                  </td>
                  <td className='py-2 px-2 text-right text-muted text-[10px] sm:text-[11px]'>
                    {coin.last_traded_at ? new Date(coin.last_traded_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
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
          totalItems={filteredData.length}
        />
      </motion.div>

    </motion.div>
  )
}

export default PerpDEXs
