import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Hook to get user's current GPS location
 * @param {boolean} enabled - Whether to fetch location
 * @returns {Object} - { location, loading, error, refetch }
 */
export const useCurrentLocation = (enabled = true) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if location services are enabled
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location permissions in settings.');
        Alert.alert(
          'Location Permission Required',
          'This app needs access to your location to provide accurate weather information. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Get current position with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // High accuracy for precise weather
        maximumAge: 300000, // Cache for 5 minutes
        timeout: 10000, // 10 second timeout
      });

      const { latitude, longitude } = currentLocation.coords;
      
      console.log('📍 [LOCATION] GPS coordinates obtained:', { latitude, longitude });
      
      setLocation({
        latitude,
        longitude,
        timestamp: currentLocation.timestamp,
      });

      setLoading(false);
    } catch (err) {
      console.error('❌ [LOCATION] Error getting location:', err);
      setError(err.message || 'Failed to get location');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      getLocation();
    }
  }, [enabled]);

  return {
    location,
    loading,
    error,
    refetch: getLocation,
  };
};


