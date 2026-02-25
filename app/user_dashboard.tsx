import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import ChooseEquipmentModal from "./components/dialogs/ChooseEquipmentModal";
import LogoutConfirmationModal from "./components/dialogs/LogoutConfirmationModal";

export default function UserDashboard() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Extract parameters passed from the login screen
  const { id, first_name, last_name } = useLocalSearchParams();

  // Modal state management
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEquipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // NEW: Time and session states
  const [timeMode, setTimeMode] = useState<"now" | "manual">("now");
  const [manualTime, setManualTime] = useState("");
  const [isStartingSession, setIsStartingSession] = useState(false);

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;

  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  // Scaling helpers
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // Triggered when clicking the top-right Logout button
  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  // Triggered when confirming inside the modal
  const confirmLogout = async () => {
    setIsLoggingOut(true);

    if (id) {
      await supabase.from("accounts").update({ isOnline: false }).eq("id", id);
    }

    setIsLoggingOut(false);
    setLogoutModalVisible(false);
    router.replace("/");
  };

  const handleStartSession = async () => {
    if (!selectedEquipment) {
      alert("Please select an equipment first.");
      return;
    }

    if (timeMode === "manual" && !manualTime.trim()) {
      alert("Please enter a manual time.");
      return;
    }

    setIsStartingSession(true);

    // Format current date as YYYY-MM-DD
    const currentDate = new Date().toISOString().split("T")[0];

    // Format time appropriately based on selected mode
    const timeIn =
      timeMode === "now"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : manualTime;

    // Construct full name
    const fullName = `${first_name || "Unknown"} ${last_name || ""}`.trim();

    // Insert into Supabase
    const { error } = await supabase.from("equipment_logs").insert([
      {
        full_name: fullName,
        equipment_name: selectedEquipment.name,
        date: currentDate,
        time_in: timeIn,
      },
    ]);

    setIsStartingSession(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to start session. Please try again.");
    } else {
      alert("Session started successfully!");
      // Reset form
      setSelectedEquipment(null);
      setManualTime("");
      setTimeMode("now");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LogoutConfirmationModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />

      <ChooseEquipmentModal
        visible={isEquipmentModalVisible}
        onClose={() => setEquipmentModalVisible(false)}
        onSelect={(equipment) => setSelectedEquipment(equipment)}
      />

      <View className="flex-1 bg-bgPrimary-light">
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
                    Hello, {first_name || "User"}!
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
                  onPress={handleLogoutPress}
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
                  <TouchableOpacity
                    style={{ padding: rs(12) }}
                    className="bg-[#EBEDF0] rounded-lg flex-row justify-between items-center mt-2"
                    onPress={() => setEquipmentModalVisible(true)}
                  >
                    <Text
                      style={{ fontSize: rf(14) }}
                      className="text-textPrimary-light font-inter"
                    >
                      {selectedEquipment
                        ? selectedEquipment.name
                        : "Choose equipment"}
                    </Text>
                    <Feather name="chevron-down" size={rs(20)} color="gray" />
                  </TouchableOpacity>
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
                    {/* UPDATED: Manual Entry Radio Button */}
                    <TouchableOpacity
                      style={{ marginRight: rs(16) }}
                      className="flex-row items-center"
                      onPress={() => setTimeMode("manual")}
                    >
                      <View
                        className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${
                          timeMode === "manual"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {timeMode === "manual" && (
                          <View className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="text-textPrimary-light font-inter"
                      >
                        Manual Entry
                      </Text>
                    </TouchableOpacity>

                    {/* UPDATED: Start Now Radio Button */}
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => setTimeMode("now")}
                    >
                      <View
                        className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${
                          timeMode === "now"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {timeMode === "now" && (
                          <View className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="text-textPrimary-light font-inter"
                      >
                        Start Now
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* UPDATED: Time Input Box */}
                  <View
                    style={{ padding: rs(12) }}
                    className={`rounded-lg flex-row justify-between items-center mt-2 ${
                      timeMode === "manual" ? "bg-white" : "bg-gray-300"
                    }`}
                  >
                    <TextInput
                      style={[
                        { fontSize: rf(14), flex: 1, padding: 0 },
                        { outlineStyle: "none" } as any,
                      ]}
                      className="text-textPrimary-light font-inter"
                      placeholder={
                        timeMode === "now"
                          ? "Current time will be recorded"
                          : "e.g., 11:45 AM"
                      }
                      value={timeMode === "now" ? "" : manualTime}
                      onChangeText={setManualTime}
                      editable={timeMode === "manual"}
                    />
                    {timeMode === "manual" && (
                      <Feather name="edit-2" size={rs(16)} color="gray" />
                    )}
                  </View>
                </View>

                {/* UPDATED: Start Button triggers handleStartSession */}
                <TouchableOpacity
                  style={{ paddingVertical: rs(16) }}
                  className={`rounded-md items-center justify-center w-full ${
                    isStartingSession ? "bg-blue-400" : "bg-mainColor-light"
                  }`}
                  onPress={handleStartSession}
                  disabled={isStartingSession}
                >
                  <Text
                    style={{ fontSize: rf(18) }}
                    className="text-white font-inter-bold"
                  >
                    {isStartingSession
                      ? "Starting..."
                      : "Start Using Equipment"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3. Available Equipments Table */}
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
                      className={`flex-row items-center ${
                        idx !== 2 ? "border-b border-[#DADFE5]" : ""
                      }`}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
