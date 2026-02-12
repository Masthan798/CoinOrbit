import { coingeckoFetch } from "../api/coingeckoClient";

export function AllcoinsData(){
    return coingeckoFetch("/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=215&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d")
}



export function CategoriesData(){
    return coingeckoFetch("/coins/categories");
}


export function TreasuriesData(coinId = 'bitcoin'){
    return coingeckoFetch(`companies/public_treasury/${coinId}?per_page=250&page=1&order=total_holdings_usd_desc`)
}

export function ExchagesData(per_page = 50, page = 1){
    return coingeckoFetch(`/exchanges?per_page=${per_page}&page=${page}`)
}

export function DerivativesData(){
    return coingeckoFetch('/derivatives/exchanges')
}

export function PerpDerivativesData(){
    return coingeckoFetch('/derivatives')
}

export function CoinDetailData(coinId,coinName,coinSymbol){
    return coingeckoFetch(`simple/price?vs_currencies=usd&ids=${coinId}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`)
}

export function CoinMarketChartData(coinId, days = '7', interval) {
    const intervalParam = interval === 'daily' ? `&interval=daily` : '';
    return coingeckoFetch(`/coins/${coinId}/market_chart?vs_currency=usd&days=${days}${intervalParam}`);
}

export function CoinOHLCData(coinId, days = '7') {
    return coingeckoFetch(`/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
}

export function CoinMarketChartRangeData(coinId, from, to) {
    return coingeckoFetch(`/coins/${coinId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`);
}


export function ExchageDetailesData(ExchageId){
    return coingeckoFetch(`exchanges/${ExchageId}/tickers?coin_ids=all&include_exchange_logo=true&depth=true`)
}


export function ExchageDetailesDataCharts(ExchageId,days){
    return coingeckoFetch(`exchanges/${ExchageId}/volume_chart?days=${days}`)
}

export function CoinNewsData(coinId) {
    // Using a mock or aggregator since CoinGecko /news might be restrictive or general.
    // For now using CoinGecko's status updates or similar if available, or just general news.
    // actually CoinGecko has a /news endpoint but it's general. content is not always specific to a coin ID in the free API easily without filtering
    // We will use the /status_updates endpoint which is specific to coin, although "News" is better.
    // Let's try to mock it or use a public crypto news RSS converted to JSON if possible,
    // but sticking to CoinGecko: /coins/{id}/status_updates
    return coingeckoFetch(`/coins/${coinId}/status_updates?per_page=5&page=1`);
}