import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingCoinsData, AllcoinsData } from '../../services/AllcoinsData';
import TableSkeleton from '../../Components/Loadings/TableSkeleton';
import Breadcrumbs from '../../Components/common/Breadcrumbs';
import TableFilterHeader from '../../Components/common/TableFilterHeader';
import { Search, Globe } from 'lucide-react';
import { useCurrency } from '../../Context/CurrencyContext';

const HighlightsDetail = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { currency, formatPrice } = useCurrency();
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');

    const getTitle = () => {
        switch (type) {
            case 'trending': return 'Top Trending Cryptocurrencies Today';
            case 'top-gainers': return 'Top Gaining Cryptocurrencies';
            case 'top-losers': return 'Top Losing Cryptocurrencies';
            case 'new-coins': return 'New Cryptocurrencies';
            case 'highest-volume': return 'Highest Volume Cryptocurrencies';
            case 'ath-change': return 'Price Change since ATH';
            default: return 'Cryptocurrency Highlights';
        }
    };

    const getDescription = () => {
        switch (type) {
            case 'trending': return 'Discover the top trending cryptocurrencies on CoinGecko. This list is sorted by coins that are most searched for in the last 3 hours.';
            case 'top-gainers': return 'Cryptocurrencies with the highest percentage increase in price over the last 24 hours.';
            case 'top-losers': return 'Cryptocurrencies with the highest percentage decrease in price over the last 24 hours.';
            case 'highest-volume': return 'Cryptocurrencies with the highest trading volume over the last 24 hours.';
            default: return '';
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === 'trending') {
                    const response = await TrendingCoinsData();
                    // Normalize trending data to match market data structure where possible
                    const normalized = response.coins.map(item => ({
                        id: item.item.id,
                        name: item.item.name,
                        symbol: item.item.symbol,
                        image: item.item.large,
                        current_price: item.item.data.price,
                        price_change_percentage_24h: item.item.data.price_change_percentage_24h[currency.code] || item.item.data.price_change_percentage_24h.usd,
                        market_cap: item.item.data.market_cap,
                        total_volume: item.item.data.total_volume,
                        sparkline_in_7d: { price: Array.isArray(item.item.data.sparkline) ? item.item.data.sparkline : [] },
                        market_cap_rank: item.item.market_cap_rank
                    }));
                    setCoins(normalized);
                } else {
                    // For other categories, we fetch the top 200 coins and sort/filter
                    const response = await AllcoinsData(200, 1, currency.code);
                    let filtered = [...response];

                    if (type === 'top-gainers') {
                        filtered.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
                    } else if (type === 'top-losers') {
                        filtered.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
                    } else if (type === 'highest-volume') {
                        filtered.sort((a, b) => b.total_volume - a.total_volume);
                    } else if (type === 'ath-change') {
                        filtered.sort((a, b) => a.ath_change_percentage - b.ath_change_percentage);
                    } else if (type === 'new-coins') {
                        // Mocking new coins with a mix for now as we don't have a specific endpoint
                        // In a real app, this would use a specific 'newly listed' endpoint
                        filtered = filtered.slice(150, 200);
                    }

                    // Take top 50 for the detail view
                    setCoins(filtered.slice(0, 50));
                }
            } catch (err) {
                console.error("Error fetching highlight detail:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedCoins = () => {
        let filteredCoins = coins;
        if (searchQuery) {
            filteredCoins = coins.filter(coin =>
                coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (!sortConfig.key) return filteredCoins;

        const sorted = [...filteredCoins].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle numeric strings (like total_volume if it's not a number)
            if (typeof aVal === 'string' && !isNaN(parseFloat(aVal.replace(/[\$,]/g, '')))) {
                aVal = parseFloat(aVal.replace(/[\$,]/g, ''));
            }
            if (typeof bVal === 'string' && !isNaN(parseFloat(bVal.replace(/[\$,]/g, '')))) {
                bVal = parseFloat(bVal.replace(/[\$,]/g, ''));
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpRight size={14} className="opacity-20 flex-shrink-0" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className="text-blue-500 flex-shrink-0" />
            : <ChevronDown size={14} className="text-blue-500 flex-shrink-0" />;
    };

    // Sparkline component (reused/simplified)
    const Sparkline = ({ data, color, width = 100, height = 40 }) => {
        if (!Array.isArray(data) || data.length === 0) return <span className="text-muted text-[10px]">No graph</span>;

        return (
            <div style={{ width, height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.map((v, i) => ({ value: v, i }))}>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };


    return (
        <div className="w-full flex flex-col justify-start items-center bg-black min-h-full p-2 sm:p-4 pb-8 rounded-xl gap-8 text-white">
            <div className="w-full flex flex-col gap-4">
                <Breadcrumbs
                    crumbs={[
                        { label: 'Cryptocurrencies', path: '/' },
                        { label: 'Highlights', path: '/highlights' },
                        { label: `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} Assets` }
                    ]}
                />

                <TableFilterHeader
                    activeTab={
                        type === 'trending' ? 'All' :
                            type === 'top-gainers' ? 'Top Gainers' :
                                type === 'top-losers' ? 'Top Losers' :
                                    type === 'new-coins' ? 'New Coins' :
                                        type === 'upcoming-coins' ? 'Upcoming Coins' : 'All'
                    }
                    onTabChange={(tab) => {
                        setSearchQuery('');
                        if (tab === 'All') navigate('/highlights/trending');
                        else if (tab === 'Top Gainers') navigate('/highlights/top-gainers');
                        else if (tab === 'Top Losers') navigate('/highlights/top-losers');
                        else if (tab === 'New Coins') navigate('/highlights/new-coins');
                        else if (tab === 'Upcoming Coins') navigate('/highlights/upcoming-coins');
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Search coins..."
                />
            </div>

            <div className='w-full overflow-x-auto rounded-xl border border-gray-800/50'>
                <table className='w-full min-w-[1000px] text-left text-sm'>
                    <thead className='border-b border-gray-800 text-muted bg-[#0b0e11] sticky top-0 z-20'>
                        <tr>
                            <th className='py-2 px-1 sticky left-0 bg-[#0b0e11] z-30 w-[45px] min-w-[45px] md:w-[60px] md:min-w-[60px] font-medium transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap_rank')}>
                                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider"># <SortIcon columnKey="market_cap_rank" /></div>
                            </th>
                            <th className='py-2 px-2 sticky left-[45px] md:left-[60px] bg-[#0b0e11] z-30 w-[120px] min-w-[120px] md:w-[180px] md:min-w-[180px] font-medium transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-wider">Coin <SortIcon columnKey="name" /></div>
                            </th>
                            <th className='py-2 px-2 font-medium text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('current_price')}>
                                <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">Price <SortIcon columnKey="current_price" /></div>
                            </th>
                            <th className='py-2 px-2 font-medium text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_24h')}>
                                <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">24h <SortIcon columnKey="price_change_percentage_24h" /></div>
                            </th>
                            {type !== 'trending' && (
                                <th className='py-2 px-2 font-medium text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('price_change_percentage_7d_in_currency')}>
                                    <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">7d <SortIcon columnKey="price_change_percentage_7d_in_currency" /></div>
                                </th>
                            )}
                            <th className='py-2 px-2 font-medium text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('total_volume')}>
                                <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">24h Vol <SortIcon columnKey="total_volume" /></div>
                            </th>
                            <th className='py-2 px-2 font-medium text-right transition-colors hover:text-white cursor-pointer select-none' onClick={() => handleSort('market_cap')}>
                                <div className="flex items-center justify-end gap-1 text-[10px] md:text-xs uppercase tracking-wider">Cap <SortIcon columnKey="market_cap" /></div>
                            </th>
                            <th className='py-2 px-2 font-medium text-right text-[10px] md:text-xs uppercase tracking-wider'>Last 7 Days</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {loading ? (
                            <tr><td colSpan="8" className="p-0"><TableSkeleton rows={10} columns={8} /></td></tr>
                        ) : error ? (
                            <tr><td colSpan="8" className="py-20 text-center text-red-500">{error}</td></tr>
                        ) : (
                            getSortedCoins().map((coin, index) => (
                                <tr
                                    key={coin.id}
                                    onClick={() => navigate(`/cryptocurrencies/marketcap/${coin.id}`)}
                                    className='hover:bg-white/5 transition-colors cursor-pointer group'
                                >
                                    <td className='py-3 px-1 sticky left-0 bg-black group-hover:bg-card transition-colors z-10 w-[45px] text-muted text-sm font-bold'>{coin.market_cap_rank || index + 1}</td>
                                    <td className='py-3 px-2 sticky left-[45px] md:left-[60px] bg-black group-hover:bg-card transition-colors z-10 w-[120px]'>
                                        <div className='flex items-center gap-2'>
                                            <img src={coin.image} alt={coin.name} className='w-5 h-5 sm:w-6 sm:h-6 rounded-sm' />
                                            <div className="flex flex-col min-w-0">
                                                <span className='font-bold text-white group-hover:text-blue-400 transition-colors truncate text-base sm:text-lg'>{coin.name}</span>
                                                <span className='text-xs sm:text-sm text-muted uppercase leading-none font-bold'>{coin.symbol}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-3 px-2 text-right text-sm sm:text-base font-bold'>
                                        {typeof coin.current_price === 'string' && (coin.current_price.includes('$') || coin.current_price.includes('₹'))
                                            ? coin.current_price
                                            : formatPrice(coin.current_price || 0, { maximumFractionDigits: 8 })
                                        }
                                    </td>
                                    <td className={`py-3 px-2 text-right text-sm sm:text-base font-bold ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(coin.price_change_percentage_24h || 0).toFixed(1)}%
                                    </td>
                                    {type !== 'trending' && (
                                        <td className={`py-3 px-2 text-right text-sm sm:text-base font-bold ${(coin.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {(coin.price_change_percentage_7d_in_currency || 0).toFixed(1)}%
                                        </td>
                                    )}
                                    <td className='py-3 px-2 text-right text-sm sm:text-base text-gray-300 font-bold'>
                                        {typeof coin.total_volume === 'string'
                                            ? coin.total_volume
                                            : formatPrice(coin.total_volume || 0, { notation: 'compact' })
                                        }
                                    </td>
                                    <td className='py-3 px-2 text-right text-sm sm:text-base text-gray-300 font-bold'>
                                        {typeof coin.market_cap === 'string'
                                            ? coin.market_cap
                                            : formatPrice(coin.market_cap || 0, { notation: 'compact' })
                                        }
                                    </td>
                                    <td className='py-2 px-2 flex justify-end'>
                                        {coin.sparkline_in_7d?.price ? (
                                            <Sparkline
                                                data={coin.sparkline_in_7d.price}
                                                color={(coin.price_change_percentage_24h || 0) >= 0 ? '#22c55e' : '#ef4444'}
                                                width={80}
                                                height={30}
                                            />
                                        ) : (
                                            <span className="text-muted text-[10px]">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HighlightsDetail;
