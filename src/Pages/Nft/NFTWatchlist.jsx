import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../Context/WishlistContext';
import { NFTCard } from './NFTFloorPrice';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import { Star, LayoutGrid, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const NFTWatchlist = () => {
    const { nftWishlist } = useWishlist();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full min-h-screen flex flex-col gap-8 pb-32 bg-main rounded-xl px-4 sm:px-10 lg:px-12"
        >
            <div className="w-full">
                <Breadcrumbs
                    crumbs={[
                        { label: 'NFTs', path: '/nft-floor' },
                        { label: 'Watchlist' }
                    ]}
                />
            </div>

            <motion.div variants={itemVariants} className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400/10 rounded-lg">
                            <Star className="text-yellow-400" size={24} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">Your Saved NFTs</h1>
                    </div>
                    <p className="text-sm sm:text-xl text-muted font-medium">
                        Tracking <span className="text-white font-bold">{nftWishlist.length}</span> collections in your personal vault.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button className="p-2 bg-white/10 rounded-lg text-white">
                        <LayoutGrid size={20} />
                    </button>
                    <Link to="/nft-floor" className="px-4 py-2 text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
                        Discover More
                    </Link>
                </div>
            </motion.div>

            {nftWishlist.length === 0 ? (
                <motion.div 
                    variants={itemVariants} 
                    className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] gap-6"
                >
                    <div className="p-10 bg-white/5 rounded-full">
                        <Star size={64} className="text-white/10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your vault is empty</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto font-medium">Star your favorite NFT collections to keep track of their floor prices and market trends.</p>
                    </div>
                    <Link 
                        to="/nft-floor" 
                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
                    >
                        Browse Collections
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {nftWishlist.map((nftId) => (
                            <NFTCard key={nftId} nft={{ id: nftId }} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <motion.div variants={itemVariants} className="mt-auto p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-4">
                <Info className="text-emerald-500 shrink-0" size={24} />
                <p className="text-xs sm:text-sm text-emerald-500/80 font-bold leading-relaxed">
                    Watchlist data is synchronized with your Supabase account. Access your saved assets across any device by logging in.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default NFTWatchlist;