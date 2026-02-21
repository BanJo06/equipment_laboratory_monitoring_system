import { SVG_ICONS } from "@/assets/constants/icons";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function UsageHistory() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size) => size * scale;
  const rs = (size) => size * scale;

  return (
    <View
      style={{
        flex: 1,
        padding: rs(32),
        minHeight: isMobile ? rs(450) : undefined,
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      <View
        style={{
          marginBottom: rs(16),
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            gap: rs(16),
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 1,
          }}
        >
          <SVG_ICONS.UsageHistory size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Usage History
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Check every equipment used
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      <View className="flex-row justify-end mb-4">
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-mainColor-light rounded-md"
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Date Picker
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ padding: rs(32) }}
          className="bg-white rounded-lg border-[2px] border-borderStrong-light"
        >
          <View
            style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
            className="flex-row border-b border-[#6684B0]"
          >
            <Text
              style={{ fontSize: rf(16), flex: 1.5 }}
              className="font-inter-bold text-textPrimary-light"
            >
              User
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 0.5 }}
              className="text-center font-inter-bold text-textPrimary-light"
            >
              Equipment
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 1.5 }}
              className="text-right font-inter-bold text-textPrimary-light"
            >
              Time Used
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 1.2 }}
              className="text-right font-inter-bold text-textPrimary-light"
            >
              Duration
            </Text>
          </View>
          {["J. Dela Cruz", "C. Lozano", "D. Yokingco"].map((item, idx) => (
            <View
              key={idx}
              style={{ paddingVertical: rs(8) }}
              className={`flex-row items-center ${idx !== 2 ? "border-b border-[#DADFE5]" : ""}`}
            >
              <Text
                style={{ fontSize: rf(16), flex: 1.5 }}
                className="font-inter text-textPrimary-light"
                numberOfLines={1}
              >
                {item}
              </Text>
              <Text
                style={{ fontSize: rf(16), flex: 0.5 }}
                className="font-inter text-center text-textPrimary-light"
              >
                Microscope A
              </Text>
              <Text
                style={{ fontSize: rf(16), flex: 1.5 }}
                className="font-inter text-center text-textPrimary-light"
              >
                11:00AM-4:00PM
              </Text>
              <Text
                style={{ fontSize: rf(16), flex: 1.2 }}
                className="font-inter text-right text-textPrimary-light"
              >
                5H:30
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
