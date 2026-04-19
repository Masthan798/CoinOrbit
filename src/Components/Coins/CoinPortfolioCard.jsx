import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Plus, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../Context/CurrencyContext';

const CoinPortfolioCard = ({ coin, currentPrice, onAddClick }) => {
    const { currency, formatPrice } = useCurrency();
    const [isVisible, setIsVisible] = useState(true);
    const [portfolioData, setPortfolioData] = useState({ amount: 0, holdingsValue: 0 });

    // Fetch and calculate portfolio data locally
    const updateHoldings = () => {
        const saved = localStorage.getItem('userPortfolio');
        if (saved) {
            const data = JSON.parse(saved);
            const coinEntry = data.crypto?.find(c => c.id === coin.id);
            if (coinEntry) {
                const amount = coinEntry.amount || 0;
                setPortfolioData({
                    amount,
                    holdingsValue: amount * currentPrice
                });
            } else {
                setPortfolioData({ amount: 0, holdingsValue: 0 });
            }
        }
    };

    useEffect(() => {
        updateHoldings();
        
        // Listen for storage changes (e.g., from AddAssetModal)
        const handleStorageChange = (e) => {
            if (e.key === 'userPortfolio') updateHoldings();
        };
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for a custom event in case storage event doesn't fire on same page
        window.addEventListener('portfolioUpdated', updateHoldings);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('portfolioUpdated', updateHoldings);
        };
    }, [coin.id, currentPrice]);

    const formatHoldingAmount = (amt) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        }).format(amt);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 sm:p-5 border-gray-800 border-2 rounded-md bg-card/40 backdrop-blur-md flex flex-col gap-4 shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all group">
                    <span className="text-sm font-bold text-white">My Portfolio</span>
                    <ChevronDown size={14} className="text-muted group-hover:text-white transition-colors" />
                </button>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsVisible(!isVisible)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-muted hover:text-white transition-all"
                    >
                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                        onClick={onAddClick}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-muted hover:text-white transition-all"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-muted uppercase font-black tracking-widest leading-none">Holdings Value</p>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white tracking-tight">
                            {isVisible ? formatPrice(portfolioData.holdingsValue) : '••••••'}
                        </span>
                        <span className="text-xs text-muted font-bold">
                            {isVisible ? `${formatHoldingAmount(portfolioData.amount)} ${coin.symbol.toUpperCase()}` : '••••••'}
                        </span>
                    </div>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted uppercase font-black tracking-widest leading-none">Total Profit / Loss</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-xs font-bold text-green-500">+$0.00</span>
                            <span className="text-[10px] bg-green-500/10 px-1 py-0.5 rounded text-green-500 font-bold">0.0%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-muted uppercase font-black tracking-widest leading-none">Average Net Cost</span>
                        <span className="text-xs font-bold text-white">{formatPrice(0)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <button 
                        onClick={onAddClick}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-md border border-green-500/20 transition-all active:scale-[0.98]"
                    >
                        <TrendingUp size={14} />
                        Buy
                    </button>
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-md border border-red-500/20 transition-all active:scale-[0.98] opacity-50 cursor-not-allowed"
                    >
                        <TrendingDown size={14} />
                        Sell
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CoinPortfolioCard;
