import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserDashboard() {
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
              {/* 1. Hello Juan */}
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
                    Hello, Juan!
                  </Text>
                  <Text
                    style={{ fontSize: rf(16) }}
                    className="font-inter text-textSecondary-light"
                  >
                    Ready to use laboratory equipment
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

              {/* 2. Start Session */}
              <View
                style={{
                  paddingHorizontal: rs(32),
                  paddingTop: rs(32),
                  paddingBottom: rs(24),
                  marginBottom: rs(24),
                }}
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
                    <SVG_ICONS.StartSession size={rs(64)} />
                    <View style={{ gap: rs(6), flexShrink: 1 }}>
                      <Text
                        style={{ fontSize: rf(28) }}
                        className="font-inter-bold text-textPrimary-light"
                      >
                        Start Session
                      </Text>
                      <Text
                        style={{ fontSize: rf(16) }}
                        className="font-inter text-textSecondary-light"
                      >
                        Begin using equipment
                      </Text>
                    </View>
                  </View>
                  <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
                </View>

                <View style={{ marginBottom: rs(16) }}>
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5
                      name="flask"
                      size={rf(20)}
                      color="#112747"
                      style={{ marginRight: rs(8) }}
                    />
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-textPrimary-light font-inter"
                    >
                      Select Equipment
                    </Text>
                  </View>
                  <View
                    style={{ padding: rs(12) }}
                    className="bg-[#EBEDF0] rounded-lg flex-row justify-between items-center mt-2"
                  >
                    <Text
                      style={{ fontSize: rf(14) }}
                      className="text-textPrimary-light font-inter"
                    >
                      Choose equipment
                    </Text>
                    <Feather name="chevron-down" size={rs(20)} color="gray" />
                  </View>
                </View>

                <View
                  style={{ marginBottom: rs(24), padding: rs(16) }}
                  className="bg-[#DADFE5] rounded-[10px]"
                >
                  <View
                    style={{ marginBottom: rs(8) }}
                    className="flex-row items-center"
                  >
                    <Feather
                      name="clock"
                      size={rf(20)}
                      color="#112747"
                      style={{ marginRight: rs(8) }}
                    />
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="text-textPrimary-light font-inter"
                    >
                      Start Time
                    </Text>
                  </View>
                  <View style={{ marginBottom: rs(8) }} className="flex-row">
                    <View
                      style={{ marginRight: rs(16) }}
                      className="flex-row items-center"
                    >
                      <View className="h-5 w-5 rounded-full border-2 border-blue-600 bg-blue-600 items-center justify-center mr-2">
                        <View className="h-2 w-2 rounded-full bg-white" />
                      </View>
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="text-textPrimary-light font-inter"
                      >
                        Dropdown
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="h-5 w-5 rounded-full border-2 border-gray-400 bg-white mr-2" />
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="text-textPrimary-light font-inter"
                      >
                        Manual Entry
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{ padding: rs(12) }}
                    className="bg-white rounded-lg flex-row justify-between items-center mt-2"
                  >
                    <Text
                      style={{ fontSize: rf(14) }}
                      className="text-textPrimary-light font-inter"
                    >
                      11:45 AM
                    </Text>
                    <Feather name="chevron-down" size={rs(20)} color="gray" />
                  </View>
                </View>

                <TouchableOpacity
                  style={{ paddingVertical: rs(16) }}
                  className="bg-mainColor-light rounded-md items-center justify-center w-full"
                >
                  <Text
                    style={{ fontSize: rf(18) }}
                    className="text-white font-inter-bold"
                  >
                    Start Using Equipment
                  </Text>
                </TouchableOpacity>
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
                  style={{ height: rs(492) }}
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
                      <TouchableOpacity
                        style={{
                          paddingVertical: rs(6),
                          paddingHorizontal: rs(12),
                        }}
                        className="border border-blue-700 rounded-lg flex-row items-center"
                      >
                        <Ionicons
                          name="qr-code-outline"
                          size={rs(16)}
                          color="#1d4ed8"
                        />
                        <Text
                          style={{ fontSize: rf(14) }}
                          className="text-blue-700 font-inter-bold ml-2"
                        >
                          QR
                        </Text>
                      </TouchableOpacity>
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

                    <View
                      style={{ marginBottom: rs(8) }}
                      className="flex-row items-center"
                    >
                      <Feather
                        name="clock"
                        size={rs(20)}
                        color="#112747"
                        style={{ marginRight: rs(8) }}
                      />
                      <Text
                        style={{ fontSize: rf(16) }}
                        className="text-textPrimary-light font-inter"
                      >
                        End Time
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: width < 500 ? "column" : "row",
                        gap: rs(8),
                      }}
                    >
                      <View
                        style={{ padding: rs(12) }}
                        className="flex-1 bg-gray-300 rounded-lg flex-row justify-between items-center"
                      >
                        <Text
                          style={{ fontSize: rf(14) }}
                          className="font-inter text-textPrimary-light"
                        >
                          11:45 AM
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={rs(20)}
                          color="gray"
                        />
                      </View>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: rs(24),
                          paddingVertical: width < 500 ? rs(12) : 0,
                        }}
                        className="bg-blue-700 rounded-md items-center justify-center"
                      >
                        <Text
                          style={{ fontSize: rf(14) }}
                          className="text-white font-inter-bold"
                        >
                          Stop
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* 5. Stats Grid */}
              <View
                style={{ gap: rs(16) }}
                className="flex-row flex-wrap justify-between"
              >
                {[
                  { label: "My Active", val: "2" },
                  { label: "Date/Time", val: "Jan 10, 11:15 AM" },
                  { label: "Available", val: "8" },
                  { label: "Total", val: "8" },
                ].map((stat, i) => (
                  <View
                    key={i}
                    style={{
                      padding: rs(16),
                      minHeight: rs(120),
                      width: isMobile ? "47.5%" : "48%",
                    }}
                    className="bg-white rounded-2xl shadow-sm"
                  >
                    <Text
                      style={{ fontSize: rf(20) }}
                      className="font-inter-bold text-textPrimary-light"
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{ fontSize: rf(16) }}
                      className="font-inter text-textSecondary-light mt-2"
                    >
                      {stat.val}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={{ height: rs(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
