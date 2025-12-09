// src/components/history/FilterSummaryCard.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Filter, Calendar, MapPin } from "lucide-react-native";
import { useThemeStore } from "../../../store/themeStore";

const FilterSummaryCard = ({ dateLabel, areaLabel, recordCount, onPress }) => {
  const { colors } = useThemeStore();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.success,
      }}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: `${colors.success}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Filter size={18} color={colors.success} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.success,
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Active Filters
          </Text>
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 10,
              marginTop: 2,
            }}
          >
            Tap to modify filters
          </Text>
        </View>
      </View>

      {/* Filter Details */}
      <View
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 10,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Date Filter */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.surface,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Calendar size={14} color={colors.textTertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginBottom: 2,
              }}
            >
              Date Range
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {dateLabel}
            </Text>
          </View>
        </View>

        {/* Area Filter */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.surface,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MapPin size={14} color={colors.textTertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginBottom: 2,
              }}
            >
              Location
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {areaLabel}
            </Text>
          </View>
        </View>

        {/* Record Count */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 4,
          }}
        >
          <Text
            style={{
              color: colors.success,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {recordCount}
          </Text>
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 11,
              marginLeft: 4,
            }}
          >
            records found
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FilterSummaryCard;
