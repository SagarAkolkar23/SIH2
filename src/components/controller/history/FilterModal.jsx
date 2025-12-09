import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  X,
  Check,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useThemeStore } from "../../../store/themeStore";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FilterModal = ({
  visible,
  onClose,
  onApply,
  currentDateFilter,
  currentAreaFilter,
}) => {
  const { colors, theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState(currentDateFilter);
  const [selectedArea, setSelectedArea] = useState(currentAreaFilter);

  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    if (visible) {
      setSelectedDate(currentDateFilter);
      setSelectedArea(currentAreaFilter);
      setExpandedSection(null);
    }
  }, [visible]);

  const toggleSection = (section) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleApply = () => {
    onApply(selectedDate, selectedArea);
    onClose();
  };

  const handleReset = () => {
    setSelectedDate("last7days");
    setSelectedArea("all");
  };

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last 3 Months", value: "last3months" },
  ];

  const areaOptions = [
    { label: "All Areas", value: "all" },
    { label: "Area A - Main Grid", value: "Area A" },
    { label: "Area B - Solar Farm", value: "Area B" },
    { label: "Area C - Battery Storage", value: "Area C" },
  ];

  const SectionCard = ({
    title,
    selectedLabel,
    icon: Icon,
    sectionKey,
    options,
    selectedValue,
    onSelect,
  }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 14,
      }}
    >
      <TouchableOpacity
        onPress={() => toggleSection(sectionKey)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon size={18} color={colors.success} />
          <Text
            style={{
              marginLeft: 10,
              color: colors.textPrimary,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
        </View>

        {expandedSection === sectionKey ? (
          <ChevronUp size={20} color={colors.success} />
        ) : (
          <ChevronDown size={20} color={colors.textTertiary} />
        )}
      </TouchableOpacity>

      {/* Display Selected Value */}
      <Text style={{ marginTop: 6, color: colors.textTertiary, fontSize: 13 }}>
        {selectedLabel}
      </Text>

      {expandedSection === sectionKey && (
        <View style={{ marginTop: 12 }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                onSelect(opt.value);
              }}
              style={{
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {selectedValue === opt.value ? (
                <Check size={20} color={colors.success} />
              ) : (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: colors.borderDark,
                  }}
                />
              )}
              <Text style={{ marginLeft: 12, color: colors.textPrimary, fontSize: 14 }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: "85%",
          }}
        >
          {/* Header */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "800" }}>
              Filters
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ marginTop: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <SectionCard
              title="Date Range"
              icon={Calendar}
              sectionKey="date"
              selectedLabel={
                dateOptions.find((d) => d.value === selectedDate).label
              }
              options={dateOptions}
              selectedValue={selectedDate}
              onSelect={setSelectedDate}
            />

            <SectionCard
              title="Location"
              icon={MapPin}
              sectionKey="area"
              selectedLabel={
                areaOptions.find((d) => d.value === selectedArea).label
              }
              options={areaOptions}
              selectedValue={selectedArea}
              onSelect={setSelectedArea}
            />
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            onPress={handleApply}
            style={{
              backgroundColor: colors.success,
              padding: 16,
              borderRadius: 12,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: theme === "dark" ? colors.textPrimary : "#000",
                textAlign: "center",
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
