import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const POPULAR_PAIRS = [
    { id1: 'bitcoin', id2: 'ethereum' },
    { id1: 'ethereum', id2: 'solana' },
    { id1: 'binancecoin', id2: 'solana' },
    { id1: 'dogecoin', id2: 'shiba-inu' },
    { id1: 'arbitrum', id2: 'optimism' },
    { id1: 'fetch-ai', id2: 'singularitynet' },
    { id1: 'pepe', id2: 'floki' },
    { id1: 'ripple', id2: 'cardano' },
    { id1: 'avalanche-2', id2: 'polkadot' },
    { id1: 'chainlink', id2: 'uniswap' },
    { id1: 'near', id2: 'cosmos' },
    { id1: 'matic-network', id2: 'immutable-x' },
    { id1: 'render-token', id2: 'akash-network' },
    { id1: 'bitcoin', id2: 'solana' },
    { id1: 'ethereum', id2: 'binancecoin' }
];

const PopularComparisons = ({ onSelect, coinsList }) => {
    const [displayedPairs, setDisplayedPairs] = useState([]);

    const getCoin = (id) => coinsList.find(c => c.id === id);

    useEffect(() => {
        const updatePairs = () => {
            // Shuffle and pick 6 pairs
            const shuffled = [...POPULAR_PAIRS].sort(() => 0.5 - Math.random());
            setDisplayedPairs(shuffled.slice(0, 6));
        };

        updatePairs();

        const interval = setInterval(updatePairs, 600000); // 10 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Popular comparisons</h3>
                <span className="text-xs text-muted">Updates every 10m</span>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] no-scrollbar">
                {displayedPairs.map((pair, index) => {
                    const c1 = getCoin(pair.id1);
                    const c2 = getCoin(pair.id2);

                    // Skip if coin data isn't available
                    if (!c1 || !c2) return null;

                    return (
                        <div
                            key={`${pair.id1}-${pair.id2}-${index}`}
                            onClick={() => onSelect(pair.id1, pair.id2)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <img src={c1.image} alt={c1.name} className="w-8 h-8 rounded-sm" />
                                <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{c1.name}</span>
                            </div>

                            <ArrowRightLeft size={16} className="text-muted group-hover:text-white transition-colors mx-4" />

                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-bold text-gray-200 group-hover:text-white transition-colors text-right">{c2.name}</span>
                                <img src={c2.image} alt={c2.name} className="w-8 h-8 rounded-sm" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PopularComparisons;
