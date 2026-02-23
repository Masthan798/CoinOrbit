import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DerivativesData, GlobalData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';
import { useCurrency } from '../../Context/CurrencyContext';


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
  const { currency, formatPrice } = useCurrency();
  const [derivaties, setDervatiesData] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

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

    const fetchGlobalData = async () => {
      try {
        const response = await GlobalData();
        if (response && response.data) setGlobalData(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGlobalData();
    fetchDerivatiesData();
  }, []) // Fetch once, then paginate locally if API doesn't support it

  // Local search and sorting logic
  const getSortedData = () => {
    let baseData = derivaties;

    if (activeTab === 'Top Gainers') {
      baseData = [...derivaties].sort((a, b) => (b.trade_volume_24h_btc || 0) - (a.trade_volume_24h_btc || 0));
    } else if (activeTab === 'Top Losers') {
      baseData = [...derivaties].sort((a, b) => (a.trade_volume_24h_btc || 0) - (b.trade_volume_24h_btc || 0));
    } else if (activeTab === 'New Coins') {
      baseData = [...derivaties].sort((a, b) => (b.year_established || 0) - (a.year_established || 0));
    } else if (activeTab === 'Upcoming Coins') {
      baseData = [...derivaties].sort((a, b) => (b.open_interest_btc || 0) - (a.open_interest_btc || 0));
    }

    return baseData.filter(exchange =>
      exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exchange.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredData = getSortedData();

  const paginatedData = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Exchanges', path: '/exchanges' },
            { label: 'Derivatives' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl sm:text-5xl font-bold whitespace-nowrap'>Derivative Exchanges</h1>
          <p className='text-sm sm:text-xl text-muted'>
            24h Trading Volume: <span className="text-white font-bold">{globalData ? formatPrice(globalData.total_volume[currency.code]) : '...'}</span>
          </p>
        </div>
      </motion.div>

      <TableFilterHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search exchanges..."
      />


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
                  <td className='py-3 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left text-sm text-muted font-bold'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-3 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6 rounded-sm' />
                      <div className='flex flex-col gap-0.5 min-w-0'>
                        <span className='font-bold truncate text-base sm:text-lg text-white'>{coin.name}</span>
                        <span className='text-xs sm:text-sm text-muted uppercase leading-none font-bold'>{coin.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className='py-3 px-2 text-sm sm:text-base font-bold text-gray-300'>
                    {Number(coin.open_interest_btc).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })} BTC
                  </td>
                  <td className='py-3 px-2 text-sm sm:text-base font-bold text-gray-300'>
                    {Number(coin.trade_volume_24h_btc).toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' })} BTC
                  </td>
                  <td className='py-3 px-2 text-center text-sm sm:text-base font-bold text-gray-200'>{coin.number_of_perpetual_pairs || 0}</td>
                  <td className='py-3 px-2 text-center text-sm sm:text-base font-bold text-gray-200'>{coin.number_of_futures_pairs || 0}</td>
                  <td className='py-3 px-2 text-center text-gray-300 text-sm sm:text-base font-bold'>{coin.year_established || "-"}</td>
                  <td className='py-3 px-2 truncate max-w-[100px] text-sm sm:text-base text-gray-300 font-bold'>{coin.country || "-"}</td>
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
