import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import BookEquipmentModal from "./components/dialogs/BookEquipmentModal";
import ChooseEquipmentModal from "./components/dialogs/ChooseEquipmentModal";
import DeleteConfirmationModal from "./components/dialogs/DeleteConfirmModal";
import LogoutConfirmationModal from "./components/dialogs/LogoutConfirmationModal";
import QRCodeModal from "./components/dialogs/QRCodeModal";
import StartSessionHelpModal from "./components/dialogs/StartSessionHelpModal";
import StatusModal from "./components/dialogs/StatusModal";
import StopSessionConfirmationModal from "./components/dialogs/StopSessionConfirmationModal";
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
  const [isStopModalVisible, setStopModalVisible] = useState(false);
  const [selectedSessionToStop, setSelectedSessionToStop] = useState<any>(null);
  const [stopModalConfig, setStopModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    mode: "stop" as "stop" | "cancel",
    session: null as any,
  });
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrSessionData, setQrSessionData] = useState<{
    id: string;
    equipment_name: string;
    model_name: string | null;
    location: string;
  } | null>(null);
  const [startHelpVisible, setStartHelpVisible] = useState(false);
  const [activeHelpVisible, setActiveHelpVisible] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onCloseOverride: null as (() => void) | null,
  });

  const updateOnlineStatus = async (status: boolean) => {
    if (id) {
      await supabase.from("accounts").update({ isOnline: status }).eq("id", id);
    }
  };

  // --- IDLE LOGOUT LOGIC ---
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds

  const forceLogout = async () => {
    // 1. Update Supabase
    if (id) {
      await supabase.from("accounts").update({ isOnline: false }).eq("id", id);
    }

    // 2. Show the specific mandatory alert
    setStatusConfig({
      visible: true,
      title: "Session Expired",
      message: "You are idle for 5 minutes, it will automatically log-out",
      onCloseOverride: () => {
        router.replace("/"); // Redirect after they acknowledge the alert
      },
    });
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Using window.setTimeout ensures it's treated as a browser-style timer
    idleTimerRef.current = setTimeout(forceLogout, IDLE_TIME_LIMIT);
  };

  useEffect(() => {
    // 1. SET ONLINE IMMEDIATELY ON MOUNT
    updateOnlineStatus(true);
    resetIdleTimer();

    // 2. MOBILE & GLOBAL STATE LOGIC
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        updateOnlineStatus(true); // User came back
        resetIdleTimer();
      } else {
        // background or inactive (closing/minimizing)
        updateOnlineStatus(false);
      }
    });

    // 3. WEB SPECIFIC LOGIC (Tab Closing/Visibility)
    if (Platform.OS === "web") {
      const handleVisibilityChange = () => {
        updateOnlineStatus(document.visibilityState === "visible");
      };

      // This handles closing the tab or browser entirely
      const handleBeforeUnload = () => {
        updateOnlineStatus(false);
      };

      window.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];
      events.forEach((event) => window.addEventListener(event, resetIdleTimer));

      return () => {
        subscription.remove();
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        events.forEach((event) =>
          window.removeEventListener(event, resetIdleTimer),
        );
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }

    return () => {
      subscription.remove();
      updateOnlineStatus(false); // Clean up on component unmount
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [id]);

  const closeStatusModal = () => {
    if (statusConfig.onCloseOverride) {
      statusConfig.onCloseOverride();
    }
    setStatusConfig((prev) => ({
      ...prev,
      visible: false,
      onCloseOverride: null,
    }));
  };

  // Equipment selection states
  const [isEquipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<{
    id: string;
    name: string;
    units: number;
    model_name: string;
    location: string;
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

  // --- DELETION STATES ---
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- HEIGHT & SPACING CONSTANTS ---
  const CARD_MARGIN = rs(24);
  const HEADER_H = rs(140);
  const START_SESSION_H = rs(452);

  // Align Right Column cards to match Left Column heights
  const TOTAL_TOP_HEIGHT = HEADER_H + CARD_MARGIN + START_SESSION_H;
  // (Total Height - Middle Margin) / 2 = Equal height for both cards
  const RIGHT_SPLIT_CARD_H = (TOTAL_TOP_HEIGHT - CARD_MARGIN) / 2;

  const DESKTOP_INVENTORY_H = rs(260);
  const STAT_CARD_H = (DESKTOP_INVENTORY_H - CARD_MARGIN) / 2;

  // Internal Scroll Area Height
  const TABLE_SCROLL_H = isMobile ? rs(200) : rs(120);

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

  const parseDateTime = (dateStr: string, timeStr: string) => {
    // dateStr is "YYYY-MM-DD", timeStr is "hh:mm AM/PM"
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  // --- DATA FETCHING ---
  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from("equipment_logs")
      .select("*")
      .eq("full_name", fullNameStr)
      .eq("status", "In Use")
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

  //Fetch Reservations Fetch data
  const fetchReservations = async () => {
    if (!fullNameStr || fullNameStr.includes("Unknown")) return; // Don't fetch if name isn't loaded

    setLoadingReservations(true);
    const { data, error } = await supabase
      .from("equipment_reservations")
      .select("*")
      .ilike("full_name", `%${fullNameStr.trim()}%`) // Use ilike for safer matching
      .eq("status", "Pending")
      .order("reservation_date", { ascending: true });

    if (error) {
      console.error("Fetch Error:", error);
    } else {
      setReservations(data || []);
    }
    setLoadingReservations(false);
  };

  useEffect(() => {
    fetchInventory();
    if (fullNameStr) {
      fetchActiveSessions();
      fetchReservations();
    }
  }, [fullNameStr]);

  // --- ACTIONS ---
  const handleLogoutPress = () => setLogoutModalVisible(true);

  const confirmLogout = async () => {
    // Start the loading state
    setIsLoggingOut(true);

    try {
      // 1. Attempt the database update
      if (id) {
        await supabase
          .from("accounts")
          .update({ isOnline: false })
          .eq("id", id);
      }
    } catch (error) {
      // 2. If the internet fails or Supabase throws an error, log it here
      console.error("Error during logout:", error);
    } finally {
      // 3. This runs NO MATTER WHAT (success or error)
      // It prevents the user from being "stuck" on a loading spinner
      setIsLoggingOut(false);
      setLogoutModalVisible(false);
      router.replace("/");
    }
  };

  const handleOpenQRCode = (session: any) => {
    setQrSessionData({
      id: session.id,
      equipment_name: session.equipment_name,
      model_name: session.model_name || "N/A",
      location: session.location || "designated area", // Or session.location if available in DB
    });
    setQrModalVisible(true);
  };

  const handleStartSession = async () => {
    if (timeMode === "manual") {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(am|pm|AM|PM)$/;

      if (!manualTime.trim()) {
        setStatusConfig((prev) => ({
          ...prev,
          visible: true,
          title: "Error",
          message: "Please enter a manual time.",
        }));
        return;
      }

      if (!timeRegex.test(manualTime.trim())) {
        setStatusConfig((prev) => ({
          ...prev,
          visible: true,
          title: "Invalid Format",
          message:
            "Please enter time in a valid format (e.g., 5:00 AM, 5:00am, or 05:00 PM).",
        }));
        return;
      }
    }

    if (!selectedEquipment) {
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "Please select an equipment first.",
      }));
      return;
    }

    if (selectedEquipment.units <= 0) {
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "This equipment is currently out of stock.",
      }));
      return;
    }

    if (timeMode === "manual" && !manualTime.trim()) {
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "Please enter a manual time.",
      }));
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
          location: selectedEquipment.location,
          date: currentDate,
          time_in: timeIn,
          status: "In Use",
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "Failed to start session. Please try again.",
      }));
      setIsStartingSession(false);
      return;
    }

    // Decrease stock
    const newStock = selectedEquipment.units - 1;
    await supabase
      .from("equipment_inventory")
      .update({ units: newStock })
      .eq("id", selectedEquipment.id);

    setStatusConfig((prev) => ({
      ...prev,
      visible: true,
      title: "Session Started",
      message: "The equipment log has been successfully recorded.",
    }));

    setSelectedEquipment(null);
    setManualTime("");
    setTimeMode("now");
    setIsStartingSession(false);
    fetchActiveSessions();
    fetchInventory();
  };

  const handleStopPress = (session: any) => {
    const start = parseDateTime(session.date, session.time_in);
    const current = new Date().getTime();
    const diffInMinutes = (current - start) / (1000 * 60);

    if (diffInMinutes < 2) {
      setStopModalConfig({
        visible: true,
        title: "Cancel Equipment?",
        message:
          "Are you sure to cancel this equipment? Usage was less than 2 minutes.",
        mode: "cancel",
        session: session,
      });
    } else {
      setStopModalConfig({
        visible: true,
        title: "Stop Session?",
        message: "Are you sure you want to stop this session?",
        mode: "stop",
        session: session,
      });
    }
  };

  const confirmStopAction = async () => {
    const { mode, session } = stopModalConfig;

    // Close modal first
    setStopModalConfig((prev) => ({ ...prev, visible: false }));

    if (mode === "cancel") {
      // Use your existing cancel logic which deletes the log
      await handleCancelSession(session);
    } else {
      // Use your normal stop logic which updates the log
      await handleStopSession(session);
    }
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
        status: "Completed", // NEW
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error stopping session:", error);
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "Failed to stop session.",
      }));
      setIsStoppingSession(false);
      return;
    }

    await returnEquipmentStock(session.equipment_name);

    setStatusConfig((prev) => ({
      ...prev,
      visible: true,
      title: "Session Stopped",
      message: "The session has been successfully stopped and recorded.",
    }));

    fetchActiveSessions();
    fetchInventory();
    setIsStoppingSession(false);
  };

  const handleCancelSession = async (session: any) => {
    setIsStoppingSession(true);

    // 1. Calculate the elapsed time in minutes
    const start = parseDateTime(session.date, session.time_in);
    const current = new Date().getTime();
    const diffInMs = Math.max(0, current - start);
    const diffInMinutes = diffInMs / (1000 * 60);

    let statusTitle = "";
    let statusMsg = "";

    try {
      if (diffInMinutes >= 2) {
        // --- CASE A: 2+ minutes elapsed -> Mark as Completed ---
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
          "Usage exceeded 2 minutes. Log has been marked as completed.";
      } else {
        // --- CASE B: Less than 2 minutes -> Delete/Remove Log ---
        const { error } = await supabase
          .from("equipment_logs")
          .delete()
          .eq("id", session.id);

        if (error) throw error;

        statusTitle = "Log Removed";
        statusMsg =
          "Session cancelled within 2 minutes. The log was not recorded.";
      }

      // Common Cleanup: Return stock and refresh UI
      await returnEquipmentStock(session.equipment_name);

      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: statusTitle,
        message: statusMsg,
      }));
    } catch (error) {
      console.error("Error processing cancellation:", error);
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Error",
        message: "An error occurred while processing the cancellation.",
      }));
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

  // Delete Reservation log
  const handleDeletePress = (reservation: any) => {
    setReservationToDelete(reservation);
    setDeleteModalVisible(true);
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;

    setIsDeleting(true);

    try {
      // 1. Get current stock for this equipment
      // We use the equipment_name from the reservation object
      const { data: inventoryData, error: fetchError } = await supabase
        .from("equipment_inventory")
        .select("id, units")
        .eq("name", reservationToDelete.equipment_name)
        .single();

      if (fetchError) throw fetchError;

      // 2. Add 1 back to the stock
      const { error: updateError } = await supabase
        .from("equipment_inventory")
        .update({ units: (inventoryData.units || 0) + 1 })
        .eq("id", inventoryData.id);

      if (updateError) throw updateError;

      // 3. Delete the reservation log
      const { error: deleteError } = await supabase
        .from("equipment_reservations")
        .delete()
        .eq("id", reservationToDelete.id);

      if (deleteError) throw deleteError;

      // 4. Success Cleanup
      setDeleteModalVisible(false);
      fetchReservations(); // Refresh reservation list
      fetchInventory(); // Refresh the "Available Equipments" table
    } catch (error) {
      console.error("Error during cancellation:", error);
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Failed to cancel reservation and update stock.",
        onCloseOverride: null,
      });
    } finally {
      setIsDeleting(false);
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

      <StopSessionConfirmationModal
        visible={stopModalConfig.visible}
        title={stopModalConfig.title}
        message={stopModalConfig.message}
        onClose={() =>
          setStopModalConfig((prev) => ({ ...prev, visible: false }))
        }
        onConfirm={confirmStopAction}
        isStopping={isStoppingSession}
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

      <BookEquipmentModal
        visible={isBookModalVisible}
        onClose={() => setBookModalVisible(false)}
        onSuccess={() => {
          fetchReservations(); // This is the key! It re-runs the fetch logic
          fetchInventory(); // Also refresh inventory to show updated stock
        }}
        userName={fullNameStr}
      />

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeleteReservation}
        isDeleting={isDeleting}
        itemName={reservationToDelete?.equipment_name}
      />
      <View className="flex-1 bg-bgPrimary-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: rs(24),
            paddingTop: rs(24),
          }}
        >
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "stretch",
              gap: CARD_MARGIN,
              width: "100%",
            }}
          >
            {/* ======================= LEFT COLUMN ======================= */}
            <View style={{ flex: isMobile ? undefined : 1, width: "100%" }}>
              {/* 1. Header Card */}
              <View
                style={{
                  padding: rs(32),
                  marginBottom: CARD_MARGIN,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: isMobile ? undefined : HEADER_H,
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
                  padding: rs(32),
                  marginBottom: CARD_MARGIN,
                  height: isMobile ? undefined : START_SESSION_H,
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                {/* Header Section */}
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
                    }}
                  >
                    <SVG_ICONS.StartSession size={rs(64)} />
                    <View style={{ gap: rs(6) }}>
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

                {/* Select Equipment */}
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

                {/* Start Time */}
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
                        className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${timeMode === "manual" ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"}`}
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
                        className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${timeMode === "now" ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"}`}
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
                    className={`rounded-lg flex-row justify-between items-center mt-2 ${timeMode === "manual" ? "bg-white" : "bg-gray-300"}`}
                  >
                    <TextInput
                      style={[
                        { fontSize: rf(14), flex: 1, padding: 0 },
                        { outlineStyle: "none" } as any,
                      ]}
                      className="text-textPrimary-light font-inter"
                      placeholder={
                        timeMode === "now" ? "Current time" : "e.g., 11:45 AM"
                      }
                      value={timeMode === "now" ? "" : manualTime}
                      onChangeText={setManualTime}
                      editable={timeMode === "manual"}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={{ paddingVertical: rs(16) }}
                  className={`rounded-md items-center justify-center w-full ${isStartingSession ? "bg-blue-400" : "bg-mainColor-light"}`}
                  onPress={handleStartSession}
                  disabled={isStartingSession}
                >
                  <Text
                    style={{ fontSize: rf(18) }}
                    className="text-white font-inter-bold"
                  >
                    Start Using Equipment
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3. Available Equipments Card */}
              <View
                style={{
                  padding: rs(32),
                  marginBottom: CARD_MARGIN,
                  height: isMobile ? undefined : DESKTOP_INVENTORY_H,
                  minHeight: isMobile ? rs(180) : undefined,
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                <Text
                  style={{ fontSize: rf(28), marginBottom: rs(16) }}
                  className="font-inter-bold text-textPrimary-light"
                >
                  Available Equipments
                </Text>

                {/* Table Header */}
                <View
                  style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
                  className="flex-row border-b border-[#6684B0]"
                >
                  <Text
                    style={{ fontSize: rf(14), flex: 1.8 }}
                    className="font-inter-bold text-textPrimary-light"
                  >
                    Item
                  </Text>
                  <Text
                    style={{ fontSize: rf(14), flex: 0.6 }}
                    className="text-center font-inter-bold text-textPrimary-light"
                  >
                    Qty
                  </Text>
                  <Text
                    style={{ fontSize: rf(14), flex: 1 }}
                    className="text-right font-inter-bold text-textPrimary-light"
                  >
                    Status
                  </Text>
                </View>

                {/* Scrollable list Area */}
                <View style={{ height: TABLE_SCROLL_H, overflow: "hidden" }}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {loadingInventory ? (
                      <ActivityIndicator
                        size="small"
                        color="#1d4ed8"
                        style={{ marginTop: 20 }}
                      />
                    ) : (
                      inventory.map((item) => (
                        <View
                          key={item.id}
                          style={{ paddingVertical: rs(12) }}
                          className="flex-row items-center border-b border-[#DADFE5]"
                        >
                          <Text
                            style={{ fontSize: rf(14), flex: 1.8 }}
                            className="font-inter text-textPrimary-light pr-2"
                            numberOfLines={2}
                          >
                            {item.name}{" "}
                            {item.model_name ? `- ${item.model_name}` : ""}
                          </Text>
                          <Text
                            style={{ fontSize: rf(14), flex: 0.6 }}
                            className="font-inter text-center text-textPrimary-light"
                          >
                            {item.units}
                          </Text>
                          <Text
                            style={{ fontSize: rf(14), flex: 1 }}
                            className={`font-inter-bold text-right ${item.units > 0 ? "text-green-600" : "text-red-600"}`}
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
            <View style={{ flex: isMobile ? undefined : 1, width: "100%" }}>
              {/* 4. Active Sessions Card (50% of total top height) */}
              <View
                style={{
                  padding: rs(24),
                  marginBottom: CARD_MARGIN,
                  height: isMobile ? undefined : RIGHT_SPLIT_CARD_H,
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View
                    className="flex-row items-center"
                    style={{ gap: rs(12) }}
                  >
                    <SVG_ICONS.ActiveSessions size={rs(40)} />
                    <View>
                      <Text
                        style={{ fontSize: rf(20) }}
                        className="font-inter-bold text-textPrimary-light"
                      >
                        Active Sessions
                      </Text>
                      <Text
                        style={{ fontSize: rf(14) }}
                        className="font-inter text-textSecondary-light"
                      >
                        {activeSessions.length} currently in use
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setActiveHelpVisible(true)}>
                    <Feather name="help-circle" size={rs(22)} color="#1d4ed8" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {activeSessions.length === 0 ? (
                    <Text className="font-inter text-gray-400 text-center mt-4">
                      No active sessions.
                    </Text>
                  ) : (
                    activeSessions.map((session) => (
                      <View
                        key={session.id}
                        className="bg-gray-50 border border-gray-100 p-3 rounded-lg mb-2"
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{ fontSize: rf(16) }}
                              className="font-inter-bold text-textPrimary-light"
                              numberOfLines={1}
                            >
                              {session.equipment_name}
                            </Text>
                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-textSecondary-light"
                            >
                              Started: {session.time_in}
                            </Text>
                          </View>
                        </View>

                        {/* Action Row: QR and Stop */}
                        <View className="flex-row" style={{ gap: rs(8) }}>
                          <TouchableOpacity
                            onPress={() => handleOpenQRCode(session)}
                            className="flex-1 bg-mainColor-light flex-row items-center justify-center rounded-md py-2"
                          >
                            <MaterialCommunityIcons
                              name="qrcode"
                              size={rs(16)}
                              color="white"
                            />
                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-white font-inter-bold ml-1"
                            >
                              QR Code
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleStopPress(session)}
                            className="flex-1 bg-red-600 items-center justify-center rounded-md py-2"
                          >
                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-white font-inter-bold"
                            >
                              Stop
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* 4.5 Equipment Reservations Card (50% of total top height) */}
              <View
                style={{
                  padding: rs(24),
                  marginBottom: CARD_MARGIN,
                  height: isMobile ? undefined : RIGHT_SPLIT_CARD_H,
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                <View
                  className="flex-row items-center mb-4"
                  style={{ gap: rs(12) }}
                >
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={rs(40)}
                    color="#1d4ed8"
                  />
                  <View>
                    <Text
                      style={{ fontSize: rf(20) }}
                      className="font-inter-bold text-textPrimary-light"
                    >
                      Reservations
                    </Text>
                    <Text
                      style={{ fontSize: rf(14) }}
                      className="font-inter text-textSecondary-light"
                    >
                      {reservations.length} scheduled items
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {loadingReservations ? (
                    <ActivityIndicator size="small" color="#1d4ed8" />
                  ) : reservations.length === 0 ? (
                    <Text className="font-inter text-gray-400 text-center mt-4">
                      No upcoming reservations.
                    </Text>
                  ) : (
                    reservations.map((res) => (
                      <View
                        key={res.id}
                        className="border-l-4 border-blue-500 bg-blue-50/50 p-3 rounded-r-lg mb-3 flex-row justify-between items-center"
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ fontSize: rf(16) }}
                            className="font-inter-bold text-textPrimary-light"
                            numberOfLines={1}
                          >
                            {res.equipment_name}
                          </Text>
                          <Text
                            style={{ fontSize: rf(13) }}
                            className="text-textSecondary-light mt-1"
                          >
                            {res.reservation_date} • {res.time_in} -{" "}
                            {res.time_out}
                          </Text>
                        </View>

                        {/* DELETE BUTTON */}
                        <TouchableOpacity
                          onPress={() => handleDeletePress(res)}
                          className="bg-red-50 p-2 rounded-full"
                        >
                          <Feather
                            name="trash-2"
                            size={rs(18)}
                            color="#dc2626"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* FIXED BUTTON: Now matches "Start Using Equipment" design */}
                <TouchableOpacity
                  style={{ paddingVertical: rs(16), marginTop: rs(16) }}
                  className="bg-mainColor-light rounded-md items-center justify-center w-full"
                  onPress={() => setBookModalVisible(true)}
                >
                  <Text
                    style={{ fontSize: rf(18) }}
                    className="text-white font-inter-bold"
                  >
                    Book New Reservation
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 5. Stats Grid (2x2 Layout) */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  rowGap: isMobile ? rs(12) : CARD_MARGIN,
                  height: isMobile ? undefined : DESKTOP_INVENTORY_H,
                }}
              >
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
                      height: isMobile ? rs(100) : STAT_CARD_H,
                      width: "48.5%",
                    }}
                    className="bg-white rounded-2xl shadow-sm justify-center"
                  >
                    <Text
                      style={{ fontSize: rf(24) }}
                      className="font-inter-bold text-textPrimary-light"
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{ fontSize: rf(20) }}
                      className="font-inter text-textSecondary-light mt-2"
                      numberOfLines={2}
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
