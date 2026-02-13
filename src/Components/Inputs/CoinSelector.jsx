import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CoinSelector = ({ selectedCoinId, onSelect, coinsList, loading }) => {
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedCoin = coinsList.find(c => c.id === selectedCoinId);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[45px] flex items-center justify-between px-3 rounded-xl bg-card border border-gray-700 text-white hover:border-gray-500 focus:outline-none focus:border-primary transition-all"
                type="button"
            >
                {selectedCoin ? (
                    <div className="flex items-center gap-3">
                        <img src={selectedCoin.image} alt={selectedCoin.name} className="w-6 h-6 rounded-full" />
                        <span className="truncate">{selectedCoin.name} <span className="text-muted text-sm uppercase">({selectedCoin.symbol})</span></span>
                    </div>
                ) : (
                    <span className="text-muted">Select a coin...</span>
                )}
                <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-main border border-gray-800 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                            {loading ? (
                                <div className="p-4 text-center text-muted text-sm">Loading coins...</div>
                            ) : (
                                coinsList.map((coin) => (
                                    <div
                                        key={coin.id}
                                        onClick={() => {
                                            onSelect(coin.id);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${coin.id === selectedCoinId ? 'bg-primary/20 text-white' : 'hover:bg-card text-gray-300 hover:text-white'}`}
                                    >
                                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{coin.name}</span>
                                            <span className="text-xs text-muted uppercase">{coin.symbol}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoinSelector;
