import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { motion } from 'framer-motion'
import { Info, ChevronUp, ChevronDown } from 'lucide-react';




const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            duration: 0.5
        }
    }
};

// const expandVariants = {
//     hidden: {
//         height: 0,
//         opacity: 0,
//         marginTop: 0,
//         transition: {
//             height: { duration: 0.3 },
//             opacity: { duration: 0.2 }
//         }
//     },
//     visible: {
//         height: "auto",
//         opacity: 1,
//         marginTop: 16,
//         transition: {
//             height: { duration: 0.3 },
//             opacity: { duration: 0.4 },
//             staggerChildren: 0.1
//         }
//     }
// };

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
        scale: 1.03,
        y: -4,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    }
};

const ExchangeDetail = () => {
    const { exchangeId } = useParams();
    const navigate = useNavigate();
    const [exchange, setExchange] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Spot');

    const tabs = ['Spot', 'Perpetuals', 'Features'];

    useEffect(() => {
        const fetchExchangeDetail = async () => {
            setLoading(true);
            try {
                const response = await coingeckoFetch(`/exchanges/${exchangeId}`);
                setExchange(response);
            } catch (error) {
                console.error("Error fetching exchange details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExchangeDetail();
    }, [exchangeId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-muted border-t-white rounded-full animate-spin"></div>
                <p className="mt-4 text-muted">Loading {exchangeId} details...</p>
            </div>
        );
    }

    if (!exchange) {
        return <div className="p-8 text-center text-red-500">Exchange not found.</div>;
    }

    return (
        <motion.div variants={containerVariants} inital='hidden' animate='visible' className="p-6 bg-main rounded-xl min-h-screen">
            {/* Breadcrumbs */}
            <div className='flex items-center gap-2 text-sm mb-6'>
                <span className='text-muted cursor-pointer' onClick={() => navigate('/')}>Exchanges</span>
                <span className='text-muted'>/</span>
                <span className='text-muted cursor-pointer' onClick={() => navigate('/exchanges/cryptoexchanges')}>cryptoexchanges</span>
                <span className='text-muted'>/</span>
                <span className='text-white font-semibold'>{exchange.name}</span>
            </div>

            {/* Exchange Header */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full overflow-hidden'>

                <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <img src={exchange.image} alt={exchange.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shrink-0" />
                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 min-w-0'>
                        <p className='text-xl sm:text-3xl font-bold truncate'>{exchange.name}</p>
                        <p className='text-muted text-xs sm:text-sm p-1 px-2 rounded-md bg-card w-fit whitespace-nowrap'>Centralized Exchange</p>
                    </div>
                </div>

                <div className='flex items-center md:justify-end w-full md:w-auto'>
                    <div className='flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 bg-card rounded-md w-fit max-w-full no-scrollbar overflow-x-auto'>
                        {tabs.map((tab) => (
                            <span
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-1 px-2 sm:px-3 text-xs sm:text-sm rounded-md cursor-pointer transition-colors duration-200 ${activeTab === tab
                                    ? 'bg-main text-white'
                                    : 'text-muted hover:bg-main hover:text-white'
                                    }`}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                </div>

            </div>


            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'
            >
                {/* first card of the exchage detailes based of the binance  */}
                <motion.div variants={itemVariants} className='flex flex-col gap-2 h-[210px]'>
                    <div className='flex flex-col items-start border-gray-800 border-2 rounded-2xl px-6 py-4 flex-1 justify-center bg-card/20 backdrop-blur-md hover:border-gray-700 transition-colors'>
                        <p className='text-2xl font-bold tracking-tight'>$38,195,303,703</p>
                        <div className='flex items-center gap-2'>
                            <span className='text-muted text-sm'>24h Trading Volume</span>
                            <div className='flex items-center gap-1 text-green-500 text-sm font-medium'>
                                <ChevronUp size={14} />
                                <span>69.6%</span>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col items-start border-gray-800 border-2 rounded-2xl px-6 py-4 flex-1 justify-center bg-card/20 backdrop-blur-md hover:border-gray-700 transition-colors'>
                        <p className='text-2xl font-bold text-green-500'>10/10</p>
                        <div className='flex items-center gap-2 text-muted'>
                            <span className='text-sm'>Trust Score</span>
                            <Info size={14} className='cursor-pointer hover:text-white transition-colors' />
                        </div>
                    </div>
                </motion.div>

                {/* second card for new listings */}
                <motion.div variants={itemVariants} className='h-[210px]'>
                    <div className='flex flex-col items-start border-gray-800 border-2 rounded-2xl px-6 py-4 h-full bg-card/20 backdrop-blur-md hover:border-gray-700 transition-colors overflow-hidden'>
                        <div className='flex items-center justify-between w-full mb-4'>
                            <p className='text-lg font-semibold flex items-center gap-2'>
                                <span className='text-yellow-500'>✨</span> New Listings
                            </p>
                        </div>
                        <div className='flex flex-col gap-2 w-full flex-1 justify-between py-1'>
                            {[
                                { name: 'Zama', price: '$0.02897', change: '+0.3%', up: true, color: 'bg-yellow-500', char: 'Z' },
                                { name: 'Sentient', price: '$0.03165', change: '-4.6%', up: false, color: 'bg-pink-500', char: 'S' },
                                { name: 'Ripple USD', price: '$0.9999', change: '0.0%', up: true, color: 'bg-blue-500', char: 'R' }
                            ].map((coin, i) => (
                                <div key={i} className='flex items-center justify-between w-full group hover:bg-white/5 p-1 px-2 rounded-lg transition-all cursor-pointer -mx-2'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-medium text-white/90 group-hover:text-white transition-colors'>{coin.name}</span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-white/90 font-mono text-[13px]'>{coin.price}</span>
                                        <div className={`flex items-center gap-0.5 text-[13px] font-medium w-12 justify-end ${coin.up ? 'text-green-500' : 'text-red-500'}`}>
                                            {coin.up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            <span>{coin.change.replace(/[+-]/, '')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Thrid card for new Largest Gainers */}
                <motion.div variants={itemVariants} className='h-[210px]'>
                    <div className='flex flex-col items-start border-gray-800 border-2 rounded-2xl px-6 py-4 h-full bg-card/20 backdrop-blur-md hover:border-gray-700 transition-colors overflow-hidden'>
                        <div className='flex items-center justify-between w-full mb-4'>
                            <p className='text-lg font-semibold flex items-center gap-2'>
                                <span className='text-blue-400'>🚀</span> Largest Gainers
                            </p>
                        </div>
                        <div className='flex flex-col gap-2 w-full flex-1 justify-between py-1'>
                            {[
                                { name: 'Serum', price: '$0.008254', change: '+48.9%', up: true, color: 'bg-cyan-500', char: 'S' },
                                { name: 'Decred', price: '$22.47', change: '+28.7%', up: true, color: 'bg-blue-400', char: 'D' },
                                { name: 'Succinct', price: '$0.3877', change: '+27.8%', up: true, color: 'bg-purple-500', char: 'S' }
                            ].map((coin, i) => (
                                <div key={i} className='flex items-center justify-between w-full group hover:bg-white/5 p-1 px-2 rounded-lg transition-all cursor-pointer -mx-2'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-medium text-white/90 group-hover:text-white transition-colors'>{coin.name}</span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-white/90 font-mono text-[13px]'>{coin.price}</span>
                                        <div className={`flex items-center gap-0.5 text-[13px] font-medium w-12 justify-end ${coin.up ? 'text-green-500' : 'text-red-500'}`}>
                                            {coin.up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            <span>{coin.change.replace(/[+-]/, '')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>


        </motion.div>
    );
};

export default ExchangeDetail;
