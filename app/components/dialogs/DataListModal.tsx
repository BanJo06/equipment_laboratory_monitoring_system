import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export interface DataItem {
  label: string;
  value: string | number;
}

interface DataListModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: any;
  color: string;
  bg: string;
  data: DataItem[];
  onFilterChange?: (filter: string) => void;
}

export default function DataListModal({
  visible,
  onClose,
  title,
  icon,
  color,
  bg,
  data,
  onFilterChange,
}: DataListModalProps) {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- FILTER STATE ---
  const [activeFilter, setActiveFilter] = useState("All time");
  const filters = ["24 hours", "3 days", "7 days", "30 days", "All time"];

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        <View
          style={{ width: isMobile ? "100%" : 450, padding: rs(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className={`${bg} p-3 rounded-full mr-4`}>
                <Feather name={icon} size={rs(24)} color={color} />
              </View>
              <Text
                style={{ fontSize: rf(20) }}
                className="font-inter-bold text-textPrimary-light flex-1"
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: rs(4) }}>
              <Feather name="x" size={rs(24)} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* FILTER MENU */}
          <View style={{ marginBottom: rs(16) }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: rs(8), paddingBottom: rs(4) }}
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => handleFilterSelect(filter)}
                    style={{
                      paddingVertical: rs(6),
                      paddingHorizontal: rs(12),
                      backgroundColor: isActive ? color : "#f1f5f9",
                      borderRadius: rs(20),
                      borderWidth: 1,
                      borderColor: isActive ? color : "#e2e8f0",
                    }}
                  >
                    <Text
                      style={{ fontSize: rf(14) }}
                      className={`font-inter ${
                        isActive
                          ? "font-inter-bold text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* LEADERBOARD LIST */}
          <View style={{ maxHeight: rs(400) }}>
            <ScrollView showsVerticalScrollIndicator={true}>
              {data.length === 0 ? (
                <Text
                  style={{ fontSize: rf(16), paddingVertical: rs(20) }}
                  className="font-inter text-gray-500 text-center"
                >
                  Not enough data available yet.
                </Text>
              ) : (
                data.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      paddingVertical: rs(16),
                      paddingHorizontal: rs(12),
                      marginBottom: rs(8),
                    }}
                    className="flex-row items-center bg-gray-50 rounded-lg border border-gray-100"
                  >
                    {/* Rank Badge */}
                    <View
                      style={{
                        width: rs(32),
                        height: rs(32),
                        marginRight: rs(16),
                        backgroundColor:
                          index === 0
                            ? "#f59e0b"
                            : index === 1
                              ? "#94a3b8"
                              : index === 2
                                ? "#b45309"
                                : "#e2e8f0",
                      }}
                      className="rounded-full items-center justify-center"
                    >
                      <Text
                        style={{ fontSize: rf(14) }}
                        className={`font-inter-bold ${
                          index < 3 ? "text-white" : "text-gray-600"
                        }`}
                      >
                        #{index + 1}
                      </Text>
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <Text
                        style={{ fontSize: rf(16), marginBottom: rs(2) }}
                        className="font-inter-bold text-textPrimary-light"
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="font-inter text-gray-500"
                      >
                        {item.value}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* CLOSE BUTTON */}
          <TouchableOpacity
            style={{
              width: "100%",
              paddingVertical: rs(14),
              marginTop: rs(16),
            }}
            className="bg-gray-100 rounded-md items-center"
            onPress={onClose}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-gray-700"
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
