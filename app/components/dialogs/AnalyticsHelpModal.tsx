import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface AnalyticsHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AnalyticsHelpModal({
  visible,
  onClose,
}: AnalyticsHelpModalProps) {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 500, padding: rs(32) }}
          className="bg-white rounded-xl shadow-lg"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Feather name="bar-chart-2" size={rs(24)} color="#1d4ed8" />
              </View>
              <Text
                style={{ fontSize: rf(24) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Analytics Guide
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: rs(4) }}>
              <Feather name="x" size={rs(24)} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textSecondary-light leading-relaxed"
          >
            The Analytics menu provides visual insights and detailed filtering
            options for equipment usage data.
          </Text>

          {/* Feature List */}
          <View style={{ gap: rs(20), marginBottom: rs(32) }}>
            {/* Feature 1 */}
            <View className="flex-row items-start">
              <Feather
                name="pie-chart"
                size={rs(20)}
                color="#1d4ed8"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  View Usage Trends
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Visualize equipment activity over time with detailed charts,
                  graphs, and performance metrics.
                </Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View className="flex-row items-start">
              <Feather
                name="calendar"
                size={rs(20)}
                color="#16a34a"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Custom Date Ranges
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Filter analytics data by specific days, weeks, or months to
                  analyze historical patterns and peak hours.
                </Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View className="flex-row items-start">
              <Feather
                name="download"
                size={rs(20)}
                color="#9333ea"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Export Reports
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Download analytics data as CSV or PDF files for external
                  reporting and permanent record-keeping.
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={{ paddingVertical: rs(14) }}
            className="bg-mainColor-light rounded-md items-center w-full"
            onPress={onClose}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-white"
            >
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
