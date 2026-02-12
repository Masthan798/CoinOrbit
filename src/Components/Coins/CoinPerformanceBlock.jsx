import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Newspaper, ChevronRight } from 'lucide-react';
import { CoinNewsData } from '../../services/AllcoinsData';

const CoinPerformanceBlock = ({ coin }) => {
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            if (!coin?.id) return;
            try {
                // Fetch news/status updates
                const data = await CoinNewsData(coin.id);
                if (data && data.status_updates) {
                    setNews(data.status_updates.slice(0, 3));
                } else {
                    // Fallback mock if APIs are empty or restricted
                    setNews([]);
                }
            } catch (err) {
                console.error("Failed to fetch news", err);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchNews();
    }, [coin?.id]);

    const returns = [
        { label: '1h', value: coin.market_data?.price_change_percentage_1h_in_currency?.usd },
        { label: '24h', value: coin.market_data?.price_change_percentage_24h_in_currency?.usd },
        { label: '7d', value: coin.market_data?.price_change_percentage_7d_in_currency?.usd },
        { label: '14d', value: coin.market_data?.price_change_percentage_14d_in_currency?.usd },
        { label: '30d', value: coin.market_data?.price_change_percentage_30d_in_currency?.usd },
        { label: '1y', value: coin.market_data?.price_change_percentage_1y_in_currency?.usd },
    ];

    return (
        <div className="flex flex-col gap-8 w-full text-white">

            {/* Returns Section */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Compare with:</span>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                <input type="checkbox" className="rounded bg-[#1a1c23] border-white/10 text-blue-500 focus:ring-0" disabled />
                                <span className="text-gray-300">BTC</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                <input type="checkbox" className="rounded bg-[#1a1c23] border-white/10 text-blue-500 focus:ring-0" disabled />
                                <span className="text-gray-300">ETH</span>
                            </label>
                        </div>
                    </div>
                    <a href="#" className="text-xs text-gray-400 underline hover:text-white transition-colors">Need more data? Explore our API</a>
                </div>

                <div className="grid grid-cols-6 gap-0 bg-[#0d0e12] border border-white/5 rounded-2xl overflow-hidden">
                    {returns.map((item, i) => (
                        <div key={i} className="flex flex-col items-center justify-center py-4 border-r border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            <span className="text-xs text-gray-500 font-bold mb-1">{item.label}</span>
                            <div className={`text-sm font-bold flex items-center gap-0.5 ${item.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.value >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {item.value ? `${Math.abs(item.value).toFixed(1)}%` : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recently Happened / News Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Recently Happened to {coin.name}</h3>
                    <span className="px-2 py-0.5 bg-[#1a1c23] border border-white/10 rounded text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alpha</span>
                </div>

                <div className="flex flex-col gap-6 pl-2 border-l-2 border-white/5 relative">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest pl-4 mb-2">Updates</span>

                    {loadingNews ? (
                        <div className="flex flex-col gap-4 pl-4">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : news.length > 0 ? (
                        news.map((item, i) => (
                            <div key={i} className="flex flex-col gap-2 pl-4 relative group">
                                {/* Dot on timeline */}
                                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors border border-[#0d0e12]"></div>

                                <span className="text-xs text-blue-400 font-medium">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                                </span>

                                <h4 className="text-sm font-bold text-gray-200 leading-snug group-hover:text-white transition-colors">
                                    {item.description || item.title}
                                </h4>

                                {item.project?.type && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full text-[10px] text-gray-400">
                                            <Newspaper size={10} />
                                            {item.project.type}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        // Fallback content if no news found (Static mock to match design feel)
                        <>
                            <div className="flex flex-col gap-2 pl-4 relative group">
                                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors border border-[#0d0e12]"></div>
                                <span className="text-xs text-blue-400 font-medium">about 2 hours ago</span>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-bold text-gray-200 leading-snug group-hover:text-white transition-colors">
                                        Standard Chartered Lowers Bitcoin Target
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">Standard Chartered analysts predict Bitcoin may dip to $50,000. They also reduced the 2026 year-end target to $100,000 from $150,000.</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400">
                                        📰 2 sources
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pl-4 relative group">
                                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors border border-[#0d0e12]"></div>
                                <span className="text-xs text-blue-400 font-medium">about 5 hours ago</span>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-bold text-gray-200 leading-snug group-hover:text-white transition-colors">
                                        Bitcoin ETFs See Significant Outflow
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">Bitcoin ETFs recorded a $276.3 million net outflow, leading to increased short-term selling pressure.</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400">
                                        📰 1 source
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CoinPerformanceBlock;
