import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AllcoinsData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { ArrowUpRight, ChevronUp, ChevronDown, Rocket, Flame, ArrowRight, ArrowLeft } from 'lucide-react';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';

// Utilities
import { formatCurrency, formatCompact, renderPriceChange } from '../../utils/formatters.jsx';

// Sub-components
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

const Allcoins = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'asc' });

  const fetchCoins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AllcoinsData(perPage, currentPage);
      if (response && Array.isArray(response)) {
        setCoins(response);
      } else {
        throw new Error("No data received from CoinGecko");
      }
    } catch (err) {
      console.error("Error fetching coins:", err);
      setError(err.message || "Failed to load cryptocurrency data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [currentPage, perPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredCoins = useMemo(() => {
    let filtered = coins;
    if (searchQuery) {
      filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? 0;
      let bVal = b[sortConfig.key] ?? 0;

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [coins, sortConfig, searchQuery]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
      : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className='w-full flex flex-col gap-4 sm:gap-6 p-2 sm:p-6 bg-main min-h-screen rounded-xl'
    >
      <Breadcrumbs
        crumbs={[
          { label: 'Tools', path: '/allcoins' },
          { label: 'All Cryptocurrencies' }
        ]}
      />

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl sm:text-3xl font-bold text-white'>All Cryptocurrencies</h1>
          <p className='text-xs sm:text-sm text-muted'>View a full list of active cryptocurrencies</p>
        </div>
        <div className='w-full md:w-72'>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search coins..."
          />
        </div>
      </div>

      <div className='w-full overflow-x-auto rounded-xl border border-gray-800/50 relative'>
        <table className='w-full min-w-[750px] md:min-w-[1100px] text-left text-sm'>
          <thead className='border-b border-gray-700 text-muted sticky top-0 bg-main z-20'>
            <tr>
              <th className='py-2 px-0 sticky left-0 bg-main z-30 w-[18px] min-w-[18px] max-w-[18px] transition-colors hover:text-white cursor-pointer select-none text-center' onClick={() => handleSort('market_cap_rank')}>
                <div className="text-[8px] md:text-xs">#</div>
              </th>
              <th className='py-2 px-0.5 md:px-2 sticky left-[18px] md:left-[60px] bg-main z-30 w-[55px] min-w-[55px] max-w-[55px] overflow-hidden transition-colors hover:text-white cursor-pointer select-none border-r border-gray-800/50' onClick={() => handleSort('name')}>
                <div className="flex items-center gap-0.5 text-[9px] md:text-xs uppercase tracking-wider">Coin <SortIcon columnKey="name" /></div>
              </th>
              <th className='py-2 px-1 w-[10%] min-w-[85px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('current_price')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">Price</span>
                  <div className="absolute right-0"><SortIcon columnKey="current_price" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[6%] min-w-[45px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_1h_in_currency')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">1h</span>
                  <div className="absolute right-0"><SortIcon columnKey="price_change_percentage_1h_in_currency" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[6%] min-w-[45px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_24h_in_currency')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">24h</span>
                  <div className="absolute right-0"><SortIcon columnKey="price_change_percentage_24h_in_currency" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[6%] min-w-[45px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_7d_in_currency')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">7d</span>
                  <div className="absolute right-0"><SortIcon columnKey="price_change_percentage_7d_in_currency" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[6%] min-w-[45px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_30d_in_currency')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">30d</span>
                  <div className="absolute right-0"><SortIcon columnKey="price_change_percentage_30d_in_currency" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[11%] min-w-[70px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_volume')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">Vol</span>
                  <div className="absolute right-0"><SortIcon columnKey="total_volume" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[11%] min-w-[70px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('circulating_supply')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">Circ</span>
                  <div className="absolute right-0"><SortIcon columnKey="circulating_supply" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[11%] min-w-[70px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_supply')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">Total</span>
                  <div className="absolute right-0"><SortIcon columnKey="total_supply" /></div>
                </div>
              </th>
              <th className='py-2 px-1 w-[11%] min-w-[70px] transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap')}>
                <div className="relative flex justify-end items-center pr-4">
                  <span className="text-[9px] md:text-xs uppercase tracking-wider">Cap</span>
                  <div className="absolute right-0"><SortIcon columnKey="market_cap" /></div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="p-0">
                  <TableSkeleton rows={10} columns={11} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="11" className="py-20 text-center text-red-500">{error}</td>
              </tr>
            ) : sortedAndFilteredCoins.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-20 text-center text-muted">No coins found for this page.</td>
              </tr>
            ) : (
              sortedAndFilteredCoins.map((coin, index) => (
                <tr
                  key={coin.id || index}
                  onClick={() => navigate(`/cryptocurrencies/marketcap/${coin.id}`)}
                  className='border-b border-gray-800 hover:bg-card transition-colors cursor-pointer group'
                >
                  <td className='py-2 px-0 sticky left-0 bg-main group-hover:bg-card transition-colors z-10 w-[18px] min-w-[18px] max-w-[18px] text-[8px] sm:text-xs text-muted text-center'>
                    {coin.market_cap_rank}
                  </td>
                  <td className='py-2 px-0.5 md:px-2 sticky left-[18px] md:left-[60px] bg-main group-hover:bg-card transition-colors z-10 w-[55px] min-w-[55px] max-w-[55px] overflow-hidden border-r border-gray-800/50'>
                    <div className='flex items-center gap-0.5 md:gap-2'>
                      <img src={coin.image} alt={coin.name} className='w-3 h-3 sm:w-6 sm:h-6 rounded-full' />
                      <div className='flex flex-col gap-0 min-w-0'>
                        <span className='font-bold truncate text-[9px] sm:text-sm text-white leading-tight block md:hidden uppercase'>{coin.symbol}</span>
                        <span className='font-bold truncate text-[9px] sm:text-sm text-white leading-tight hidden md:block'>{coin.name}</span>
                        <span className='text-[7px] sm:text-[10px] text-muted uppercase leading-none hidden md:block'>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[10%] min-w-[85px] text-[9px] sm:text-xs font-bold'>
                    <div className="flex justify-end pr-4 text-white">
                      {formatCurrency(coin.current_price)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[6%] min-w-[45px]'>
                    <div className="flex justify-end pr-4 text-[9px]">
                      {renderPriceChange(coin.price_change_percentage_1h_in_currency)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[6%] min-w-[45px]'>
                    <div className="flex justify-end pr-4 text-[9px]">
                      {renderPriceChange(coin.price_change_percentage_24h_in_currency)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[6%] min-w-[45px]'>
                    <div className="flex justify-end pr-4 text-[9px]">
                      {renderPriceChange(coin.price_change_percentage_7d_in_currency)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[6%] min-w-[45px]'>
                    <div className="flex justify-end pr-4 text-[9px]">
                      {renderPriceChange(coin.price_change_percentage_30d_in_currency)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[11%] min-w-[70px] text-muted font-mono'>
                    <div className="flex justify-end pr-4 text-[9px] sm:text-xs">
                      {formatCompact(coin.total_volume)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[11%] min-w-[70px] text-muted font-mono'>
                    <div className="flex justify-end pr-4 text-[9px] sm:text-xs">
                      {formatCompact(coin.circulating_supply)}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[11%] min-w-[70px] text-muted font-mono'>
                    <div className="flex justify-end pr-4 text-[9px] sm:text-xs">
                      {coin.total_supply ? formatCompact(coin.total_supply) : (coin.max_supply ? formatCompact(coin.max_supply) : '∞')}
                    </div>
                  </td>
                  <td className='py-2 px-1 w-[11%] min-w-[70px] text-muted font-mono'>
                    <div className="flex justify-end pr-4 text-[9px] sm:text-xs whitespace-nowrap">
                      {formatCompact(coin.market_cap)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='w-full'>
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
          totalItems={14000} // Approximate total coins
        />
      </div>
    </motion.div>
  );
};

export default Allcoins;
