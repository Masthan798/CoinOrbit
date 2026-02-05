const MAIN_BASE_URL = (import.meta.env.VITE_BASE_URL || "https://api.coingecko.com/api/v3").trim().replace(/\/+$/, "");
const API_KEY = (import.meta.env.VITE_COINGECKO_API_KEY || "").trim();

// In-memory cache to store API responses
const apiCache = new Map();
// Map to track pending requests for de-duplication
const pendingRequests = new Map();

// Cache duration in milliseconds - increased to 5 minutes to reduce API pressure
const CACHE_DURATION = 300000;

export async function coingeckoFetch(endpoint) {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${MAIN_BASE_URL}${formattedEndpoint}`;

  // 1. Check if we have a valid cached response (Stale-While-Revalidate entry)
  const cached = apiCache.get(url);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  // 2. Check if there's an ongoing request for this URL
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }

  // 3. Perform the fetch and track it
  const fetchPromise = (async () => {
    try {
      // Use query parameters for authentication to avoid CORS preflight (OPTIONS) requests.
      // Preflights are often rate-limited on the Demo plan, causing "Failed to fetch" (CORS error).
      
      let finalUrl = url;
      if (API_KEY !== "") {
        const isDemoKey = API_KEY.startsWith("CG-");
        const isProDomain = MAIN_BASE_URL.includes('pro-api.coingecko.com');
        const paramName = (isProDomain || !isDemoKey) ? 'x_cg_pro_api_key' : 'x_cg_demo_api_key';
        
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}${paramName}=${API_KEY}`;
        
        if (import.meta.env.DEV) {
          console.debug(`[CoinGecko] Authenticating via param: ${paramName}`);
        }
      }

      const res = await fetch(finalUrl, {
        method: "GET",
        // No custom headers = "simple" request = NO PREFLIGHT = NO CORS HEADACHE
        mode: 'cors',
        cache: 'no-cache'
      });

      if (res.status === 401) {
        throw new Error("API Key Unauthorized (401). Please verify your VITE_COINGECKO_API_KEY.");
      }

      if (res.status === 429) {
        console.warn("CoinGecko Rate Limit (429). Attempting fallback to stale data.");
        if (cached) {
          console.info("Fallback: Serving stale data from cache for", url);
          return cached.data;
        }
        throw new Error("Rate limit exceeded. Please wait a moment.");
      }

      if (!res.ok) {
        // For other errors, still try to fallback to stale data if available
        if (cached) return cached.data;
        throw new Error(`CoinOrbit Error: ${res.status}`);
      }

      const data = await res.json();
      
      // Update cache
      apiCache.set(url, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error("[CoinGecko] Network error or CORS block. Check if API key header is allowed or if domain is accessible.");
      }
      throw error;
    } finally {
      // Clean up pending request
      pendingRequests.delete(url);
    }
  })();

  pendingRequests.set(url, fetchPromise);
  return fetchPromise;
}
