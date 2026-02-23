import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ArrowUpRight } from 'lucide-react';
import { TreasuriesData } from '../../services/AllcoinsData';
import { coingeckoFetch } from '../../api/coingeckoClient';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import StatsCardSkeleton from '../../Components/Loadings/StatsCardSkeleton';
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

const CryptoTreasuries = () => {

  const [treasuries, setTreasuries] = useState([])
  const [summary, setSummary] = useState({ total_holdings: 0, total_value_usd: 0, market_cap: 0 })
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTreasuries = () => {
    let filteredTreasuries = treasuries;

    // Tab-based filtering/sorting logic
    if (activeTab === 'Top Gainers') {
      filteredTreasuries = [...treasuries].sort((a, b) => (b.total_current_value_usd || 0) - (a.total_current_value_usd || 0));
    } else if (activeTab === 'Top Losers') {
      filteredTreasuries = [...treasuries].sort((a, b) => (a.total_current_value_usd || 0) - (b.total_current_value_usd || 0));
    } else if (activeTab === 'New Coins') {
      filteredTreasuries = [...treasuries].sort((a, b) => (b.total_holdings || 0) - (a.total_holdings || 0));
    }

    if (searchQuery) {
      filteredTreasuries = filteredTreasuries.filter(entity =>
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!sortConfig.key) return filteredTreasuries;

    return [...filteredTreasuries].sort((a, b) => {
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

  // Pagination Logic
  const indexOfLastItem = currentPage * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const sortedTreasuriesList = getSortedTreasuries();
  const currentItems = sortedTreasuriesList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className='w-full flex flex-col justify-start items-center bg-main min-h-full p-4 pb-8 rounded-xl gap-8'>

      <div className='w-full'>
        <Breadcrumbs
          crumbs={[
            { label: 'Cryptocurrencies', path: '/' },
            { label: 'Treasuries' }
          ]}
        />
      </div>

      <motion.div variants={itemVariants} className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        {loading ? (
          Array(5).fill(0).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))
        ) : (
          <>
            <div className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
              <p className='text-2xl font-bold sm:text-3xl text-white'>
                {treasuries.length || 0}
              </p>
              <span className='text-sm text-muted'>Total Entities</span>
            </div>

            <div className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
              <p className='text-2xl font-bold sm:text-3xl text-white'>
                {[...new Set(treasuries.filter(t => t.country).map(t => t.country))].length}
              </p>
              <span className='text-sm text-muted'>Countries</span>
            </div>

            <div className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
              <p className='text-2xl font-bold sm:text-3xl text-white'>
                {Number(summary.total_holdings || 0).toLocaleString()}
              </p>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted'>Total Holdings</span>
                <span className='text-xs text-muted'>ⓘ</span>
              </div>
            </div>

            <div className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
              <p className='text-2xl font-bold sm:text-3xl text-white'>
                ${(Number(summary.total_value_usd || 0) / 1e9).toFixed(1)}B
              </p>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted'>Total Value in USD</span>
                <span className='text-xs text-muted'>ⓘ</span>
              </div>
            </div>

            <div className='flex flex-col gap-2 justify-center items-start p-6 border-gray-700 border rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300'>
              <p className='text-2xl font-bold sm:text-3xl text-white'>
                {summary.market_cap || "0"}%
              </p>
              <span className='text-sm text-muted'>Market Cap Dominance</span>
            </div>
          </>
        )}
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
        placeholder="Search entities..."
      />


      <motion.div variants={itemVariants} className='w-full overflow-x-auto h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative'>
        <table className='w-full min-w-[900px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-4 px-2 sticky left-0 bg-main z-30 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px]'>#</th>
              <th className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main z-30 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Entity <SortIcon columnKey="name" /></div>
              </th>
              <th className='py-4 px-2 w-[10%]'>Type</th>
              <th className='py-4 px-2 w-[15%]'>Top Holdings</th>
              <th className='py-4 px-2 w-[10%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('country')}>
                <div className="flex items-center gap-1">Country <SortIcon columnKey="country" /></div>
              </th>
              <th className='py-4 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_holdings')}>
                <div className="flex items-center gap-1">Total Holdings <SortIcon columnKey="total_holdings" /></div>
              </th>
              <th className='py-4 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_entry_value_usd')}>
                <div className="flex items-center gap-1">Total Value <SortIcon columnKey="total_entry_value_usd" /></div>
              </th>
              <th className='py-4 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_current_value_usd')}>
                <div className="flex items-center gap-1">Total Current Value <SortIcon columnKey="total_current_value_usd" /></div>
              </th>
              <th className='py-4 px-2 w-[15%] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('percentage_of_total_supply')}>
                <div className="flex items-center gap-1">Total Supply% <SortIcon columnKey="percentage_of_total_supply" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-0">
                  <TableSkeleton rows={10} columns={9} />
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
                  <tr key={entity.id || index} className='border-b border-gray-800 hover:bg-card transition-colors group'>
                    <td className='py-5 px-2 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[60px] min-w-[60px] md:w-[80px] md:min-w-[80px] text-sm md:text-base font-bold text-muted'>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className='py-4 px-2 sticky left-[60px] md:left-[80px] bg-main group-hover:bg-card transition-colors z-10 w-[160px] min-w-[160px] md:w-[250px] md:min-w-[250px]'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-base md:text-xl text-white'>{entity.name || "Unknown"}</span>
                        <span className='text-xs md:text-sm text-muted uppercase font-bold'>{entity.symbol || "N/A"}</span>
                      </div>
                    </td>
                    <td className='py-5 px-2 capitalize'>
                      <p className='bg-green-500 text-white rounded-md text-center py-1 font-bold text-xs md:text-sm'>Company</p>
                    </td>
                    <td className='py-4 px-2 '>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1 bg-card/20 p-1 rounded-md px-2 border border-white/5'>
                          {images['bitcoin'] && (
                            <img
                              src={images['bitcoin']}
                              className='w-5 h-5 rounded-sm'
                              alt="bitcoin"
                            />
                          )}
                          <span className='text-xs font-medium'>BTC</span>
                        </div>
                      </div>
                    </td>
                    <td className='py-5 px-2 font-bold text-sm md:text-base text-gray-300'>{entity.country || "N/A"}</td>
                    <td className='py-5 px-2 font-bold text-sm md:text-base text-gray-300'>
                      {Number(amount).toLocaleString()}
                    </td>
                    <td className='py-5 px-2 font-bold text-sm md:text-base text-gray-300'>
                      ${Number(entity.total_entry_value_usd || 0).toLocaleString()}
                    </td>
                    <td className='py-5 px-2 font-bold text-sm md:text-base text-gray-300'>
                      ${Number(entity.total_current_value_usd || 0).toLocaleString()}
                    </td>
                    <td className='py-5 px-2 text-green-500 font-bold text-sm md:text-base'>
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
          totalItems={sortedTreasuriesList.length}
        />
      </motion.div>

    </motion.div >
  )
}

export default CryptoTreasuries