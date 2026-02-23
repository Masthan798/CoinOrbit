import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ArrowUpRight } from 'lucide-react';
import { ExchagesData, GlobalData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';

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

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const CryptoExchanges = () => {
  const navigate = useNavigate();
  const TOTAL_EXCHANGES = 194;
  const [exchageData, setExchageData] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchGlobalData = async () => {
    try {
      const response = await GlobalData();
      if (response && response.data) {
        setGlobalData(response.data);
      }
    } catch (err) {
      console.error("Error fetching global data:", err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedExchanges = () => {
    let filteredExchanges = exchageData;

    // Tab-based filtering/sorting
    if (activeTab === 'Top Gainers') {
      // Map to volume if price change not available in list
      filteredExchanges = [...exchageData].sort((a, b) => b.trade_volume_24h_btc - a.trade_volume_24h_btc);
    } else if (activeTab === 'Top Losers') {
      filteredExchanges = [...exchageData].sort((a, b) => a.trade_volume_24h_btc - b.trade_volume_24h_btc);
    } else if (activeTab === 'New Coins') {
      filteredExchanges = [...exchageData].sort((a, b) => b.year_established - a.year_established);
    }

    if (searchQuery) {
      filteredExchanges = filteredExchanges.filter(exchange =>
        exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exchange.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!sortConfig.key) return filteredExchanges;

    return [...filteredExchanges].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
      : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Exchanges', path: '/exchanges' },
            { label: 'Spot Exchanges' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-2xl sm:text-5xl font-bold whitespace-nowrap'>Top Crypto Exchanges</h1>
          <p className='text-sm sm:text-xl text-muted'>
            24h Trading Volume: <span className="text-white font-bold">{globalData ? formatCurrency(globalData.total_volume.usd) : '...'}</span>
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
              <th className='py-2 px-1 sticky left-0 bg-main z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('trust_score_rank')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider"># <SortIcon columnKey="trust_score_rank" /></div>
              </th>
              <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-main z-30 w-[120px] min-w-[120px] md:w-[180px] md:min-w-[180px] text-left transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Exchange <SortIcon columnKey="name" /></div>
              </th>
              <th className='py-2 px-2 w-[100px] text-center transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('trust_score')}>
                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Trust <SortIcon columnKey="trust_score" /></div>
              </th>
              <th className='py-2 px-2 w-[120px] text-center transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('year_established')}>
                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Est. <SortIcon columnKey="year_established" /></div>
              </th>
              <th className='py-2 px-2 w-[120px] text-left transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('country')}>
                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Country <SortIcon columnKey="country" /></div>
              </th>
              <th className='py-2 px-2 w-[120px] text-left text-[10px] md:text-xs uppercase tracking-wider'>Incentives</th>
              <th className='py-2 px-2 w-[150px] text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('trade_volume_24h_btc')}>
                <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">24h Vol <SortIcon columnKey="trade_volume_24h_btc" /></div>
              </th>
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
              getSortedExchanges().map((coin, index) => (
                <tr
                  key={coin.trust_score_rank || index}
                  onClick={() => navigate(`/exchanges/cryptoexchanges/${coin.id}`)}
                  className='border-b border-gray-800 hover:bg-card hover-soft transition-colors cursor-pointer group'
                >
                  <td className='py-3 px-1 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] text-left text-sm text-muted font-bold'>
                    <span>{coin.trust_score_rank}</span>
                  </td>
                  <td className='py-3 px-2 sticky left-[45px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[120px] min-w-[120px] md:w-[180px] md:min-w-[180px] text-left'>
                    <div className='flex items-center gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6 rounded-sm' />
                      <div className='flex flex-col gap-0.5 min-w-0'>
                        <span className='font-bold truncate text-base sm:text-lg text-white'>{coin.name}</span>
                        <span className='text-xs sm:text-sm text-muted uppercase leading-none font-bold'>{coin.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-2 text-center'>
                    <span className='px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-sm md:text-base font-bold border border-green-500/20'>
                      {coin.trust_score || "0"}/10
                    </span>
                  </td>
                  <td className='py-2 px-2 text-center text-muted text-[11px] md:text-xs'>
                    {coin.year_established || "-"}
                  </td>
                  <td className='py-2 px-2 text-left truncate max-w-[100px] text-[11px] md:text-xs text-muted'>
                    {coin.country || "-"}
                  </td>
                  <td className='py-2 px-2 text-left text-[11px] md:text-xs'>
                    {coin.has_trading_incentive ?
                      <span className="text-green-500 font-medium">Yes</span> :
                      <span className="text-muted">No</span>
                    }
                  </td>
                  <td className='py-2 px-2 text-right font-medium text-[11px] md:text-xs tabular-nums text-muted'>
                    {coin.trade_volume_24h_btc?.toLocaleString(undefined, { maximumFractionDigits: 0, notation: 'compact' }) || "0"} BTC
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