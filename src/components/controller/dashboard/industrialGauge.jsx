// src/components/dashboard/IndustrialGauge.js
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Path, Line, Text as SvgText } from "react-native-svg";
import { Platform } from "react-native";
import { useThemeStore } from "../../../store/themeStore";

const IndustrialGauge = ({
  value,
  max,
  label,
  unit,
  icon: Icon,
  lowWarning = 0,
  highWarning,
  greenZoneStart,
  greenZoneEnd,
}) => {
  const { colors } = useThemeStore();
  const numericValue = Number(value) || 0;
  const clamped = Math.max(0, Math.min(numericValue, max));

  // Calculate needle angle (-135deg to +135deg = 270deg total range)
  const angle = -135 + (clamped / max) * 270;

  const status = (() => {
    if (numericValue < lowWarning) return "LOW";
    if (numericValue > highWarning) return "HIGH";
    return "NORMAL";
  })();

  const statusColor =
    status === "LOW" ? colors.warning : status === "HIGH" ? colors.error : colors.success;

  // Helper function for SVG arc path
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Generate tick marks and labels
  const renderTicks = () => {
    const ticks = [];
    const majorTickCount = 11;
    const minorTicksPerMajor = 4;

    for (let i = 0; i < majorTickCount; i++) {
      const tickValue = (max / (majorTickCount - 1)) * i;
      const tickAngle = -135 + (i / (majorTickCount - 1)) * 270;
      const isMajor = true;

      // Major tick
      const majorStart = polarToCartesian(100, 100, 82, tickAngle);
      const majorEnd = polarToCartesian(100, 100, 70, tickAngle);

      ticks.push(
        <Line
          key={`major-${i}`}
          x1={majorStart.x}
          y1={majorStart.y}
          x2={majorEnd.x}
          y2={majorEnd.y}
          stroke={colors.borderDark}
          strokeWidth="2"
        />
      );

      // Label
      const labelPos = polarToCartesian(100, 100, 60, tickAngle);
      ticks.push(
        <SvgText
          key={`label-${i}`}
          x={labelPos.x}
          y={labelPos.y}
          fill={colors.textTertiary}
          fontSize="9"
          fontWeight="600"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {Math.round(tickValue)}
        </SvgText>
      );

      // Minor ticks
      if (i < majorTickCount - 1) {
        for (let j = 1; j <= minorTicksPerMajor; j++) {
          const minorTickAngle =
            tickAngle +
            (270 / (majorTickCount - 1)) * (j / (minorTicksPerMajor + 1));
          const minorStart = polarToCartesian(100, 100, 82, minorTickAngle);
          const minorEnd = polarToCartesian(100, 100, 76, minorTickAngle);

          ticks.push(
            <Line
              key={`minor-${i}-${j}`}
              x1={minorStart.x}
              y1={minorStart.y}
              x2={minorEnd.x}
              y2={minorEnd.y}
              stroke={colors.border}
              strokeWidth="1"
            />
          );
        }
      }
    }
    return ticks;
  };

  // Needle points
  const needleBase = polarToCartesian(100, 100, 8, angle);
  const needleTip = polarToCartesian(100, 100, 68, angle);
  const needleLeft = polarToCartesian(100, 100, 8, angle - 180 + 10);
  const needleRight = polarToCartesian(100, 100, 8, angle - 180 - 10);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: 16,
      }}
    >
      {/* Label Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        {Icon && <Icon size={20} color={colors.textTertiary} style={{ marginRight: 8 }} />}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </View>

      {/* Gauge Face */}
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 200,
          padding: 20,
          borderWidth: 3,
          borderColor: colors.borderLight,
        }}
      >
        <Svg width={200} height={200}>
          {/* Colored Arc Zones */}
          {/* Low (Yellow) Zone */}
          <Path
            d={describeArc(100, 100, 78, -135, (lowWarning / max) * 270 - 135)}
            fill="none"
            stroke={colors.warning}
            strokeWidth="6"
            opacity="0.3"
          />

          {/* Green Zone */}
          <Path
            d={describeArc(
              100,
              100,
              78,
              (greenZoneStart / max) * 270 - 135,
              (greenZoneEnd / max) * 270 - 135
            )}
            fill="none"
            stroke={colors.success}
            strokeWidth="6"
            opacity="0.4"
          />

          {/* High (Red) Zone */}
          <Path
            d={describeArc(100, 100, 78, (highWarning / max) * 270 - 135, 135)}
            fill="none"
            stroke={colors.error}
            strokeWidth="6"
            opacity="0.3"
          />

          {/* Tick marks and labels */}
          {renderTicks()}

          {/* Needle */}
          <Path
            d={`M ${needleLeft.x} ${needleLeft.y} L ${needleTip.x} ${needleTip.y} L ${needleRight.x} ${needleRight.y} Z`}
            fill={statusColor}
            stroke={statusColor}
            strokeWidth="1"
          />

          {/* Center hub */}
          <Circle
            cx={100}
            cy={100}
            r={10}
            fill={colors.surface}
            stroke={colors.borderDark}
            strokeWidth="2"
          />
          <Circle cx={100} cy={100} r={6} fill={statusColor} />
        </Svg>
      </View>

      {/* Digital Readout */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.surfaceTertiary,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: statusColor,
              fontSize: 36,
              fontWeight: "700",
              fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
            }}
          >
            {typeof value === "number" ? value.toFixed(1) : value}
          </Text>
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 18,
              fontWeight: "600",
              marginLeft: 6,
            }}
          >
            {unit}
          </Text>
        </View>
        <Text
          style={{
            color: statusColor,
            fontSize: 11,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {status}
        </Text>
      </View>
    </View>
  );
};

export default IndustrialGauge;
