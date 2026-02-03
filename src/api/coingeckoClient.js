const MAIN_BASE_URL = import.meta.env.VITE_BASE_URL || "https://api.coingecko.com/api/v3";

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

export async function coingeckoFetch(endpoint) {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${MAIN_BASE_URL}${formattedEndpoint}`, {
    method: "GET",
    headers: {
      "x-cg-demo-api-key": API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`CoinOrbit Error: ${res.status}`);
  }

  return res.json();
}
