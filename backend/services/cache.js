// cache.js
// Simple in-memory cache to reduce API calls and avoid rate limits
// This stores data in memory (data is lost when server restarts)

// Cache storage object
// Format: { "key": { data: ..., timestamp: ... } }
const cache = {};

// Cache duration in milliseconds
// 5 minutes = 5 * 60 * 1000 = 300000 milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ========================================
// FUNCTION: Get data from cache
// ========================================
// This function checks if cached data exists and is still valid
// Returns the cached data if found and not expired, otherwise returns null
function getCache(key) {
  // Check if key exists in cache
  if (!cache[key]) {
    return null; // No cached data found
  }

  // Get the cached item
  const cachedItem = cache[key];
  
  // Check if cache has expired
  const now = Date.now();
  const age = now - cachedItem.timestamp;
  
  if (age > CACHE_DURATION) {
    // Cache expired, remove it and return null
    delete cache[key];
    return null;
  }

  // Cache is still valid, return the data
  return cachedItem.data;
}

// ========================================
// FUNCTION: Store data in cache
// ========================================
// This function saves data to cache with current timestamp
function setCache(key, data) {
  cache[key] = {
    data: data,
    timestamp: Date.now()
  };
  
  console.log("Data cached with key:", key);
}

// ========================================
// FUNCTION: Clear cache (optional helper)
// ========================================
// This function clears all cached data
// Useful for testing or when you want to force fresh data
function clearCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
  console.log("Cache cleared");
}

// Export functions so they can be used in other files
export { getCache, setCache, clearCache };

