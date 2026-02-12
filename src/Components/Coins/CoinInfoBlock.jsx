import React, { useState } from 'react';
import { ExternalLink, Twitter, Facebook, Github, Check, Copy, ChevronDown } from 'lucide-react';

const CoinInfoBlock = ({ coin }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coin.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 text-white w-full">
            <h2 className="text-xl font-bold">Info</h2>

            <div className="flex flex-col gap-4">
                {/* Website */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Website</span>
                    <div className="flex gap-2">
                        {coin.links?.homepage?.[0] && (
                            <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                                {new URL(coin.links.homepage[0]).hostname.replace('www.', '')}
                            </a>
                        )}
                        {coin.links?.whitepaper && (
                            <a href={coin.links.whitepaper} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all">
                                Whitepaper
                            </a>
                        )}
                    </div>
                </div>

                {/* Explorers */}
                <div className="flex justify-between items-center py-2 border-b border-white/5 relative z-20">
                    <span className="text-gray-400 text-sm">Explorers</span>
                    <div className="relative group">
                        <button className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                            Explorers
                            <ChevronDown size={12} />
                        </button>
                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1c23] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden max-h-60 overflow-y-auto z-50">
                            {coin.links?.blockchain_site?.filter(l => l).map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 hover:bg-white/5 text-xs text-gray-300 hover:text-white truncate block">
                                    {new URL(link).hostname.replace('www.', '')}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wallets */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Wallets</span>
                    <button className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                        Ledger
                        <ChevronDown size={12} />
                    </button>
                </div>

                {/* Community */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Community</span>
                    <div className="flex gap-2">
                        {coin.links?.subreddit_url && (
                            <a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                                <span className="text-[#ff4500] font-bold">Reddit</span>
                            </a>
                        )}
                        {coin.links?.twitter_screen_name && (
                            <a href={`https://twitter.com/${coin.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                                <Twitter size={14} className="text-[#1da1f2]" /> Twitter
                            </a>
                        )}
                        {coin.links?.facebook_username && (
                            <a href={`https://facebook.com/${coin.links.facebook_username}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                                <Facebook size={14} className="text-[#1877f2]" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Search on */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Search on</span>
                    <a href={`https://twitter.com/search?q=%24${coin.symbol}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                        <Twitter size={14} /> Twitter
                    </a>
                </div>

                {/* Source Code */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Source Code</span>
                    {coin.links?.repos_url?.github?.[0] && (
                        <a href={coin.links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 hover:bg-[#252830] rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-2">
                            <Github size={14} /> Github
                        </a>
                    )}
                </div>

                {/* API ID */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">API ID</span>
                    <div className="flex items-center gap-2 bg-[#0d0e12] px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-colors group cursor-pointer" onClick={handleCopy}>
                        <span className="text-xs text-gray-300 font-mono select-all">{coin.id}</span>
                        <span className="text-gray-500 group-hover:text-white transition-colors">
                            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </span>
                    </div>
                </div>

                {/* Chains */}
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Chains</span>
                    <span className='px-3 py-1.5 bg-[#1a1c23] border border-white/10 rounded-lg text-xs font-medium text-gray-300 capitalize'>
                        {coin.asset_platform_id ? `${coin.asset_platform_id} Ecosystem` : 'Native'}
                    </span>
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-3 py-2">
                    <div className='flex justify-between items-center'>
                        <span className="text-gray-400 text-sm">Categories</span>
                        <span className='text-[10px] font-bold text-gray-500 px-2 py-1 bg-white/5 rounded-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors'>See all</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {coin.categories?.slice(0, 3).map((cat, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 rounded-full text-[10px] font-bold text-gray-300 hover:border-white/30 transition-colors cursor-default">
                                {cat}
                            </span>
                        ))}
                        {coin.categories?.length > 3 && (
                            <span className="px-3 py-1.5 bg-[#1a1c23] border border-white/10 rounded-full text-[10px] font-bold text-gray-400">
                                +{coin.categories.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CoinInfoBlock;
