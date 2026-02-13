import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const POPULAR_CURRENCIES = [
    { code: 'usd', name: 'US Dollar', symbol: '$' },
    { code: 'eur', name: 'Euro', symbol: '€' },
    { code: 'gbp', name: 'British Pound', symbol: '£' },
    { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
    { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
    { code: 'cad', name: 'Canadian Dollar', symbol: '$' },
    { code: 'aud', name: 'Australian Dollar', symbol: '$' },
    { code: 'brl', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'krw', name: 'South Korean Won', symbol: '₩' },
    { code: 'try', name: 'Turkish Lira', symbol: '₺' },
    { code: 'rub', name: 'Russian Ruble', symbol: '₽' },
];

const CurrencySelector = ({ selectedCurrency, onSelect, currencies }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Use passed currencies or fallback (though fallback shouldn't be needed if parent provides it)
    const currencyList = currencies || POPULAR_CURRENCIES;

    const selected = currencyList.find(c => c.code === selectedCurrency) || { code: selectedCurrency, name: selectedCurrency.toUpperCase() };

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
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[45px] flex items-center justify-between px-3 rounded-xl bg-card border border-gray-700 text-white hover:border-gray-500 focus:outline-none focus:border-primary transition-all"
                type="button"
            >
                <div className="flex items-center gap-2">
                    {selected.symbol && <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">{selected.symbol}</span>}
                    <span className="font-medium uppercase">{selected.code}</span>
                    <span className="text-muted text-sm truncate hidden sm:block">- {selected.name}</span>
                </div>
                <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-main border border-gray-800 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                            {currencyList.map((currency) => (
                                <div
                                    key={currency.code}
                                    onClick={() => {
                                        onSelect(currency.code);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${currency.code === selectedCurrency ? 'bg-primary/20 text-white' : 'hover:bg-card text-gray-300 hover:text-white'}`}
                                >
                                    {currency.symbol && <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white">{currency.symbol}</span>}
                                    <div className="flex flex-col">
                                        <span className="font-medium uppercase">{currency.code}</span>
                                        <span className="text-xs text-muted">{currency.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CurrencySelector;
