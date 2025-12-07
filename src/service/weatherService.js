import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Weather API configuration
// Using Open-Meteo - Free, no API key required
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Query Keys
const WEATHER_KEYS = {
  current: (lat, lon) => ["weather", "current", lat, lon],
};

/**
 * Convert WMO weather code to description and icon
 */
const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: { desc: 'Clear sky', icon: '01d' },
    1: { desc: 'Mainly clear', icon: '02d' },
    2: { desc: 'Partly cloudy', icon: '03d' },
    3: { desc: 'Overcast', icon: '04d' },
    45: { desc: 'Foggy', icon: '50d' },
    48: { desc: 'Depositing rime fog', icon: '50d' },
    51: { desc: 'Light drizzle', icon: '09d' },
    53: { desc: 'Moderate drizzle', icon: '09d' },
    55: { desc: 'Dense drizzle', icon: '09d' },
    56: { desc: 'Light freezing drizzle', icon: '09d' },
    57: { desc: 'Dense freezing drizzle', icon: '09d' },
    61: { desc: 'Slight rain', icon: '10d' },
    63: { desc: 'Moderate rain', icon: '10d' },
    65: { desc: 'Heavy rain', icon: '10d' },
    66: { desc: 'Light freezing rain', icon: '10d' },
    67: { desc: 'Heavy freezing rain', icon: '10d' },
    71: { desc: 'Slight snow fall', icon: '13d' },
    73: { desc: 'Moderate snow fall', icon: '13d' },
    75: { desc: 'Heavy snow fall', icon: '13d' },
    77: { desc: 'Snow grains', icon: '13d' },
    80: { desc: 'Slight rain showers', icon: '09d' },
    81: { desc: 'Moderate rain showers', icon: '09d' },
    82: { desc: 'Violent rain showers', icon: '09d' },
    85: { desc: 'Slight snow showers', icon: '13d' },
    86: { desc: 'Heavy snow showers', icon: '13d' },
    95: { desc: 'Thunderstorm', icon: '11d' },
    96: { desc: 'Thunderstorm with slight hail', icon: '11d' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '11d' },
  };
  return weatherCodes[code] || { desc: 'Unknown', icon: '01d' };
};

/**
 * Fetch location name using reverse geocoding
 * Using Nominatim (OpenStreetMap) - Free reverse geocoding service
 */
const fetchLocationName = async (lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'WeatherApp/1.0', // Required by Nominatim
      },
    });
    
    if (response.data && response.data.address) {
      const addr = response.data.address;
      return {
        city: addr.city || addr.town || addr.village || addr.municipality || 'Unknown',
        country: addr.country_code?.toUpperCase() || '',
      };
    }
  } catch (error) {
    // If geocoding fails, just return defaults
  }
  
  return { city: 'Unknown', country: '' };
};

/**
 * Fetch current weather data using GPS coordinates
 * @param {number} lat - Latitude from GPS
 * @param {number} lon - Longitude from GPS
 * @param {boolean} enabled - Whether to enable the query
 */
export const useWeatherQuery = (lat, lon, enabled = true) => {
  return useQuery({
    queryKey: WEATHER_KEYS.current(lat, lon),
    queryFn: async () => {
      if (!lat || !lon) {
        throw new Error('Location coordinates are required');
      }

      // Fetch weather, astronomy, and location data in parallel
      const [weatherResponse, locationInfo] = await Promise.all([
        // Combined weather and astronomy data in a single request
        axios.get(WEATHER_BASE_URL, {
          params: {
            latitude: lat,
            longitude: lon,
            current: [
              'temperature_2m',
              'relative_humidity_2m',
              'apparent_temperature',
              'weather_code',
              'wind_speed_10m',
              'wind_direction_10m',
              'pressure_msl',
              'visibility',
            ].join(','),
            daily: ['sunrise', 'sunset'],
            timezone: 'auto',
          },
        }),
        // Location name
        fetchLocationName(lat, lon),
      ]);
      
      return {
        weather: weatherResponse.data,
        location: locationInfo,
        coordinates: { lat, lon },
      };
    },
    enabled: enabled && !!lat && !!lon,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Format weather data for display
 */
export const formatWeatherData = (weatherData) => {
  if (!weatherData) return null;
  
  const current = weatherData.weather?.current;
  const daily = weatherData.weather?.daily;
  const weatherInfo = getWeatherDescription(current?.weather_code || 0);
  
  // Parse sunrise/sunset times (Open-Meteo returns ISO strings)
  const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;
  
  // Convert visibility - Open-Meteo returns in meters
  const visibilityKm = current?.visibility 
    ? (current.visibility >= 10 ? (current.visibility / 1000).toFixed(1) : current.visibility.toFixed(1))
    : 0;
  
  // Wind speed is in m/s from Open-Meteo, keeping it as m/s for display
  const windSpeed = current?.wind_speed_10m ? Number(current.wind_speed_10m.toFixed(1)) : 0;
  
  return {
    temperature: Math.round(current?.temperature_2m || 0),
    feelsLike: Math.round(current?.apparent_temperature || 0),
    description: weatherInfo.desc,
    icon: weatherInfo.icon,
    humidity: Math.round(current?.relative_humidity_2m || 0),
    pressure: Math.round(current?.pressure_msl || 0),
    windSpeed: windSpeed,
    windDirection: Math.round(current?.wind_direction_10m || 0),
    visibility: visibilityKm,
    city: weatherData.location?.city || 'Unknown',
    country: weatherData.location?.country || '',
    sunrise: sunrise,
    sunset: sunset,
    coordinates: {
      lat: weatherData.coordinates?.lat,
      lon: weatherData.coordinates?.lon,
    },
  };
};
