import { WeatherData } from '../types';

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes in milliseconds

let inMemoryWeatherCache: WeatherData | null = null;

/**
 * Fetch smart weather and packing recommendations with 45-minute cache defense.
 */
export async function getSmartWeather(lat: number = 13.0827, lng: number = 80.2707, forceRefresh = false): Promise<WeatherData> {
  const now = Date.now();

  // Zero-Waste Cache Check
  if (!forceRefresh && inMemoryWeatherCache && (now - inMemoryWeatherCache.cachedAt) < CACHE_TTL_MS) {
    return inMemoryWeatherCache;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const tempC = Math.round(data.main?.temp ?? 24);
    const condition = data.weather?.[0]?.main ?? 'Clear';
    const humidityPct = data.main?.humidity ?? 60;
    const rainPct = data.rain ? 80 : (condition.toLowerCase().includes('rain') ? 70 : 15);
    const city = data.name || 'Your City';

    // Formulate artisanal packing recommendation
    let recommendation = 'Clear skies ahead. Your standard daily essentials are ready.';
    if (rainPct > 40) {
      recommendation = `Rain forecast in ${city} (${rainPct}%). Keep your compact umbrella packed.`;
    } else if (tempC > 30) {
      recommendation = `Warm day in ${city} (${tempC}°C). Smart bottle hydration reminder is active.`;
    } else if (tempC < 14) {
      recommendation = `Brisk chill today (${tempC}°C). Consider packing your layer or scarf.`;
    }

    const weatherPayload: WeatherData = {
      city,
      tempC,
      condition,
      rainProbabilityPct: rainPct,
      uvIndex: 5,
      humidityPct,
      packingRecommendation: recommendation,
      cachedAt: now,
    };

    inMemoryWeatherCache = weatherPayload;
    return weatherPayload;
  } catch (error) {
    console.warn('Unable to load live weather, using graceful offline fallback:', error);

    // Graceful offline fallback
    const fallback: WeatherData = {
      city: 'Your City',
      tempC: 25,
      condition: 'Partly Cloudy',
      rainProbabilityPct: 20,
      uvIndex: 4,
      humidityPct: 58,
      packingRecommendation: 'Mild conditions today. All standard bag essentials ready.',
      cachedAt: now,
    };
    return inMemoryWeatherCache || fallback;
  }
}
