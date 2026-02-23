import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Bell, MoreHorizontal, Globe, DollarSign, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useCurrency } from '../../Context/CurrencyContext';

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    }
};

const Breadcrumbs = ({ crumbs }) => {
    const navigate = useNavigate();
    const { currency, setCurrency, currencies } = useCurrency();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [showCurrencySub, setShowCurrencySub] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMoreOpen(false);
                setShowCurrencySub(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!crumbs || crumbs.length === 0) return null;

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className='flex items-center justify-between w-full mb-4 relative'
        >
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-2xl font-bold min-w-0 max-w-[calc(100%-110px)] overflow-hidden">
                {crumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <span
                            className={`transition-colors flex items-center gap-2 truncate ${crumb.path
                                ? 'text-muted cursor-pointer hover:text-white'
                                : 'text-white font-bold cursor-default'
                                }`}
                            onClick={() => crumb.path && navigate(crumb.path)}
                            title={crumb.label}
                        >
                            {crumb.label}
                        </span>
                        {index < crumbs.length - 1 && (
                            <span className='text-muted/50 select-none flex-shrink-0'>/</span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
                {/* Fixed Icons: Desktop only */}
                <button className="hidden sm:flex p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white group">
                    <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="hidden sm:flex p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white group">
                    <Bell size={18} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* More Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setIsMoreOpen(!isMoreOpen);
                            setShowCurrencySub(false);
                        }}
                        className={`p-2 hover:bg-white/5 rounded-lg transition-colors group ${isMoreOpen ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                        <MoreHorizontal size={18} className="group-hover:scale-110 transition-transform" />
                    </button>

                    <AnimatePresence mode="wait">
                        {isMoreOpen && (
                            <motion.div
                                key={showCurrencySub ? "currency-sub" : "main-menu"}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-56 bg-card border border-soft rounded-xl shadow-2xl overflow-hidden z-[110]"
                            >
                                {showCurrencySub ? (
                                    <div className="p-2">
                                        <button
                                            onClick={() => setShowCurrencySub(false)}
                                            className="w-full flex items-center gap-2 p-2 mb-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors border-b border-soft pb-3"
                                        >
                                            <ChevronLeft size={16} />
                                            <span className="text-xs font-black uppercase tracking-widest">Select Currency</span>
                                        </button>
                                        <div className="max-h-[250px] overflow-y-auto no-scrollbar space-y-1">
                                            {currencies.map((c) => (
                                                <button
                                                    key={c.code}
                                                    onClick={() => {
                                                        setCurrency(c.code);
                                                        setIsMoreOpen(false);
                                                        setShowCurrencySub(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${currency.code === c.code ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-5 text-center font-black text-sm">{c.symbol}</span>
                                                        <div className="flex flex-col items-start leading-tight">
                                                            <span className="text-sm font-bold uppercase">{c.code}</span>
                                                            <span className="text-[10px] opacity-40 font-bold">{c.name}</span>
                                                        </div>
                                                    </div>
                                                    {currency.code === c.code && <Check size={14} className="text-emerald-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {/* Mobile Only: Share & Notifications */}
                                        <div className="sm:hidden space-y-1 mb-1 pb-1 border-b border-soft">
                                            <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <Share2 size={16} className="text-muted-foreground group-hover:text-white" />
                                                    <span className="text-sm font-bold text-muted-foreground group-hover:text-white">Share</span>
                                                </div>
                                            </button>
                                            <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <Bell size={16} className="text-muted-foreground group-hover:text-white" />
                                                    <span className="text-sm font-bold text-muted-foreground group-hover:text-white">Notifications</span>
                                                </div>
                                            </button>
                                        </div>

                                        {/* App Settings */}
                                        <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Globe size={16} className="text-muted-foreground group-hover:text-white" />
                                                <span className="text-sm font-bold text-muted-foreground group-hover:text-white">Language</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted font-bold">English</span>
                                                <ChevronRight size={14} className="text-muted/30" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setShowCurrencySub(true)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <DollarSign size={16} className="text-muted-foreground group-hover:text-white" />
                                                <span className="text-sm font-bold text-muted-foreground group-hover:text-white">Currency</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted font-bold uppercase">{currency.code}</span>
                                                <ChevronRight size={14} className="text-muted/30" />
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Breadcrumbs;
