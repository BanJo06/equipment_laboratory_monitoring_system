import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import QRCodeModal from "./components/dialogs/QRCodeModal";
import StartSessionHelpModal from "./components/dialogs/StartSessionHelpModal";
import StatusModal from "./components/dialogs/StatusModal";
import UserActiveSessionsHelpModal from "./components/dialogs/UserActiveSessionsHelpModal";

export default function UserDashboard() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Extract parameters passed from the login screen
  const { id, first_name, last_name } = useLocalSearchParams();
  const fullNameStr = `${first_name || "Unknown"} ${last_name || ""}`.trim();

  // Modal state management
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrSessionData, setQrSessionData] = useState<{
    id: string;
    equipment_name: string;
    model_name: string | null;
    location: string;
  } | null>(null);
  const [startHelpVisible, setStartHelpVisible] = useState(false);
  const [activeHelpVisible, setActiveHelpVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const closeStatusModal = () => {
    setStatusConfig((prev) => ({ ...prev, visible: false }));
  };

  // Equipment selection states
  const [isEquipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<{
    id: string;
    name: string;
    units: number;
    model_name: string;
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

  // NEW: Inventory state for the Available Equipments table
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

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
      .eq("status", "In Use") // CHANGED: Now filters by active status
      .order("created_at", { ascending: false });

    if (!error && data) {
      setActiveSessions(data);
    } else if (error) {
      console.error("Error fetching active sessions:", error);
    }
  };

  const fetchInventory = async () => {
    setLoadingInventory(true);
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setInventory(data);
    } else if (error) {
      console.error("Error fetching inventory:", error);
    }
    setLoadingInventory(false);
  };

  useEffect(() => {
    fetchInventory();
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
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Please select an equipment first.",
      });
      return;
    }

    if (selectedEquipment.units <= 0) {
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "This equipment is currently out of stock.",
      });
      return;
    }

    if (timeMode === "manual" && !manualTime.trim()) {
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Please enter a manual time.",
      });
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
          model_name: selectedEquipment.model_name,
          date: currentDate,
          time_in: timeIn,
          status: "In Use",
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Failed to start session. Please try again.",
      });
      setIsStartingSession(false);
      return;
    }

    // Decrease stock
    const newStock = selectedEquipment.units - 1;
    await supabase
      .from("equipment_inventory")
      .update({ units: newStock })
      .eq("id", selectedEquipment.id);

    setStatusConfig({
      visible: true,
      title: "Session Started",
      message: "The equipment log has been successfully recorded.",
    });

    setSelectedEquipment(null);
    setManualTime("");
    setTimeMode("now");
    setIsStartingSession(false);
    fetchActiveSessions();
    fetchInventory();
  };

  const handleStopSession = async (session: any) => {
    setIsStoppingSession(true);

    const timeOut = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const start = new Date(session.created_at).getTime();
    const current = new Date().getTime();
    const diff = Math.max(0, current - start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const finalDuration = `${hours}H ${minutes}M`;

    // Update log out time AND status to completed
    const { error } = await supabase
      .from("equipment_logs")
      .update({
        time_out: timeOut,
        duration: finalDuration,
        status: "completed", // NEW
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error stopping session:", error);
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Failed to stop session.",
      });
      setIsStoppingSession(false);
      return;
    }

    await returnEquipmentStock(session.equipment_name);

    setStatusConfig({
      visible: true,
      title: "Session Stopped",
      message: "The session has been successfully stopped and recorded.",
    });

    fetchActiveSessions();
    fetchInventory();
    setIsStoppingSession(false);
  };

  const handleCancelSession = async (session: any) => {
    setIsStoppingSession(true);

    // 1. Calculate the elapsed time in minutes
    const start = new Date(session.created_at).getTime();
    const current = new Date().getTime();
    const diffInMs = Math.max(0, current - start);
    const diffInMinutes = diffInMs / (1000 * 60);

    let statusTitle = "";
    let statusMsg = "";

    try {
      if (diffInMinutes >= 10) {
        // --- CASE A: 10+ minutes elapsed -> Mark as Completed ---
        const timeOut = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const hours = Math.floor(diffInMinutes / 60);
        const minutes = Math.floor(diffInMinutes % 60);
        const finalDuration = `${hours}H ${minutes}M`;

        const { error } = await supabase
          .from("equipment_logs")
          .update({
            time_out: timeOut,
            duration: finalDuration,
            status: "completed",
          })
          .eq("id", session.id);

        if (error) throw error;

        statusTitle = "Session Completed";
        statusMsg =
          "Usage exceeded 10 minutes. Log has been marked as completed.";
      } else {
        // --- CASE B: Less than 10 minutes -> Delete/Remove Log ---
        const { error } = await supabase
          .from("equipment_logs")
          .delete()
          .eq("id", session.id);

        if (error) throw error;

        statusTitle = "Log Removed";
        statusMsg =
          "Session cancelled within 10 minutes. The log was not recorded.";
      }

      // Common Cleanup: Return stock and refresh UI
      await returnEquipmentStock(session.equipment_name);

      setStatusConfig({
        visible: true,
        title: statusTitle,
        message: statusMsg,
      });
    } catch (error) {
      console.error("Error processing cancellation:", error);
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "An error occurred while processing the cancellation.",
      });
    } finally {
      fetchActiveSessions();
      fetchInventory();
      setIsStoppingSession(false);
    }
  };

  const returnEquipmentStock = async (equipmentName: string) => {
    // We no longer need to split the string!
    const { data: eqData } = await supabase
      .from("equipment_inventory")
      .select("units")
      .eq("name", equipmentName)
      .single();

    if (eqData) {
      await supabase
        .from("equipment_inventory")
        .update({ units: eqData.units + 1 })
        .eq("name", equipmentName);
    }
  };

  // --- STATS CALCULATIONS ---
  // Calculates the total available units across all equipment
  const totalAvailableStock = inventory.reduce(
    (total, item) => total + item.units,
    0,
  );

  // Formats the live clock to include the day of the week, date, and time
  const liveDateTime = currentTime.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // --- RENDER ---
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
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

      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        sessionData={qrSessionData}
      />

      <StartSessionHelpModal
        visible={startHelpVisible}
        onClose={() => setStartHelpVisible(false)}
      />
      <UserActiveSessionsHelpModal
        visible={activeHelpVisible}
        onClose={() => setActiveHelpVisible(false)}
      />
      <StatusModal
        visible={statusConfig.visible}
        title={statusConfig.title}
        message={statusConfig.message}
        onClose={closeStatusModal}
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
                  <TouchableOpacity onPress={() => setStartHelpVisible(true)}>
                    <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
                  </TouchableOpacity>
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

              {/* 3. Dynamic Available Equipments Table */}
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
                  {/* CHANGED "Last Used" to "Status" */}
                  <Text
                    style={{ fontSize: rf(14), flex: 1.2 }}
                    className="text-right font-inter-bold text-textPrimary-light"
                  >
                    Status
                  </Text>
                </View>

                {/* Dynamic Rows */}
                <View style={{ height: rs(139), overflow: "hidden" }}>
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      paddingBottom: rs(16),
                      flexGrow: 1,
                    }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {loadingInventory ? (
                      <ActivityIndicator
                        size="small"
                        color="#1d4ed8"
                        style={{ marginTop: 20 }}
                      />
                    ) : inventory.length === 0 ? (
                      <Text className="text-center text-gray-500 font-inter mt-4">
                        No equipment found.
                      </Text>
                    ) : (
                      inventory.map((item) => (
                        <View
                          key={item.id}
                          style={{ paddingVertical: rs(8) }}
                          className="flex-row items-center border-b border-[#DADFE5]"
                        >
                          <Text
                            style={{ fontSize: rf(14), flex: 2 }}
                            className="font-inter text-textPrimary-light pr-2"
                            numberOfLines={2}
                          >
                            {item.name}{" "}
                            {item.model_name ? `- ${item.model_name}` : ""}
                          </Text>
                          <Text
                            style={{ fontSize: rf(14), flex: 0.5 }}
                            className="font-inter text-center text-textPrimary-light"
                          >
                            {item.units}
                          </Text>
                          <Text
                            style={{ fontSize: rf(14), flex: 1.2 }}
                            className={`font-inter-bold text-right ${
                              item.units > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {item.units > 0 ? "Available" : "In Use"}
                          </Text>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
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
                  <TouchableOpacity onPress={() => setActiveHelpVisible(true)}>
                    <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
                  </TouchableOpacity>
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
                              {session.equipment_name} - {session.model_name}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={{
                              paddingVertical: rs(6),
                              paddingHorizontal: rs(12),
                            }}
                            className="border border-blue-700 rounded-lg flex-row items-center"
                            onPress={() => {
                              setQrSessionData({
                                id: session.id,
                                equipment_name: session.equipment_name,
                                model_name: session.model_name,
                                location: session.location,
                              });
                              setQrModalVisible(true);
                            }}
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
                            gap: rs(16),
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: rs(24),
                              paddingVertical: rs(12),
                              flex: 1,
                            }}
                            className={`rounded-md items-center justify-center ${isStoppingSession ? "bg-red-400" : "bg-red-600"}`}
                            onPress={() => handleStopSession(session)} // Stop Button
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
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: rs(24),
                              paddingVertical: rs(12),
                              flex: 1,
                            }}
                            className={`rounded-md items-center justify-center ${isStoppingSession ? "bg-gray-400" : "bg-gray-600"}`} // Changed color to differentiate
                            onPress={() => handleCancelSession(session)} // Cancel Button
                            disabled={isStoppingSession}
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="text-white font-inter-bold"
                            >
                              {isStoppingSession
                                ? "Processing..."
                                : "Cancel Equipment"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* 5. Stats Grid */}
              <View style={{ gap: rs(24) }} className="flex-row flex-wrap">
                {[
                  { label: "My Active", val: activeSessions.length.toString() },
                  { label: "Date/Time", val: liveDateTime },
                  { label: "Available", val: totalAvailableStock.toString() },
                  { label: "Total Items", val: inventory.length.toString() },
                ].map((stat, i) => (
                  <View
                    key={i}
                    style={{
                      padding: rs(16),
                      minHeight: rs(120),
                      width: isMobile ? "47.5%" : "48%",
                    }}
                    className="bg-white rounded-2xl shadow-sm justify-center"
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
