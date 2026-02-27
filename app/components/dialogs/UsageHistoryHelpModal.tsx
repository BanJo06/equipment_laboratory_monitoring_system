import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface UsageHistoryHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UsageHistoryHelpModal({
  visible,
  onClose,
}: UsageHistoryHelpModalProps) {
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
                <Feather name="list" size={rs(24)} color="#1d4ed8" />
              </View>
              <Text
                style={{ fontSize: rf(24) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Usage History Guide
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
            The Usage History menu serves as the central ledger for all
            laboratory equipment activities and sessions.
          </Text>

          {/* Feature List */}
          <View style={{ gap: rs(20), marginBottom: rs(32) }}>
            <View className="flex-row items-start">
              <Feather
                name="clock"
                size={rs(20)}
                color="#1d4ed8"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Track Live Durations
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Monitor ongoing sessions with real-time ticking clocks for any
                  equipment currently marked as "In Use".
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Feather
                name="filter"
                size={rs(20)}
                color="#16a34a"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Sort & Organize
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Click table headers to arrange logs in ascending or descending
                  order by user, equipment name, or time used.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Feather
                name="trash-2"
                size={rs(20)}
                color="#dc2626"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Manage Records
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Use the checkboxes to select multiple completed or cancelled
                  logs for bulk deletion. Active sessions cannot be deleted.
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
