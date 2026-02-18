import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, RotateCcw, X } from 'lucide-react';

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

const FilterBar = ({
    selectedMarketCap,
    setSelectedMarketCap,
    marketCapOptions,
    selectedVolume,
    setSelectedVolume,
    volumeOptions,
    selectedChange,
    setSelectedChange,
    changeOptions,
    selectedPrice,
    setSelectedPrice,
    priceOptions,
    activeFilter,
    setActiveFilter,
    handleSearchClick,
    handleReset,
    globalSearch,
    setGlobalSearch
}) => {
    return (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-1">
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSearchClick}
                        className='flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#1a1c23] border border-gray-800 text-white font-bold rounded-md text-xs sm:text-sm hover:bg-[#252833] transition-colors'
                    >
                        <Search size={14} /> Search
                    </button>
                    <button
                        onClick={handleReset}
                        className='flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#1a1c23] border border-gray-800 rounded-md text-xs sm:text-sm text-gray-300 hover:bg-[#252833] transition-colors'
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            <div className="relative w-full sm:w-64">
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
    );
};

export default FilterBar;
