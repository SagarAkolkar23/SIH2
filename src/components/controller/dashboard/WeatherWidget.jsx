import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { 
  Cloud, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Droplets, 
  Wind, 
  Eye, 
  Sunrise, 
  Sunset,
  MapPin,
  RefreshCw 
} from "lucide-react-native";
import { useWeatherQuery, formatWeatherData } from "../../../service/weatherService";
import { useCurrentLocation } from "../../../service/locationService";
import { useThemeStore } from "../../../store/themeStore";

export default function WeatherWidget({ isExpanded: externalIsExpanded, onToggleExpand }) {
  const { colors } = useThemeStore();
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  
  // Get GPS location
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    refetch: refetchLocation 
  } = useCurrentLocation(true);

  // Fetch weather data using GPS coordinates
  const { 
    data: weatherData, 
    isLoading: weatherLoading, 
    isError: weatherError, 
    refetch: refetchWeather 
  } = useWeatherQuery(
    location?.latitude, 
    location?.longitude, 
    !!location && !locationError
  );
  
  const formatted = formatWeatherData(weatherData);
  const isLoading = locationLoading || weatherLoading;

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded(!internalIsExpanded);
    }
  };

  const handleRefresh = () => {
    refetchLocation();
  };

  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!formatted) return <Cloud size={24} color={colors.accent} />;
    
    const iconCode = formatted.icon;
    if (iconCode.includes('01')) return <Sun size={24} color={colors.accent} />; // Clear sky
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) {
      return <Cloud size={24} color={colors.textSecondary} />; // Clouds
    }
    return <Cloud size={24} color={colors.accent} />;
  };

  // Show location error
  if (locationError) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Weather
            </Text>
            <Text
              style={{
                color: colors.error,
                fontSize: 12,
              }}
            >
              {locationError}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <RefreshCw size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* Collapsed Header */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flex: 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            getWeatherIcon()
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Weather
            </Text>
            {formatted && !isLoading && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                  gap: 4,
                }}
              >
                <MapPin size={12} color={colors.textTertiary} />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 11,
                  }}
                >
                  {formatted.city}
                </Text>
              </View>
            )}
          </View>
          {formatted && !isLoading && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {formatted.temperature}°C
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={toggleExpand}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 8 }}
        >
          {isExpanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {isLoading ? (
            <View
              style={{
                paddingVertical: 24,
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={colors.accent} />
              <Text
                style={{
                  color: colors.textSecondary,
                  marginTop: 12,
                  fontSize: 12,
                }}
              >
                {locationLoading ? "Getting your location..." : "Loading weather data..."}
              </Text>
            </View>
          ) : weatherError ? (
            <View
              style={{
                paddingVertical: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.error,
                  fontSize: 14,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Failed to load weather data
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                }}
              >
                <RefreshCw size={16} color={colors.accent} />
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : formatted ? (
            <>
              {/* Location Info */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                <MapPin size={14} color={colors.accent} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {formatted.city}, {formatted.country}
                </Text>
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 11,
                    marginLeft: 4,
                  }}
                >
                  ({location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)})
                </Text>
              </View>

              {/* Main Temperature */}
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {getWeatherIcon()}
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 36,
                      fontWeight: "700",
                    }}
                  >
                    {formatted.temperature}°C
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textTransform: "capitalize",
                    marginTop: 4,
                  }}
                >
                  {formatted.description}
                </Text>
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Feels like {formatted.feelsLike}°C
                </Text>
              </View>

              {/* Weather Details Grid */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {/* Humidity */}
                <View
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: colors.surfaceSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Droplets size={16} color={colors.accent} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      Humidity
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {formatted.humidity}%
                  </Text>
                </View>

                {/* Wind Speed */}
                <View
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: colors.surfaceSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Wind size={16} color={colors.accent} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      Wind Speed
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {formatted.windSpeed} m/s
                  </Text>
                </View>

                {/* Visibility */}
                <View
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: colors.surfaceSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Eye size={16} color={colors.accent} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      Visibility
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {formatted.visibility} km
                  </Text>
                </View>

                {/* Pressure */}
                <View
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    backgroundColor: colors.surfaceSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Cloud size={16} color={colors.accent} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      Pressure
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {formatted.pressure} hPa
                  </Text>
                </View>
              </View>

              {/* Sunrise/Sunset */}
              {(formatted.sunrise || formatted.sunset) && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {formatted.sunrise && (
                    <View
                      style={{
                        alignItems: "center",
                      }}
                    >
                      <Sunrise size={20} color={colors.accent} />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        Sunrise
                      </Text>
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: "600",
                          marginTop: 2,
                        }}
                      >
                        {formatted.sunrise.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                  {formatted.sunset && (
                    <View
                      style={{
                        alignItems: "center",
                      }}
                    >
                      <Sunset size={20} color={colors.accent} />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        Sunset
                      </Text>
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: "600",
                          marginTop: 2,
                        }}
                      >
                        {formatted.sunset.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Refresh Button */}
              <TouchableOpacity
                onPress={handleRefresh}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 12,
                  paddingVertical: 8,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 8,
                }}
              >
                <RefreshCw size={14} color={colors.accent} />
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Refresh Location & Weather
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                paddingVertical: 24,
              }}
            >
              No weather data available
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
