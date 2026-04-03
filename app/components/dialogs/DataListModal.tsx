import { Feather } from "@expo/vector-icons";
import React from "react";
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
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function DataListModal({
  visible,
  onClose,
  title,
  icon,
  color,
  bg,
  data,
  activeFilter,
  onFilterChange,
}: DataListModalProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const filters = ["24 hours", "3 days", "7 days", "30 days", "All time"];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{
            width: isMobile ? "100%" : 480,
            maxHeight: "80%",
            padding: rs(24),
          }}
          className="bg-white rounded-2xl shadow-xl"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center flex-1 pr-4">
              <View className={`${bg} p-3 rounded-xl mr-4`}>
                <Feather name={icon} size={rs(22)} color={color} />
              </View>
              <Text
                style={{ fontSize: rf(18) }}
                className="font-inter-bold text-gray-900 flex-1"
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={rs(24)} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: rs(20) }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: rs(8) }}
            >
              {filters.map((f) => {
                const isActive = activeFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => onFilterChange(f)}
                    style={{
                      paddingVertical: rs(8),
                      paddingHorizontal: rs(14),
                      backgroundColor: isActive ? color : "#f1f5f9",
                      borderRadius: rs(20),
                    }}
                  >
                    <Text
                      style={{ fontSize: rf(13) }}
                      className={`font-inter-medium ${isActive ? "text-white" : "text-gray-600"}`}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: rs(16) }}
          >
            {data.length === 0 ? (
              <View style={{ paddingVertical: rs(40), alignItems: "center" }}>
                <Feather name="database" size={rs(32)} color="#cbd5e1" />
                <Text
                  style={{ fontSize: rf(15), marginTop: rs(12) }}
                  className="text-gray-400 font-inter"
                >
                  No records found for this period.
                </Text>
              </View>
            ) : (
              data.map((item, index) => (
                <View
                  key={index}
                  style={{ padding: rs(14), marginBottom: rs(8) }}
                  className="flex-row items-center bg-gray-50 rounded-xl border border-gray-100"
                >
                  <View
                    style={{
                      width: rs(30),
                      height: rs(30),
                      borderRadius: 15,
                      marginRight: rs(12),
                      backgroundColor:
                        index === 0
                          ? "#fbbf24"
                          : index === 1
                            ? "#94a3b8"
                            : index === 2
                              ? "#b45309"
                              : "#e2e8f0",
                    }}
                    className="items-center justify-center"
                  >
                    <Text
                      style={{ fontSize: rf(12) }}
                      className={`font-inter-bold ${index < 3 ? "text-white" : "text-gray-500"}`}
                    >
                      #{index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontSize: rf(15) }}
                      className="font-inter-bold text-gray-800"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{ fontSize: rf(13) }}
                      className="font-inter text-gray-500"
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{ paddingVertical: rs(14) }}
            className="bg-gray-900 rounded-xl items-center"
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="text-white font-inter-bold"
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
