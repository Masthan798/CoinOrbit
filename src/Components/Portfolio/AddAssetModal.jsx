 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Loader2, Wallet, Image as ImageIcon } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';

const AddAssetModal = ({ isOpen, onClose, onAdd, type = 'crypto' }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                if (type === 'crypto') {
                    const data = await coingeckoFetch(`/search?query=${search}`);
                    setResults(data.coins.slice(0, 5));
                } else {
                    // NFT Search logic via Coingecko
                    const data = await coingeckoFetch(`/search?query=${search}`);
                    setResults(data.nfts.slice(0, 5));
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, type]);

    const handleAdd = () => {
        if (!selectedAsset || !amount) return;
        onAdd({
            ...selectedAsset,
            amount: parseFloat(amount),
            type
        });
        setSearch('');
        setSelectedAsset(null);
        setAmount('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {type === 'crypto' ? <Wallet className="w-5 h-5 text-blue-500" /> : <ImageIcon className="w-5 h-5 text-purple-500" />}
                        Add {type === 'crypto' ? 'Crypto' : 'NFT'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* Search Input */}
                    {!selectedAsset ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted">Search {type}</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input 
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={type === 'crypto' ? "Bitcoin, Ethereum..." : "Bored Ape, Azuki..."}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
                                />
                                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                            </div>

                            {/* Results */}
                            <div className="flex flex-col gap-1 mt-2">
                                {results.map(asset => (
                                    <button
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-left group"
                                    >
                                        <img src={asset.thumb} alt="" className="w-8 h-8 rounded-full bg-white/5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{asset.name}</p>
                                            <p className="text-xs text-muted uppercase font-mono">{asset.symbol || asset.id}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-muted group-hover:text-blue-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Amount Input */
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                <img src={selectedAsset.thumb} alt="" className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <p className="font-bold text-white">{selectedAsset.name}</p>
                                    <button 
                                        onClick={() => setSelectedAsset(null)}
                                        className="text-xs text-blue-500 hover:underline font-bold uppercase tracking-tighter"
                                    >
                                        Change Asset
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                                    {type === 'crypto' ? 'Amount Owned' : 'Quantity / Items'}
                                </label>
                                <input 
                                    autoFocus
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-2xl font-bold focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                                />
                            </div>

                            <button 
                                onClick={handleAdd}
                                disabled={!amount}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                            >
                                Add to Portfolio
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AddAssetModal;
