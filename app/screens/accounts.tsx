import { SVG_ICONS } from "@/assets/constants/icons";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";

export default function Accounts() {
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
          <SVG_ICONS.Accounts size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Accounts
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Manage accounts
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ padding: rs(16), marginBottom: rs(16) }}
          className="bg-gray-200 rounded-xl"
        >
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons
              name="microscope"
              size={rs(20)}
              color="#1d4ed8"
            />
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textPrimary-light ml-2"
            >
              Microscope A
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: rs(16),
              paddingVertical: rs(12),
              flexDirection: "row",
              gap: rs(8),
            }}
            className="bg-white items-center rounded-xl self-start shadow-sm border border-gray-100"
          >
            <Feather name="clock" size={rs(20)} color="#112747" />
            <Text
              style={{ fontSize: rf(14) }}
              className="text-textPrimary-light font-inter ml-2"
            >
              Started: 8:00 AM
            </Text>
            <View
              style={{
                paddingHorizontal: rs(12),
                paddingVertical: rs(4),
              }}
              className="bg-[#DADFE5] rounded-[4px]"
            >
              <Text
                style={{ fontSize: rf(14) }}
                className="text-textPrimary-light font-inter"
              >
                3h 55m
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
