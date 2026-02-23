import React from 'react';
import { ExternalLink, Globe, Facebook, Twitter, ShieldCheck } from 'lucide-react';

const ExchangeInfo = ({ exchange }) => {
    if (!exchange) return null;

    // Helper to format social links
    const socialLinks = [
        { name: 'Website', url: exchange.url, icon: <Globe size={14} /> },
        { name: 'Twitter', url: exchange.twitter_handle ? `https://twitter.com/${exchange.twitter_handle}` : null, icon: <Twitter size={14} /> },
        { name: 'Facebook', url: exchange.facebook_url, icon: <Facebook size={14} /> },
        { name: 'Reddit', url: exchange.reddit_url, icon: <ExternalLink size={14} /> },
    ].filter(link => link.url);

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full mb-8">
            {/* Left: General Info */}
            <div className="flex-1 bg-[#0d0e12] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <img src={exchange.image} alt={exchange.name} className="w-10 h-10 rounded-sm" />
                    <div>
                        <h2 className="text-xl font-bold text-white">About {exchange.name}</h2>
                        {exchange.year_established && (
                            <p className="text-xs text-muted">Established {exchange.year_established} • {exchange.country || 'Global'}</p>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-300">
                    {exchange.description ? exchange.description :
                        `${exchange.name} is a ${exchange.centralized ? 'centralized' : 'decentralized'} cryptocurrency exchange based in ${exchange.country || 'Cayman Islands'}. It supports ${exchange.tickers?.length || 'various'} trading pairs.`}
                </p>

                <div className="flex flex-wrap gap-3 mt-auto pt-4">
                    {socialLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors border border-white/5 hover:border-white/10"
                        >
                            {link.icon}
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>

            {/* Right: Fees & Stats */}
            <div className="w-full lg:w-[400px] bg-[#0d0e12] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-white font-bold text-lg mb-2">Exchange Stats</h3>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-400">Trust Score</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-sm font-bold border border-green-500/20">
                            <ShieldCheck size={14} />
                            {exchange.trust_score || 0}/10
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-400">Trading Incentive</span>
                        <span className={`text-sm font-medium ${exchange.has_trading_incentive ? 'text-green-400' : 'text-gray-500'}`}>
                            {exchange.has_trading_incentive ? 'Yes' : 'None'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-400">Centralized</span>
                        <span className="text-sm font-medium text-white">
                            {exchange.centralized ? 'Yes' : 'No'}
                        </span>
                    </div>

                    {/* Fees Placeholder - CoinGecko doesn't give specific fee strings often */}
                    <div className="flex flex-col gap-1 py-2">
                        <span className="text-sm text-gray-400 mb-1">Fee Structure</span>
                        <p className="text-xs text-gray-500">
                            Fees vary by tier. Use native tokens (like BNB for Binance) for discounts on some exchanges.
                            Check official site for latest Maker/Taker rates.
                        </p>
                    </div>
                </div>

                <a
                    href={exchange.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold text-center rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                    Visit Exchange
                </a>
            </div>
        </div>
    );
};

export default ExchangeInfo;
