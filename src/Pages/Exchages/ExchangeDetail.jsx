import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coingeckoFetch } from '../../api/coingeckoClient';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const ExchangeDetail = () => {
    const { exchangeId } = useParams();
    const navigate = useNavigate();
    const [exchange, setExchange] = useState(null);
    const [loading, setLoading] = useState(true);

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
        <div className="p-6 bg-main rounded-xl min-h-screen">
            {/* Breadcrumbs */}
            <div className='flex items-center gap-2 text-sm mb-6'>
                <span className='text-muted cursor-pointer' onClick={() => navigate('/')}>Exchanges</span>
                <span className='text-muted'>/</span>
                <span className='text-muted cursor-pointer' onClick={() => navigate('/exchanges/cryptoexchanges')}>cryptoexchanges</span>
                <span className='text-muted'>/</span>
                <span className='text-white font-semibold'>{exchange.name}</span>
            </div>

            {/* Exchange Header */}
            <div className="flex items-center gap-4 mb-8">
                <img src={exchange.image} alt={exchange.name} className="w-16 h-16 rounded-full" />
                <div>
                    <h1 className="text-4xl font-bold">{exchange.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-card px-2 py-1 rounded text-sm text-muted">Trust Score: {exchange.trust_score}</span>
                        <span className="text-muted">Established: {exchange.year_established || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card/40 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Exchange Info</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-muted">Country</span>
                            <span className="font-medium">{exchange.country || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-muted">24h Volume (BTC)</span>
                            <span className="font-medium">{exchange.trade_volume_24h_btc?.toFixed(2)} BTC</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-muted">Website</span>
                            <a href={exchange.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                Visit Website <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-card/40 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-muted text-sm leading-relaxed">
                        {exchange.description || `No description available for ${exchange.name}.`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExchangeDetail;
