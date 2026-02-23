import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { PerpDerivativesData, GlobalData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';
import { Search } from 'lucide-react';
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


const PerpDEXs = () => {
  const { currency, formatPrice } = useCurrency();
  const [perpDexs, setPerpDexs] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

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

  const fetchGlobalData = async () => {
    try {
      const response = await GlobalData();
      if (response && response.data) setGlobalData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    fetchPerpDexsData();
  }, []) // Fix infinite loop

  // Local searching and sorting
  const getSortedData = () => {
    let baseData = perpDexs;

    // Tab-based filtering/sorting logic
    if (activeTab === 'Top Gainers') {
      baseData = [...perpDexs].sort((a, b) => (b.basis || 0) - (a.basis || 0));
    } else if (activeTab === 'Top Losers') {
      baseData = [...perpDexs].sort((a, b) => (a.basis || 0) - (b.basis || 0));
    } else if (activeTab === 'New Coins') {
      baseData = [...perpDexs].sort((a, b) => (b.last_traded_at || 0) - (a.last_traded_at || 0));
    } else if (activeTab === 'Upcoming Coins') {
      baseData = [...perpDexs].sort((a, b) => (b.spread || 0) - (a.spread || 0));
    }

    return baseData.filter(dex =>
      dex.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dex.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: 'Perpetual DEXs' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl sm:text-5xl font-bold whitespace-nowrap'>Perpetual DEXs</h1>
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
        placeholder="Search markets..."
      />

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
                  <td className='py-3 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left text-sm text-muted font-bold'>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                  </td>
                  <td className='py-3 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[200px] md:min-w-[200px] text-left'>
                    <div className='flex flex-col gap-0.5 min-w-0'>
                      <span className='font-bold truncate text-base sm:text-lg text-white'>{coin.market}</span>
                      <span className='text-xs sm:text-sm text-muted uppercase leading-none font-bold'>{coin.symbol}</span>
                    </div>
                  </td>
                  <td className='py-3 px-2 text-center'>
                    <span className='px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-sm md:text-base font-bold border border-green-500/20 uppercase'>
                      {coin.contract_type || "N/A"}
                    </span>
                  </td>
                  <td className='py-3 px-2 text-center font-bold text-sm sm:text-base text-gray-200'>
                    {formatPrice(Number(coin.price), { maximumFractionDigits: 4 })}
                  </td>
                  <td className={`py-3 px-2 text-right text-sm sm:text-base font-bold ${coin.basis < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {coin.basis ? coin.basis.toFixed(4) : "-"}
                  </td>
                  <td className='py-3 px-2 text-right text-sm sm:text-base text-muted font-bold'>
                    {coin.spread ? coin.spread.toFixed(4) : "-"}
                  </td>
                  <td className='py-3 px-2 text-right font-bold text-sm sm:text-base text-gray-300'>
                    {formatPrice(Number(coin.open_interest), { notation: 'compact' })}
                  </td>
                  <td className='py-3 px-2 text-right font-bold text-sm sm:text-base text-gray-300'>
                    {formatPrice(Number(coin.volume_24h), { notation: 'compact' })}
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
