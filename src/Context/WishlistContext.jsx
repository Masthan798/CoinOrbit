import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [coinWishlist, setCoinWishlist] = useState([]);
    const [nftWishlist, setNftWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Wishlists
    const fetchWishlists = async () => {
        if (!user) {
            setCoinWishlist([]);
            setNftWishlist([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch Coins
            const { data: coins, error: coinError } = await supabase
                .from('Coins_Wishlist')
                .select('coin_id')
                .eq('user_id', user.id);

            if (coinError) throw coinError;
            setCoinWishlist(coins.map(item => item.coin_id));

            // Fetch NFTs
            const { data: nfts, error: nftError } = await supabase
                .from('NFT_WishList')
                .select('nft_id')
                .eq('user_id', user.id);

            if (nftError) throw nftError;
            setNftWishlist(nfts.map(item => item.nft_id));

        } catch (error) {
            console.error('Error fetching wishlists:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlists();
    }, [user]);

    // Toggle Coin Wishlist
    const toggleCoinWishlist = async (coinId, coinName = 'Asset') => {
        if (!user) {
            toast.error('Please login to add to watchlist');
            return { error: 'Please login' };
        }

        const isStarred = coinWishlist.includes(coinId);
        
        // Optimistic UI update
        const previousWishlist = [...coinWishlist];
        setCoinWishlist(prev => 
            isStarred ? prev.filter(id => id !== coinId) : [...prev, coinId]
        );

        try {
            if (isStarred) {
                // Remove
                const { error } = await supabase
                    .from('Coins_Wishlist')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('coin_id', coinId);
                if (error) throw error;
                toast.success(`${coinName} removed from watchlist`);
            } else {
                // Add
                const { error } = await supabase
                    .from('Coins_Wishlist')
                    .insert([{ user_id: user.id, coin_id: coinId }]);
                if (error) throw error;
                toast.success(`${coinName} added to watchlist`);
            }
            return { success: true };
        } catch (error) {
            // Revert on error
            setCoinWishlist(previousWishlist);
            console.error('Error toggling coin wishlist:', error.message);
            toast.error(`Could not update watchlist: ${error.message}`);
            return { error: error.message };
        }
    };

    // Toggle NFT Wishlist
    const toggleNftWishlist = async (nftId, nftName = 'Collection') => {
        if (!user) {
            toast.error('Please login to add to watchlist');
            return { error: 'Please login' };
        }

        const isStarred = nftWishlist.includes(nftId);
        
        // Optimistic UI update
        const previousWishlist = [...nftWishlist];
        setNftWishlist(prev => 
            isStarred ? prev.filter(id => id !== nftId) : [...prev, nftId]
        );

        try {
            if (isStarred) {
                // Remove
                const { error } = await supabase
                    .from('NFT_WishList')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('nft_id', nftId);
                if (error) throw error;
                toast.success(`${nftName} removed from watchlist`);
            } else {
                // Add
                const { error } = await supabase
                    .from('NFT_WishList')
                    .insert([{ user_id: user.id, nft_id: nftId }]);
                if (error) throw error;
                toast.success(`${nftName} added to watchlist`);
            }
            return { success: true };
        } catch (error) {
            // Revert on error
            setNftWishlist(previousWishlist);
            console.error('Error toggling nft wishlist:', error.message);
            toast.error(`Could not update watchlist: ${error.message}`);
            return { error: error.message };
        }
    };

    const value = {
        coinWishlist,
        nftWishlist,
        toggleCoinWishlist,
        toggleNftWishlist,
        loading,
        refreshWishlists: fetchWishlists
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
