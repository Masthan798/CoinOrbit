import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { coingeckoFetch } from '../../api/coingeckoClient';
import CoinSelector from '../../Components/Inputs/CoinSelector';
import CurrencySelector from '../../Components/Inputs/CurrencySelector';
import Breadcrumbs from '../../Components/common/Breadcrumbs';

const Converter = () => {
  const navigate = useNavigate();
  // ... rest of state
  const [coinsList, setCoinsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [amount, setAmount] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');

  // coinPriceInBTC: proportional value of the selected coin in BTC (e.g., 1 ETH = 0.05 BTC)
  const [coinPriceBTC, setCoinPriceBTC] = useState(null);

  // ratesData: The full object from /exchange_rates (e.g. { usd: { value: 50000, ... }, ... })
  const [ratesData, setRatesData] = useState(null);

  const [loadingRate, setLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 1. Fetch Coins List (Initial)
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoadingList(true);
        const data = await coingeckoFetch('coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        setCoinsList(data);
      } catch (error) {
        console.error("Error fetching coins:", error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchCoins();
  }, []);

  // 2. Fetch Global Exchange Rates (Initial + Polling)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await coingeckoFetch('exchange_rates');
        // data is { rates: { btc: {...}, usd: {...} } }
        if (data && data.rates) {
          setRatesData(data.rates);
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000 * 5); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // 3. Fetch Selected Coin Price in BTC
  useEffect(() => {
    const fetchCoinPrice = async () => {
      if (!selectedCoin) return;

      // Optimization: If selected coin IS bitcoin, price is 1.
      if (selectedCoin === 'bitcoin') {
        setCoinPriceBTC(1);
        setLastUpdated(Date.now() / 1000); // Mock timestamp
        return;
      }

      try {
        setLoadingRate(true);
        const data = await coingeckoFetch(`simple/price?ids=${selectedCoin}&vs_currencies=btc&include_last_updated_at=true`);

        if (data[selectedCoin] && data[selectedCoin].btc) {
          setCoinPriceBTC(data[selectedCoin].btc);
          setLastUpdated(data[selectedCoin].last_updated_at);
        } else {
          setCoinPriceBTC(null);
        }
      } catch (error) {
        console.error("Error fetching coin price:", error);
        setCoinPriceBTC(null);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchCoinPrice();
    const interval = setInterval(fetchCoinPrice, 60000);
    return () => clearInterval(interval);

  }, [selectedCoin]);


  // Derived States
  const currenciesList = useMemo(() => {
    if (!ratesData) return [];
    return Object.keys(ratesData).map(key => ({
      code: key,
      name: ratesData[key].name,
      symbol: ratesData[key].unit,
      type: ratesData[key].type
    })).sort((a, b) => {
      // Priority sorting: Fiat first, then major ones
      if (a.type === 'fiat' && b.type !== 'fiat') return -1;
      if (a.type !== 'fiat' && b.type === 'fiat') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [ratesData]);

  const calculatedValue = (() => {
    if (amount === '' || isNaN(amount)) return 0;
    if (!coinPriceBTC || !ratesData || !ratesData[selectedCurrency]) return 0;

    // Formula: Amount * (CoinValueInBTC) * (1BTC ValueInCurrency)
    // ratesData[currency].value is "How much of this currency is 1 BTC?"
    const btcToCurrencyRate = ratesData[selectedCurrency].value;
    return amount * coinPriceBTC * btcToCurrencyRate;
  })();


  const formatCurrency = (val, currencyCode) => {
    // Handle crypto units vs fiat units display
    const currency = ratesData?.[currencyCode];
    if (!currency) return '...';

    const isFiat = currency.type === 'fiat';

    return new Intl.NumberFormat('en-US', {
      style: isFiat ? 'currency' : 'decimal',
      currency: isFiat ? currencyCode.toUpperCase() : undefined,
      maximumFractionDigits: isFiat ? 2 : 6
    }).format(val) + (isFiat ? '' : ` ${currency.unit}`);
  };

  const formatCrypto = (val, symbol) => {
    return `${val} ${symbol?.toUpperCase()}`;
  };

  const currentCoinData = coinsList.find(c => c.id === selectedCoin);


  // Popular Pairs Data
  const popularPairs = [
    { coin: 'bitcoin', currency: 'usd' }, { coin: 'bitcoin', currency: 'gbp' }, { coin: 'bitcoin', currency: 'eur' }, { coin: 'bitcoin', currency: 'inr' },
    { coin: 'ethereum', currency: 'usd' }, { coin: 'ethereum', currency: 'gbp' }, { coin: 'ethereum', currency: 'eur' }, { coin: 'ethereum', currency: 'inr' },
    { coin: 'ripple', currency: 'usd' }, { coin: 'ripple', currency: 'gbp' }, { coin: 'ripple', currency: 'eur' }, { coin: 'ripple', currency: 'inr' },
    { coin: 'solana', currency: 'usd' }, { coin: 'solana', currency: 'gbp' }, { coin: 'solana', currency: 'eur' }, { coin: 'solana', currency: 'inr' },
  ];

  // Popular Currencies Data
  const popularCurrencies = ['usd', 'eur', 'gbp', 'inr', 'cad', 'aud', 'jpy', 'cny', 'rub', 'idr', 'pkr', 'hkd'];


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen p-4 pb-20 flex flex-col items-center gap-8 bg-main"
    >
      <div className="w-full max-w-7xl flex flex-col gap-8">


        <Breadcrumbs
          crumbs={[
            { label: 'Tools', path: '/' },
            { label: 'Converter' }
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Cryptocurrency Converter Calculator</h1>
          <p className="text-muted">Check the latest cryptocurrency prices against all global currencies. Simple to use and updated frequently.</p>
        </div>

        {/* Converter Box */}
        <div className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 md:p-10 flex flex-col gap-8 shadow-2xl">

          <div className="flex flex-col md:flex-row items-end gap-4">

            {/* Amount Input */}
            <div className="flex-1 w-full flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Enter Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                className="w-full h-[45px] bg-card border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all font-mono"
                placeholder="1.00"
              />
            </div>

            {/* Coin Selector */}
            <div className="flex-[2] w-full flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Select Coin</label>
              <CoinSelector
                selectedCoinId={selectedCoin}
                onSelect={setSelectedCoin}
                coinsList={coinsList}
                loading={loadingList}
              />
            </div>

            {/* Swap Icon (Visual for now) */}
            <div className="flex items-center justify-center p-2 mb-1">
              <ArrowRightLeft className="text-muted" size={20} />
            </div>

            {/* Currency Selector */}
            <div className="flex-[2] w-full flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Select Currency</label>
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onSelect={setSelectedCurrency}
                currencies={currenciesList}
              />
            </div>

          </div>

          {/* Result Display */}
          <div className="flex flex-col gap-1 items-start bg-card/30 p-6 rounded-2xl border border-white/5">
            {loadingRate && !coinPriceBTC ? (
              <div className="h-10 w-1/2 bg-white/5 animate-pulse rounded"></div>
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl md:text-4xl font-bold text-white tracking-wide">
                  {formatCrypto(amount || 0, currentCoinData?.symbol)}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-muted">=</span>
                <span className="text-2xl md:text-4xl font-bold text-green-400 tracking-wide">
                  {formatCurrency(calculatedValue, selectedCurrency)}
                </span>
              </div>
            )}
            <span className="text-xs text-muted mt-2">
              Last updated: {lastUpdated ? new Date(lastUpdated * 1000).toLocaleString() : 'Just now'}
            </span>
          </div>

        </div>

        {/* Popular Crypto Pairs */}
        <div className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white">Popular Cryptocurrency Pairs</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularPairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(`/tools/converter/${pair.coin}/${pair.currency}`);
                }}
                className="text-left text-sm text-gray-400 hover:text-white hover:underline transition-all py-1"
              >
                {pair.coin === 'bitcoin' ? 'BTC' : pair.coin === 'ethereum' ? 'ETH' : pair.coin === 'ripple' ? 'XRP' : pair.coin === 'solana' ? 'SOL' : pair.coin.toUpperCase()} to {pair.currency.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Currencies */}
        <div className="w-full bg-[#0b0e11] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white">Crypto Prices in Popular Currencies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCurrencies.map((curr, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedCurrency(curr);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left text-sm text-gray-400 hover:text-white hover:underline transition-all py-1"
              >
                Crypto Price {curr.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}

export default Converter