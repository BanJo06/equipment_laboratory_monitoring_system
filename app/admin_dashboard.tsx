import { SVG_ICONS } from "@/assets/constants/icons";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  // New breakpoint for the small cards to stack
  const isSmallPhone = width < 600;

  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size) => size * scale;
  const rs = (size) => size * scale;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-bgPrimary-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: rs(24) }}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= MASTER CONTAINER ================= */}
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: "stretch",
              gap: rs(24),
            }}
          >
            {/* ================= LEFT COLUMN ================= */}
            <View style={{ flex: isMobile ? undefined : 1.5, gap: rs(24) }}>
              {/* 1. Hello Admin Card */}
              <View
                style={{
                  padding: rs(32),
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: rs(12),
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                <View style={{ gap: rs(4), flexShrink: 1 }}>
                  <Text
                    style={{ fontSize: rf(34) }}
                    className="font-inter-bold text-textPrimary-light"
                  >
                    Hello, Admin Joed!
                  </Text>
                  <Text
                    style={{ fontSize: rf(16) }}
                    className="font-inter text-textSecondary-light"
                  >
                    Monitor equipment usage in real-time
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
                  className="bg-mainColor-light rounded-md"
                >
                  <Text
                    style={{ fontSize: rf(16) }}
                    className="text-white font-inter-bold"
                  >
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. Middle Row (Nav & Online) - FORCED TWO COLUMNS UNTIL SMALL PHONE */}
              <View
                style={{
                  flexDirection: "row", // Only stack on very small screens
                  alignItems: "stretch",
                  gap: rs(24),
                }}
              >
                {/* Navigation Menu */}
                <View
                  style={{ flex: 1, padding: rs(32), gap: rs(16) }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  {[
                    "Home",
                    "Accounts",
                    "Usage History",
                    "Analytics",
                    "Equipment Inventory",
                  ].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={{ paddingVertical: rs(16) }}
                      className="bg-mainColor-light rounded-md items-center justify-center w-full"
                    >
                      <Text
                        style={{ fontSize: isSmallPhone ? 14 : 16 }}
                        className="text-white font-inter-bold"
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Who's Online */}
                <View
                  style={{ flex: 1, padding: rs(32) }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <View className="mb-6">
                    <Text
                      style={{ fontSize: isSmallPhone ? rf(18) : 18 }}
                      className="text-textPrimary-light font-inter-bold"
                    >
                      Online
                    </Text>
                  </View>
                  <View className="gap-4">
                    {[
                      { n: "Juan Dela Cruz", r: "Researcher II" },
                      { n: "Carl Lozano", r: "Researcher III" },
                      { n: "Dave Yokingco", r: "Researcher III" },
                    ].map((p, i) => (
                      <View key={i} className="flex-row gap-4">
                        <View className="bg-blue-600 w-[48px] h-[48px] rounded-full" />
                        <View className="flex-col gap-1">
                          <Text className="font-inter-bold text-[16px] text-textPrimary-light">
                            {p.n}
                          </Text>
                          <Text className="font-inter text-[14px] text-textSecondary-light">
                            {p.r}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* 3. Available Equipments Table */}
              <View
                style={{ padding: rs(32) }}
                className="bg-white rounded-lg shadow-sm"
              >
                <Text
                  style={{ fontSize: rf(28), marginBottom: rs(16) }}
                  className="font-inter-bold text-textPrimary-light"
                >
                  Available Equipments
                </Text>
                <View
                  style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
                  className="flex-row border-b border-[#6684B0]"
                >
                  <Text
                    style={{ fontSize: rf(14), flex: 2 }}
                    className="font-inter-bold text-textPrimary-light"
                  >
                    Item
                  </Text>
                  <Text
                    style={{ fontSize: rf(14), flex: 0.5 }}
                    className="text-center font-inter-bold text-textPrimary-light"
                  >
                    Qty
                  </Text>
                  <Text
                    style={{ fontSize: rf(14), flex: 1.2 }}
                    className="text-right font-inter-bold text-textPrimary-light"
                  >
                    Last Used
                  </Text>
                </View>
                {["Microscope A", "PCR Machine", "Incubator"].map(
                  (item, idx) => (
                    <View
                      key={idx}
                      style={{ paddingVertical: rs(8) }}
                      className={`flex-row items-center ${idx !== 2 ? "border-b border-[#DADFE5]" : ""}`}
                    >
                      <Text
                        style={{ fontSize: rf(14), flex: 2 }}
                        className="font-inter text-textPrimary-light"
                        numberOfLines={1}
                      >
                        {item}
                      </Text>
                      <Text
                        style={{ fontSize: rf(14), flex: 0.5 }}
                        className="font-inter text-center text-textPrimary-light"
                      >
                        {idx + 1}
                      </Text>
                      <Text
                        style={{ fontSize: rf(14), flex: 1.2 }}
                        className="font-inter text-right text-textPrimary-light"
                      >
                        Jan {idx + 2}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* ================= RIGHT COLUMN (ACTIVE SESSIONS) ================= */}
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
                  <SVG_ICONS.ActiveSessions size={rs(64)} />
                  <View style={{ gap: rs(6), flexShrink: 1 }}>
                    <Text
                      style={{ fontSize: rf(28) }}
                      className="font-inter-bold text-textPrimary-light"
                    >
                      Active Sessions
                    </Text>
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="font-inter text-textSecondary-light"
                    >
                      2 equipments in use
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
          </View>

          <View style={{ height: rs(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
