import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface HomeHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function HomeHelpModal({
  visible,
  onClose,
}: HomeHelpModalProps) {
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
                <Feather name="play-circle" size={rs(24)} color="#1d4ed8" />
              </View>
              <Text
                style={{ fontSize: rf(24) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Active Sessions Guide
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
            The Active Sessions dashboard provides a live, birds-eye view of all
            ongoing equipment usage across the laboratory.
          </Text>

          {/* Feature List */}
          <View style={{ gap: rs(20), marginBottom: rs(32) }}>
            <View className="flex-row items-start">
              <Feather
                name="activity"
                size={rs(20)}
                color="#16a34a"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Live Monitoring
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Watch sessions appear and disappear instantly. The interface
                  syncs with the database in real-time, requiring no manual
                  refreshes.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Feather
                name="users"
                size={rs(20)}
                color="#1d4ed8"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  User Grouping
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Easily identify who is working on what. If a researcher is
                  using multiple pieces of equipment simultaneously, they are
                  neatly grouped under their profile.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Feather
                name="clock"
                size={rs(20)}
                color="#f59e0b"
                style={{ marginTop: rs(2), marginRight: rs(16) }}
              />
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textPrimary-light mb-1"
                >
                  Active Timers
                </Text>
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textSecondary-light leading-relaxed"
                >
                  Track exactly how long equipment has been in use down to the
                  second with live, ticking duration badges.
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
