import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DerivativesData } from '../../services/AllcoinsData';
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

const Derivatives = () => {
  const [derivaties, setDervatiesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Local search and pagination
  const filteredData = derivaties.filter(exchange =>
    exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exchange.id.toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: 'Derivatives' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-1 text-left'>
          <h1 className='text-2xl sm:text-3xl font-bold'>Derivative Exchanges</h1>
          <p className='text-xs sm:text-sm text-muted'>Ranked by Open Interest & Trade Volume. Tracking {derivaties.length} exchanges.</p>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search exchanges..."
        />
      </motion.div>


      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-xl border border-gray-800/50'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left'>
                <div className="text-[10px] md:text-xs uppercase tracking-wider">#</div>
              </th>
              <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main z-30 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left'>
                <div className="text-[10px] md:text-xs uppercase tracking-wider">Exchange</div>
              </th>
              <th className='py-2 px-2 w-[15%]'><div className="text-[10px] md:text-xs uppercase tracking-wider">Open Interest</div></th>
              <th className='py-2 px-2 w-[15%]'><div className="text-[10px] md:text-xs uppercase tracking-wider">24h Vol</div></th>
              <th className='py-2 px-2 w-[10%] text-center'><div className="text-[10px] md:text-xs uppercase tracking-wider">Perp</div></th>
              <th className='py-2 px-2 w-[10%] text-center'><div className="text-[10px] md:text-xs uppercase tracking-wider">Fut</div></th>
              <th className='py-2 px-2 w-[10%] text-center'><div className="text-[10px] md:text-xs uppercase tracking-wider">Est.</div></th>
              <th className='py-2 px-2 w-[15%]'><div className="text-[10px] md:text-xs uppercase tracking-wider">Country</div></th>
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
                  <td className='py-2 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left text-xs text-muted'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6 rounded-full' />
                      <div className='flex flex-col gap-0.5 min-w-0'>
                        <span className='font-bold truncate text-[11px] sm:text-sm'>{coin.name}</span>
                        <span className='text-[9px] sm:text-[10px] text-muted uppercase leading-none'>{coin.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className='py-2 px-2 text-[11px] sm:text-xs font-mono text-muted'>
                    {Number(coin.open_interest_btc).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })} BTC
                  </td>
                  <td className='py-2 px-2 text-[11px] sm:text-xs font-mono text-muted'>
                    {Number(coin.trade_volume_24h_btc).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })} BTC
                  </td>
                  <td className='py-2 px-2 text-center text-[11px] sm:text-xs'>{coin.number_of_perpetual_pairs || 0}</td>
                  <td className='py-2 px-2 text-center text-[11px] sm:text-xs'>{coin.number_of_futures_pairs || 0}</td>
                  <td className='py-2 px-2 text-center text-muted text-[11px] sm:text-xs'>{coin.year_established || "-"}</td>
                  <td className='py-2 px-2 truncate max-w-[100px] text-[11px] sm:text-xs text-muted'>{coin.country || "-"}</td>
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

export default Derivatives
