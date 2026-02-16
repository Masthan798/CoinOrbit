import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, RotateCcw, ArrowUpRight, ChevronUp, X } from 'lucide-react';
import { AllcoinsData } from '../../services/AllcoinsData';
import Pagination from '../../Components/Pagination/Pagination';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';

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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const FilterDropdown = ({ label, options, selectedValue, onSelect, activeFilter, setActiveFilter }) => {
  const isOpen = activeFilter === label;
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveFilter]);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setActiveFilter(isOpen ? null : label)}
        className={`flex items-center gap-2 px-3 py-1.5 bg-[#1a1c23] border ${isOpen ? 'border-blue-500 text-white' : 'border-gray-800 text-gray-300'} rounded-md text-sm hover:bg-[#252833] transition-colors`}
      >
        {label} {selectedValue !== 'All' && <span className="text-blue-500 ml-1">•</span>}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 mt-2 w-64 bg-[#1a1c23] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSelect(option);
                      setActiveFilter(null);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${selectedValue === option ? 'text-white bg-white/10 font-bold' : 'text-gray-300'
                      }`}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted text-center">No options found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Allcoins = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'asc' });

  // Filter States
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedMarketCap, setSelectedMarketCap] = useState('All');
  const [selectedVolume, setSelectedVolume] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedChange, setSelectedChange] = useState('All');
  const [globalSearch, setGlobalSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    marketCap: 'All',
    volume: 'All',
    price: 'All',
    change: 'All',
    search: ''
  });

  const marketCapOptions = ['All', '> $10B', '$1B to $10B', '$100M to $1B', '$10M to $100M', '$1M to $10M', '$100K to $1M'];
  const volumeOptions = ['All', '> $10B', '$1B to $10B', '$100M to $1B', '$10M to $100M', '$1M to $10M', '$100K to $1M'];
  const changeOptions = ['All', '> +50%', '+10% to +50%', '0% to +10%', '-10% to 0%', '-50% to -10%', '< -50%'];
  const priceOptions = ['All', '> $1K', '$100 to $1000', '$10 to $100', '$1 to $10', '$0.01 to $1', '$0.001 to $0.01'];

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

  const handleSearchClick = () => {
    setAppliedFilters({
      marketCap: selectedMarketCap,
      volume: selectedVolume,
      price: selectedPrice,
      change: selectedChange,
      search: globalSearch
    });
  };

  const handleReset = () => {
    setSelectedMarketCap('All');
    setSelectedVolume('All');
    setSelectedPrice('All');
    setSelectedChange('All');
    setGlobalSearch('');
    setAppliedFilters({
      marketCap: 'All',
      volume: 'All',
      price: 'All',
      change: 'All',
      search: ''
    });
  };

  const checkRange = (value, range) => {
    if (range === 'All') return true;
    if (!value) return false;

    if (range.startsWith('>')) {
      const threshold = parseFloat(range.replace(/[^\d.]/g, ''));
      const multiplier = range.includes('B') ? 1000000000 : (range.includes('K') ? 1000 : 1);
      return value > threshold * multiplier;
    }
    if (range.startsWith('<')) {
      const threshold = parseFloat(range.replace(/[^\d.]/g, ''));
      return value < threshold;
    }
    if (range.includes('to')) {
      let [min, max] = range.split(' to ');
      const getVal = (str) => {
        const num = parseFloat(str.replace(/[^\d.]/g, ''));
        const mult = str.includes('B') ? 1000000000 : (str.includes('M') ? 1000000 : (str.includes('K') ? 1000 : 1));
        return num * mult;
      };
      return value >= getVal(min) && value <= getVal(max);
    }
    return true;
  };

  const checkChangeRange = (value, range) => {
    if (range === 'All') return true;
    if (value === null || value === undefined) return false;

    if (range === '> +50%') return value > 50;
    if (range === '+10% to +50%') return value >= 10 && value <= 50;
    if (range === '0% to +10%') return value >= 0 && value < 10;
    if (range === '-10% to 0%') return value >= -10 && value < 0;
    if (range === '-50% to -10%') return value >= -50 && value < -10;
    if (range === '< -50%') return value < -50;
    return true;
  };

  const filteredCoins = useMemo(() => {
    return coins.filter(coin => {
      const matchesSearch = globalSearch === '' ||
        coin.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(globalSearch.toLowerCase());

      if (!matchesSearch) return false;

      // Only apply range filters if they are not 'All'
      const matchesMarketCap = checkRange(coin.market_cap, appliedFilters.marketCap);
      const matchesVolume = checkRange(coin.total_volume, appliedFilters.volume);
      const matchesPrice = checkRange(coin.current_price, appliedFilters.price);
      const matchesChange = checkChangeRange(coin.price_change_percentage_24h_in_currency, appliedFilters.change);

      return matchesMarketCap && matchesVolume && matchesPrice && matchesChange;
    });
  }, [coins, appliedFilters, globalSearch]);

  const sortedAndFilteredCoins = useMemo(() => {
    if (!sortConfig.key) return filteredCoins;

    return [...filteredCoins].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? 0;
      let bVal = b[sortConfig.key] ?? 0;

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCoins, sortConfig]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
      : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatCompact = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(val);
  };

  const renderPriceChange = (val) => {
    if (val === null || val === undefined) return <span className="text-muted">-</span>;
    const isPositive = val >= 0;
    return (
      <span className={`flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(val).toFixed(1)}%
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className='w-full flex flex-col gap-6 p-6 bg-main min-h-screen rounded-xl'
    >
      <Breadcrumbs
        crumbs={[
          { label: 'Tools', path: '/allcoins' },
          { label: 'All Cryptocurrencies' }
        ]}
      />

      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-bold text-white'>All Cryptocurrencies</h1>
        <p className='text-muted'>View a full list of active cryptocurrencies</p>
      </div>

      {/* Filter Bar */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Market Cap"
            options={marketCapOptions}
            selectedValue={selectedMarketCap}
            onSelect={setSelectedMarketCap}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          <FilterDropdown
            label="24h Volume"
            options={volumeOptions}
            selectedValue={selectedVolume}
            onSelect={setSelectedVolume}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          <FilterDropdown
            label="24h Change"
            options={changeOptions}
            selectedValue={selectedChange}
            onSelect={setSelectedChange}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          <FilterDropdown
            label="Price"
            options={priceOptions}
            selectedValue={selectedPrice}
            onSelect={setSelectedPrice}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          <button
            onClick={handleSearchClick}
            className='flex items-center gap-2 px-4 py-1.5 bg-[#1a1c23] border border-gray-800 text-white font-bold rounded-md text-sm hover:bg-[#252833] transition-colors'
          >
            <Search size={14} /> Search
          </button>
          <button
            onClick={handleReset}
            className='flex items-center gap-2 px-4 py-1.5 bg-[#1a1c23] border border-gray-800 rounded-md text-sm text-gray-300 hover:bg-[#252833] transition-colors'
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Search Box for Coins */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search coins..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#1a1c23] border border-gray-800 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className='w-full overflow-x-auto rounded-xl border border-gray-800/50 relative'>
        <table className='w-full min-w-[1200px] text-left text-sm'>
          <thead className='border-b border-gray-800 text-muted bg-[#0b0e11] sticky top-0 z-20'>
            <tr>
              <th className='py-4 px-4 w-[50px] cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('market_cap_rank')}>
                <div className='flex items-center gap-1'># <SortIcon columnKey="market_cap_rank" /></div>
              </th>
              <th className='py-4 px-4 min-w-[200px] cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('name')}>
                <div className='flex items-center gap-1'>Coin <SortIcon columnKey="name" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('current_price')}>
                <div className='flex items-center justify-end gap-1'>Price <SortIcon columnKey="current_price" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('price_change_percentage_1h_in_currency')}>
                <div className='flex items-center justify-end gap-1'>1h <SortIcon columnKey="price_change_percentage_1h_in_currency" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('price_change_percentage_24h_in_currency')}>
                <div className='flex items-center justify-end gap-1'>24h <SortIcon columnKey="price_change_percentage_24h_in_currency" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('price_change_percentage_7d_in_currency')}>
                <div className='flex items-center justify-end gap-1'>7d <SortIcon columnKey="price_change_percentage_7d_in_currency" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('price_change_percentage_30d_in_currency')}>
                <div className='flex items-center justify-end gap-1'>30d <SortIcon columnKey="price_change_percentage_30d_in_currency" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('total_volume')}>
                <div className='flex items-center justify-end gap-1'>24h Volume <SortIcon columnKey="total_volume" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('circulating_supply')}>
                <div className='flex items-center justify-end gap-1'>Circulating Supply <SortIcon columnKey="circulating_supply" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('total_supply')}>
                <div className='flex items-center justify-end gap-1'>Total Supply <SortIcon columnKey="total_supply" /></div>
              </th>
              <th className='py-4 px-4 text-right cursor-pointer hover:text-white transition-colors' onClick={() => handleSort('market_cap')}>
                <div className='flex items-center justify-end gap-1'>Market Cap <SortIcon columnKey="market_cap" /></div>
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
                <td colSpan="11" className="py-20 text-center text-muted">No coins match your filters.</td>
              </tr>
            ) : (
              sortedAndFilteredCoins.map((coin) => (
                <tr
                  key={coin.id}
                  onClick={() => navigate(`/cryptocurrencies/marketcap/${coin.id}`)}
                  className='border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group'
                >
                  <td className='py-4 px-4 text-muted'>{coin.market_cap_rank}</td>
                  <td className='py-4 px-4'>
                    <div className='flex items-center gap-3'>
                      <img src={coin.image} alt={coin.name} className='w-6 h-6 rounded-full' />
                      <div className='flex flex-col'>
                        <span className='font-bold text-white'>
                          {coin.name} <span className='text-xs text-muted uppercase ml-1'>{coin.symbol}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-right font-bold'>
                    {formatCurrency(coin.current_price)}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    {renderPriceChange(coin.price_change_percentage_1h_in_currency)}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    {renderPriceChange(coin.price_change_percentage_24h_in_currency)}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    {renderPriceChange(coin.price_change_percentage_7d_in_currency)}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    {renderPriceChange(coin.price_change_percentage_30d_in_currency)}
                  </td>
                  <td className='py-4 px-4 text-right text-gray-300'>
                    ${coin.total_volume?.toLocaleString()}
                  </td>
                  <td className='py-4 px-4 text-right text-gray-300'>
                    {coin.circulating_supply?.toLocaleString()}
                  </td>
                  <td className='py-4 px-4 text-right text-gray-300'>
                    {coin.total_supply ? formatCompact(coin.total_supply) : (coin.max_supply ? formatCompact(coin.max_supply) : '∞')}
                  </td>
                  <td className='py-4 px-4 text-right text-gray-300'>
                    ${coin.market_cap?.toLocaleString()}
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
  )
}

export default Allcoins
