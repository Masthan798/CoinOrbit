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
