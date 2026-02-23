import { coingeckoFetch } from "../api/coingeckoClient";

export function AllcoinsData(per_page = 100, page = 1, vs_currency = 'usd', order = 'market_cap_desc', price_change = '1h,24h,7d,30d'){
    return coingeckoFetch(`/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=${price_change}`)
}

export function GlobalData(){
    return coingeckoFetch("/global");
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
  
    return coingeckoFetch(`/coins/${coinId}/status_updates?per_page=5&page=1`);
}

export function TrendingCoinsData() {
    return coingeckoFetch('/search/trending');
}