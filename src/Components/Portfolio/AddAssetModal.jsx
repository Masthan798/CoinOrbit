 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Loader2, Wallet, Image as ImageIcon, Sparkles, ChevronRight } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';

const AddAssetModal = ({ isOpen, onClose, onAdd, type = 'crypto' }) => {
    const [activeTab, setActiveTab] = useState(type);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(type);
            setSearch('');
            setSelectedAsset(null);
            setAmount('');
        }
    }, [isOpen, type]);

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await coingeckoFetch(`/search?query=${search}`);
                if (activeTab === 'crypto') {
                    setResults(data.coins.slice(0, 5));
                } else {
                    setResults(data.nfts.slice(0, 5));
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, activeTab]);

    const handleAdd = () => {
        if (!selectedAsset || !amount) return;
        onAdd({
            ...selectedAsset,
            amount: parseFloat(amount),
            type: activeTab
        });
        setSearch('');
        setSelectedAsset(null);
        setAmount('');
        onClose();
    };

    if (!isOpen) return null;

    const themeColor = 'white';
    const accentColor = '#ffffff';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-[#0a0a0a] border border-white/10 rounded-md w-full max-w-md overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative"
                >
                    {/* Background glow */}
                    <div 
                        className="absolute -top-24 -right-24 w-48 h-48 blur-[100px] opacity-20 pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: accentColor }}
                    />
                    <div 
                        className="absolute -bottom-24 -left-24 w-48 h-48 blur-[100px] opacity-10 pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: accentColor }}
                    />

                    <div className="p-8 pb-4 flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                New Asset
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                            </h2>
                            <p className="text-[10px] text-muted uppercase font-bold tracking-[0.2em] opacity-50">Expand your portfolio</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md transition-all active:scale-95 group"
                        >
                            <X className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    <div className="px-8 flex flex-col gap-6 relative z-10">
                        {/* Tab Switcher */}
                        {!selectedAsset && (
                            <div className="p-1 bg-white/5 border border-white/10 rounded-md flex relative overflow-hidden">
                                <motion.div 
                                    className="absolute inset-y-1 rounded-md bg-gradient-to-r shadow-lg z-0"
                                    initial={false}
                                    animate={{ 
                                        x: activeTab === 'crypto' ? '0%' : '100%',
                                        width: '50%'
                                    }}
                                    style={{ 
                                        backgroundImage: 'linear-gradient(to right, #ffffff, #a1a1a1)'
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                                <button 
                                    onClick={() => { setActiveTab('crypto'); setSearch(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${activeTab === 'crypto' ? 'text-white' : 'text-muted'}`}
                                >
                                    <Wallet className="w-4 h-4" />
                                    Crypto
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('nft'); setSearch(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${activeTab === 'nft' ? 'text-white' : 'text-muted'}`}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    NFTs
                                </button>
                            </div>
                        )}

                        <div className="mb-8">
                            {!selectedAsset ? (
                                <div className="flex flex-col gap-4">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-white/5 blur-xl group-focus-within:bg-white/10 transition-all rounded-md" />
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                            <input 
                                                autoFocus
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder={activeTab === 'crypto' ? "Search Bitcoin, ETH..." : "Search Bored Ape, Azuki..."}
                                                className="w-full bg-white/5 border border-white/10 rounded-md py-4 pl-12 pr-4 text-sm focus:border-white/20 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 font-medium"
                                            />
                                            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />}
                                        </div>
                                    </div>

                                    {/* Results */}
                                    <div className="flex flex-col gap-2 min-h-[280px]">
                                        <AnimatePresence mode="popLayout">
                                            {results.length > 0 ? (
                                                results.map((asset, idx) => (
                                                    <motion.button
                                                        layout
                                                        key={asset.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        onClick={() => setSelectedAsset(asset)}
                                                        className="flex items-center gap-4 p-4 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-md transition-all text-left group relative overflow-hidden"
                                                    >
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                                            <img src={asset.thumb} alt="" className="w-10 h-10 rounded-full bg-white/5 relative z-10" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-white transition-colors truncate">{asset.name}</p>
                                                            <p className="text-[10px] text-muted uppercase font-black font-mono tracking-widest opacity-50">{asset.symbol || asset.id}</p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                            <Plus className="w-4 h-4 text-muted group-hover:text-white" />
                                                        </div>
                                                    </motion.button>
                                                ))
                                            ) : search && !loading ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                                                        <Search className="w-6 h-6 text-white/10" />
                                                    </div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-muted/50">No results found for "{search}"</p>
                                                </div>
                                            ) : !search && (
                                                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                                                    <Loader2 className="w-8 h-8 animate-[spin_3s_linear_infinite]" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting input...</p>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                /* Amount Input */
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-md border border-white/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                            {activeTab === 'crypto' ? <Wallet size={80} /> : <ImageIcon size={80} />}
                                        </div>
                                        <img src={selectedAsset.thumb} alt="" className="w-14 h-14 rounded-md shadow-2xl relative z-10" />
                                        <div className="flex-1 relative z-10">
                                            <p className="font-black text-xl text-white tracking-tight leading-none mb-1">{selectedAsset.name}</p>
                                            <button 
                                                onClick={() => setSelectedAsset(null)}
                                                className="text-[10px] text-muted hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                                            >
                                                <ChevronRight className="w-3 h-3 rotate-180" />
                                                Edit Selection
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-end px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
                                                {activeTab === 'crypto' ? 'Enter Amount Owned' : 'Number of Items'}
                                            </label>
                                            <span className="text-[10px] font-mono text-muted/40 uppercase">{selectedAsset.symbol || 'Units'}</span>
                                        </div>
                                        <div className="relative group/input">
                                            <div 
                                                className="absolute inset-0 blur-2xl opacity-0 group-focus-within/input:opacity-20 transition-opacity rounded-md"
                                                style={{ backgroundColor: accentColor }}
                                            />
                                            <input 
                                                autoFocus
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-md py-6 px-8 text-4xl font-black focus:border-white/20 focus:bg-white/10 outline-none transition-all placeholder:text-white/5 text-white"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleAdd}
                                        disabled={!amount}
                                        className="w-full py-5 bg-white hover:bg-gray-200 disabled:opacity-30 disabled:grayscale transition-all relative overflow-hidden group/btn shadow-[0_0_25px_rgba(255,255,255,0.2)] rounded-md"
                                    >
                                        <div className="absolute inset-0 bg-black/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10 text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                            Confirm Purchase
                                            <Plus className="w-5 h-5" />
                                        </span>
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddAssetModal;
