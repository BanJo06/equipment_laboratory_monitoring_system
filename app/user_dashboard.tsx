import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const fullNameStr = `${first_name || "Unknown"} ${last_name || ""}`.trim();

  // Modal state management
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Equipment selection states
  const [isEquipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<{
    id: string;
    name: string;
    units: number;
  } | null>(null);

  // Time and session states
  const [timeMode, setTimeMode] = useState<"now" | "manual">("now");
  const [manualTime, setManualTime] = useState("");
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Live clock state for durations
  const [currentTime, setCurrentTime] = useState(new Date());

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isStoppingSession, setIsStoppingSession] = useState(false);

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to calculate elapsed time
  // This code is for live time duration text (ex: 00:05:00)
  // const getDuration = (startTimeString: string) => {
  //   const start = new Date(startTimeString).getTime();
  //   const current = currentTime.getTime();
  //   const diff = Math.max(0, current - start); // Prevent negative time

  //   const hours = Math.floor(diff / (1000 * 60 * 60));
  //   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  //   const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  //   const pad = (num: number) => num.toString().padStart(2, "0");
  //   return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  // };

  const getDuration = (startTimeString: string) => {
    const start = new Date(startTimeString).getTime();
    const current = currentTime.getTime();
    const diff = Math.max(0, current - start); // Prevent negative time

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Returns the exact requested format: "0H 6M"
    return `${hours}H ${minutes}M`;
  };

  // --- DATA FETCHING ---
  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from("equipment_logs")
      .select("*")
      .eq("full_name", fullNameStr)
      .is("time_out", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setActiveSessions(data);
    } else if (error) {
      console.error("Error fetching active sessions:", error);
    }
  };

  useEffect(() => {
    if (fullNameStr) {
      fetchActiveSessions();
    }
  }, [fullNameStr]);

  // --- ACTIONS ---
  const handleLogoutPress = () => setLogoutModalVisible(true);

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

    if (selectedEquipment.units <= 0) {
      alert("This equipment is currently out of stock.");
      return;
    }

    if (timeMode === "manual" && !manualTime.trim()) {
      alert("Please enter a manual time.");
      return;
    }

    setIsStartingSession(true);

    const currentDate = new Date().toISOString().split("T")[0];
    const timeIn =
      timeMode === "now"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : manualTime;

    // Insert log
    const { error: insertError } = await supabase
      .from("equipment_logs")
      .insert([
        {
          full_name: fullNameStr,
          equipment_name: selectedEquipment.name,
          date: currentDate,
          time_in: timeIn,
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      alert("Failed to start session. Please try again.");
      setIsStartingSession(false);
      return;
    }

    // Decrease stock
    const newStock = selectedEquipment.units - 1;
    await supabase
      .from("equipment_inventory")
      .update({ units: newStock })
      .eq("id", selectedEquipment.id);

    alert("Session started successfully!");
    setSelectedEquipment(null);
    setManualTime("");
    setTimeMode("now");
    setIsStartingSession(false);
    fetchActiveSessions();
  };

  const handleStopSession = async (session: any) => {
    setIsStoppingSession(true);

    // 1. Get current time for the time_out stamp
    const timeOut = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 2. Calculate final duration based on the database created_at timestamp
    const start = new Date(session.created_at).getTime();
    const current = new Date().getTime();
    const diff = Math.max(0, current - start);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Format to match "1H 13M"
    const finalDuration = `${hours}H ${minutes}M`;

    // 3. Update log out time AND duration in the database
    const { error } = await supabase
      .from("equipment_logs")
      .update({
        time_out: timeOut,
        duration: finalDuration, // Saves the formatted string
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error stopping session:", error);
      alert("Failed to stop session.");
      setIsStoppingSession(false);
      return;
    }

    // 4. Fetch current inventory stock to increment correctly
    const { data: eqData } = await supabase
      .from("equipment_inventory")
      .select("units")
      .eq("name", session.equipment_name)
      .single();

    if (eqData) {
      // Increase stock by 1
      await supabase
        .from("equipment_inventory")
        .update({ units: eqData.units + 1 })
        .eq("name", session.equipment_name);
    }

    alert("Session stopped successfully!");
    fetchActiveSessions();
    setIsStoppingSession(false);
  };

  // --- RENDER ---
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
              {/* 1. Header Card */}
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

              {/* 2. Start Session Card */}
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

                {/* Select Equipment Input */}
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

                {/* Start Time Container */}
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

              {/* 3. Available Equipments Table (Static placeholder) */}
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

            {/* ======================= RIGHT COLUMN ======================= */}
            <View style={{ flex: 1, width: "100%" }}>
              {/* 4. Active Sessions Card */}
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
                        {activeSessions.length}{" "}
                        {activeSessions.length === 1
                          ? "equipment"
                          : "equipments"}{" "}
                        in use
                      </Text>
                    </View>
                  </View>
                  <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
                </View>

                {/* DYNAMIC SESSIONS LIST */}
                <ScrollView
                  style={{ height: rs(492) }}
                  nestedScrollEnabled={true}
                >
                  {activeSessions.length === 0 ? (
                    <Text className="font-inter text-gray-500 text-center mt-4">
                      No active sessions currently.
                    </Text>
                  ) : (
                    activeSessions.map((session) => (
                      <View
                        key={session.id}
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
                              name="flask"
                              size={rs(20)}
                              color="#1d4ed8"
                            />
                            <Text
                              style={{ fontSize: rf(16) }}
                              className="font-inter text-textPrimary-light ml-2 font-bold"
                            >
                              {session.equipment_name}
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
                            Started: {session.time_in}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: rs(12),
                              paddingVertical: rs(4),
                              marginLeft: rs(8),
                            }}
                            className="bg-[#DADFE5] rounded-[4px]"
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="text-blue-700 font-inter-bold"
                            >
                              {getDuration(session.created_at)}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: width < 500 ? "column" : "row",
                            gap: rs(8),
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: rs(24),
                              paddingVertical: rs(12),
                              flex: 1,
                            }}
                            className={`rounded-md items-center justify-center ${isStoppingSession ? "bg-red-400" : "bg-red-600"}`}
                            onPress={() => handleStopSession(session)}
                            disabled={isStoppingSession}
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="text-white font-inter-bold"
                            >
                              {isStoppingSession
                                ? "Stopping..."
                                : "Stop Using Equipment"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* 5. Stats Grid */}
              <View
                style={{ gap: rs(16) }}
                className="flex-row flex-wrap justify-between"
              >
                {[
                  { label: "My Active", val: activeSessions.length.toString() },
                  { label: "Date/Time", val: new Date().toLocaleDateString() },
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
