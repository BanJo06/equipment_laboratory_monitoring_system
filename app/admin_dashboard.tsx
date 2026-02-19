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

  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  // Scaling helpers
  const rf = (size) => size * scale;
  const rs = (size) => size * scale;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-bgPrimary-light">
        {/* <Stack.Screen options={{ headerShown: false }} /> */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: rs(24) }}
        >
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: "flex-start",
              gap: rs(24),
            }}
          >
            {/* ======================= LEFT COLUMN ======================= */}
            <View style={{ flex: 1, width: "100%" }}>
              {/* 1. Hello Admin Juan */}
              <View
                style={{
                  padding: rs(32),
                  marginBottom: rs(24),
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

              <View className="flex-row">
                <View
                  style={{
                    padding: rs(32),
                    marginBottom: rs(24),
                    width: rs(302),
                    height: rs(496),
                    marginRight: rs(24),
                    gap: rs(16),
                  }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <TouchableOpacity
                    style={{ paddingVertical: rs(16) }}
                    className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-white font-inter-bold"
                    >
                      Home
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ paddingVertical: rs(16) }}
                    className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-white font-inter-bold"
                    >
                      Accounts
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ paddingVertical: rs(16) }}
                    className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-white font-inter-bold"
                    >
                      Usage History
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ paddingVertical: rs(16) }}
                    className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-white font-inter-bold"
                    >
                      Analytics
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ paddingVertical: rs(16) }}
                    className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-white font-inter-bold"
                    >
                      Equipment Inventory
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    paddingHorizontal: rs(32),
                    paddingTop: rs(32),
                    paddingBottom: rs(24),
                    marginBottom: rs(24),
                  }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <View className="mb-6">
                    <Text
                      style={{ fontSize: rf(18) }}
                      className="text-textPrimary-light font-inter-bold"
                    >
                      Online
                    </Text>
                  </View>

                  <View className="gap-4">
                    <View className="flex-row gap-4">
                      <View className="bg-blue-600 w-[48px] h-[48px] rounded-full"></View>
                      <View className="flex-col gap-1">
                        <Text className="font-inter-bold text-[16px] text-textPrimary-light">
                          Juan Dela Cruz
                        </Text>
                        <Text className="font-inter text-[14px] text-textSecondary-light">
                          Researcher II
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* 3. Available Equipments Table - PERSISTENT LAST USED COLUMN */}
              <View
                style={{ padding: rs(32), marginBottom: rs(24) }}
                className="bg-white rounded-lg shadow-sm"
              >
                <Text
                  style={{ fontSize: rf(28), marginBottom: rs(16) }}
                  className="font-inter-bold text-textPrimary-light"
                >
                  Available Equipments
                </Text>

                {/* Header */}
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

                {/* Rows */}
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

            {/* ======================= RIGHT COLUMN ======================= */}
            <View style={{ flex: 1, width: "100%" }}>
              {/* 4. Active Sessions */}
              <View
                style={{ padding: rs(32), marginBottom: rs(24) }}
                className="bg-white rounded-lg shadow-sm"
              >
                <View
                  style={{
                    marginBottom: rs(16),
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: rs(12),
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
                  style={{ height: rs(750) }}
                  nestedScrollEnabled={true}
                >
                  <View
                    style={{ padding: rs(16), marginBottom: rs(16) }}
                    className="bg-gray-200 rounded-xl"
                  >
                    <View
                      style={{
                        marginBottom: rs(8),
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: rs(8),
                      }}
                    >
                      <View className="flex-row items-center">
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
                    </View>

                    <View
                      style={{
                        paddingHorizontal: rs(16),
                        paddingVertical: rs(12),
                        marginBottom: rs(24),
                        flexDirection: "row",
                        flexWrap: "wrap",
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
          </View>
          <View style={{ height: rs(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
