import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TableFilterHeader = ({
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    tabs = ['All', 'Top Gainers', 'Top Losers', 'New Coins', 'Upcoming Coins'],
    placeholder = "Search coins...",
    showTabs = true,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`w-full flex items-center justify-between gap-2 sm:gap-4 py-4 px-1 ${className}`}>
            {/* Left Side: Tabs / Mobile Custom Dropdown */}
            {showTabs && (
                <div className="flex items-center flex-1 min-w-0">
                    {/* Desktop Tabs */}
                    <div className="hidden sm:flex items-center gap-1 bg-main p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange && onTabChange(tab)}
                                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm sm:text-base font-black uppercase tracking-tight transition-all duration-300 ${activeTab === tab
                                    ? 'bg-card text-white border border-white/10 shadow-lg'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Custom Dropdown */}
                    <div className="relative sm:hidden w-full max-w-[150px]" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full bg-card border border-white/10 rounded-xl py-2.5 px-3 flex items-center justify-between text-sm font-black uppercase tracking-tight text-white focus:outline-none transition-all duration-300"
                        >
                            <span className="truncate">{activeTab}</span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute top-full left-0 w-full bg-main border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                >
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                onTabChange && onTabChange(tab);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm font-bold uppercase tracking-tight transition-all duration-200 border-l-2 ${activeTab === tab
                                                ? 'bg-card text-white border-white'
                                                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Right Side: Search Bar */}
            <div className="relative group w-full max-w-[180px] sm:max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={14} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    className="w-full bg-main border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm sm:text-lg text-white focus:outline-none focus:border-white/20 transition-all font-medium placeholder:text-gray-600"
                />
            </div>
        </div>
    );
};

export default TableFilterHeader;
