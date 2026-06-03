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

  const { id, first_name, last_name } = useLocalSearchParams();
  const fullNameStr = `${first_name || "Unknown"} ${last_name || ""}`.trim();

  // Modal state management
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  // --- IDLE LOGOUT LOGIC ---
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIME_LIMIT = 5 * 60 * 1000;
  const isInitialMount = useRef(true);

  // ─────────────────────────────────────────────────────────────────
  // KEY FIX: updateOnlineStatus only sets to FALSE now.
  // isOnline is set to TRUE exclusively inside log-in.tsx before
  // navigation, so there is never a gap where the DB shows false
  // while the dashboard is already mounted.
  // ─────────────────────────────────────────────────────────────────
  const updateOnlineStatus = async (status: boolean) => {
    if (!id) return;
    try {
      console.log(
        `[Status] DB Sync: Attempting to set isOnline=${status} for ID: ${id}`,
      );
      const { data, error } = await supabase
        .from("accounts")
        .update({ isOnline: status })
        .eq("id", id)
        .select();

      if (error) {
        console.error(`[Status] DB Error: ${error.message}`);
      } else {
        console.log(
          `[Status] DB Success: isOnline is now ${status}. Affected: ${data?.length}`,
        );
      }
    } catch (err) {
      console.error("[Status] Unexpected error:", err);
    }
  };

  // Use a ref so the timer callback always calls the latest version
  // of forceLogout without needing to re-register the timer.
  const forceLogoutRef = useRef<() => void>(() => {});

  useEffect(() => {
    forceLogoutRef.current = async () => {
      if (!id) return;

      console.log(
        `[Idle] 5-minute inactivity threshold reached. Force logging out user: ${id}`,
      );

      // Clear timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      // Update DB
      await updateOnlineStatus(false);

      // Update UI
      setStatusConfig({
        visible: true,
        title: "Session Expired",
        message: "Inactivity for 5 minutes detected. You have been logged out.",
        onCloseOverride: () => router.replace("/"),
      });
    };
  }, [id]);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Always call the ref, not a captured closure, so it's never stale
    idleTimerRef.current = setTimeout(
      () => forceLogoutRef.current(),
      IDLE_TIME_LIMIT,
    );
  };

  useEffect(() => {
    if (!id) return;

    // Set to TRUE immediately on mount
    updateOnlineStatus(true);

    // Start the idle timer
    resetIdleTimer();

    const handleActivity = () => resetIdleTimer();
    const ACTIVITY_EVENTS = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ] as const;

    // Track activity to prevent idle logout
    if (Platform.OS === "web") {
      ACTIVITY_EVENTS.forEach((e) =>
        window.addEventListener(e, handleActivity, { passive: true }),
      );
    }

    // --- THE CHANGE IS HERE ---
    // We removed AppState and visibilitychange listeners that send 'false'.
    // We ONLY keep the listeners that confirm we are still active.

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("[Lifecycle] App active, ensuring status is true.");
        updateOnlineStatus(true);
      }
      // We do NOT send false here anymore.
    });

    const handleBeforeUnload = () => {
      console.log(
        "[Lifecycle] Tab/Browser closing. Final attempt to set false.",
      );
      updateOnlineStatus(false);
    };

    if (Platform.OS === "web") {
      // This ONLY fires when the tab is actually closed or refreshed
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, handleActivity),
      );
      appStateSub.remove();
      if (Platform.OS === "web") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
      // Optional: Only set to false on a real component unmount
      updateOnlineStatus(false);
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

  const [timeMode, setTimeMode] = useState<"now" | "manual">("now");
  const [manualTime, setManualTime] = useState("");
  const [isStartingSession, setIsStartingSession] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const CARD_MARGIN = rs(24);
  const HEADER_H = rs(140);
  const START_SESSION_H = rs(452);
  const TOTAL_TOP_HEIGHT = HEADER_H + CARD_MARGIN + START_SESSION_H;
  const RIGHT_SPLIT_CARD_H = (TOTAL_TOP_HEIGHT - CARD_MARGIN) / 2;
  const DESKTOP_INVENTORY_H = rs(260);
  const STAT_CARD_H = (DESKTOP_INVENTORY_H - CARD_MARGIN) / 2;
  const TABLE_SCROLL_H = isMobile ? rs(200) : rs(120);

  const getFormattedDuration = (startTime: number, endTime: number) => {
    const diff = Math.max(0, endTime - startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}H ${minutes}M`;
  };

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     const now = new Date();
  //     setCurrentTime(now);

  //     // Trigger sync every minute (when seconds are 0)
  //     // to prevent excessive DB calls while maintaining accuracy
  //     if (now.getSeconds() === 0) {
  //       syncReservationsWithLogs();
  //     }
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, [reservations]); // Add reservations as dependency

  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Sync if it's been more than 30 seconds since the last check
      if (now.getTime() - lastSyncRef.current > 30000) {
        syncReservationsWithLogs();
        lastSyncRef.current = now.getTime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservations]);

  // const parseDateTime = (dateStr: string, timeStr: string) => {
  //   const [time, modifier] = timeStr.split(" ");
  //   let [hours, minutes] = time.split(":").map(Number);
  //   if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
  //   if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;
  //   const date = new Date(dateStr);
  //   date.setHours(hours, minutes, 0, 0);
  //   return date.getTime();
  // };

  const parseDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 0;

    // Handles "10:38 AM", "10:38am", "10:38PM" etc.
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 0;

    let [, hoursStr, minutesStr, modifier] = match;
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    if (modifier.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

    // Split date components to avoid UTC/Local timezone confusion
    const [year, month, day] = dateStr.split("-").map(Number);

    // Create date using local time constructor
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return date.getTime();
  };

  // For reservation equipments
  const isTimeReached = (dateStr: string, timeStr: string) => {
    const target = parseDateTime(dateStr, timeStr);
    const now = new Date().getTime();
    return now >= target;
  };

  const syncReservationsWithLogs = async () => {
    if (reservations.length === 0) return;

    for (const res of reservations) {
      const startTimeEpoch = parseDateTime(res.date_from, res.time_in);
      const endTimeEpoch = parseDateTime(res.date_to, res.time_out);
      const now = new Date().getTime();

      if (startTimeEpoch === 0 || endTimeEpoch === 0) continue;

      // Phase 1: START TIME REACHED
      // If it's time to start and the reservation is still "Pending"
      if (
        now >= startTimeEpoch &&
        now < endTimeEpoch &&
        res.status === "Pending"
      ) {
        console.log(`[Sync] Activating reservation: ${res.equipment_name}`);

        // Update the reservation status so it stays in the DB but is marked as active
        const { error: updateError } = await supabase
          .from("equipment_reservations")
          .update({ status: "In Progress" })
          .eq("id", res.id);

        if (!updateError) {
          // Create the log entry to show it in the "Active Sessions" card
          await supabase.from("equipment_logs").insert([
            {
              full_name: fullNameStr,
              equipment_name: res.equipment_name,
              model_name: res.model_name,
              location: res.location,
              date: res.date_from,
              time_in: res.time_in,
              status: "In Use",
              reservation_id: res.id,
            },
          ]);

          // Refresh UI
          fetchReservations();
          fetchActiveSessions();
        }
      }

      // Phase 2: END TIME REACHED
      // This is the ONLY place where the reservation should be deleted
      if (now >= endTimeEpoch) {
        console.log(
          `[Sync] Cleaning up expired reservation: ${res.equipment_name}`,
        );
        const finalDuration = getFormattedDuration(
          startTimeEpoch,
          endTimeEpoch,
        );

        // Finalize the log record
        await supabase
          .from("equipment_logs")
          .update({
            status: "Completed",
            time_out: res.time_out,
            duration: finalDuration,
          })
          .eq("reservation_id", res.id);

        // NOW we delete the reservation and return the stock
        await returnEquipmentStock(res.equipment_name);
        await supabase.from("equipment_reservations").delete().eq("id", res.id);

        // Final UI Refresh
        fetchReservations();
        fetchInventory();
        fetchActiveSessions();
      }
    }
  };

  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from("equipment_logs")
      .select("*")
      .eq("full_name", fullNameStr)
      .eq("status", "In Use")
      .order("created_at", { ascending: false });
    if (!error && data) setActiveSessions(data);
    else if (error) console.error("Error fetching active sessions:", error);
  };

  const fetchInventory = async () => {
    setLoadingInventory(true);
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data) setInventory(data);
    else if (error) console.error("Error fetching inventory:", error);
    setLoadingInventory(false);
  };

  const fetchReservations = async () => {
    if (!fullNameStr || fullNameStr.includes("Unknown")) return;
    setLoadingReservations(true);

    const { data, error } = await supabase
      .from("equipment_reservations")
      .select("*")
      .ilike("full_name", `%${fullNameStr.trim()}%`)
      // CHANGE: Fetch both Pending and In Progress so they stay in the list
      .in("status", ["Pending", "In Progress"])
      .order("date_from", { ascending: true });

    if (error) console.error("Fetch Error:", error);
    else setReservations(data || []);
    setLoadingReservations(false);
  };

  useEffect(() => {
    fetchInventory();
    if (fullNameStr) {
      fetchActiveSessions();
      fetchReservations();
    }
  }, [fullNameStr]);

  const handleLogoutPress = () => setLogoutModalVisible(true);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (id) {
        await supabase
          .from("accounts")
          .update({ isOnline: false })
          .eq("id", id);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
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
      location: session.location || "designated area",
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

    setIsStartingSession(true);

    const currentDate = new Date().toISOString().split("T")[0];
    const timeIn =
      timeMode === "now"
        ? new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : manualTime;

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
    setStopModalConfig((prev) => ({ ...prev, visible: false }));
    if (mode === "cancel") {
      await handleCancelSession(session);
    } else {
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

    const { error } = await supabase
      .from("equipment_logs")
      .update({
        time_out: timeOut,
        duration: finalDuration,
        status: "Completed",
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

    // If this session came from a reservation, delete the mirrored reservation
    if (session.reservation_id) {
      const { error: resError } = await supabase
        .from("equipment_reservations")
        .delete()
        .eq("id", session.reservation_id);

      if (resError) {
        console.error("Error deleting mirrored reservation:", resError);
      }
    }

    await returnEquipmentStock(session.equipment_name);
    setStatusConfig((prev) => ({
      ...prev,
      visible: true,
      title: "Session Stopped",
      message: "The session has been successfully stopped and recorded.",
    }));

    // Refresh UI
    fetchActiveSessions();
    fetchReservations();
    fetchInventory();
    setIsStoppingSession(false);
  };

  const handleCancelSession = async (session: any) => {
    setIsStoppingSession(true);
    const startEpoch = parseDateTime(session.date, session.time_in);
    const currentEpoch = new Date().getTime();
    const diffInMinutes = (currentEpoch - startEpoch) / (1000 * 60);
    let statusTitle = "";
    let statusMsg = "";

    try {
      if (session.reservation_id || diffInMinutes >= 2) {
        const timeOut = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const finalDuration = getFormattedDuration(startEpoch, currentEpoch);
        const { error } = await supabase
          .from("equipment_logs")
          .update({
            time_out: timeOut,
            duration: finalDuration,
            status: "Completed",
          })
          .eq("id", session.id);
        if (error) throw error;
        statusTitle = "Session Completed";
        statusMsg =
          "Usage exceeded 2 minutes. Log has been marked as completed.";
      } else {
        const { error } = await supabase
          .from("equipment_logs")
          .delete()
          .eq("id", session.id);
        if (error) throw error;
        statusTitle = "Log Removed";
        statusMsg =
          "Session cancelled within 2 minutes. The log was not recorded.";
      }

      // If this session came from a reservation, delete the mirrored reservation
      if (session.reservation_id) {
        const { error: resError } = await supabase
          .from("equipment_reservations")
          .delete()
          .eq("id", session.reservation_id);

        if (resError) {
          console.error("Error deleting mirrored reservation:", resError);
        }
      }

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
      // Refresh UI
      fetchActiveSessions();
      fetchReservations();
      fetchInventory();
      setIsStoppingSession(false);
    }
  };

  const returnEquipmentStock = async (equipmentName: string) => {
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

  const handleDeletePress = (reservation: any) => {
    setReservationToDelete(reservation);
    setDeleteModalVisible(true);
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Delete associated equipment_logs if they exist
      const { error: logError } = await supabase
        .from("equipment_logs")
        .delete()
        .eq("reservation_id", reservationToDelete.id);

      if (logError) console.error("Error deleting linked log:", logError);

      // 2. Return Stock
      const { data: invData } = await supabase
        .from("equipment_inventory")
        .select("id, units")
        .eq("name", reservationToDelete.equipment_name)
        .single();

      if (invData) {
        await supabase
          .from("equipment_inventory")
          .update({ units: invData.units + 1 })
          .eq("id", invData.id);
      }

      // 3. Delete the reservation itself
      const { error: resError } = await supabase
        .from("equipment_reservations")
        .delete()
        .eq("id", reservationToDelete.id);

      if (resError) throw resError;

      setStatusConfig({
        visible: true,
        title: "Reservation Cancelled",
        message: "Reservation and any active logs have been removed.",
        onCloseOverride: null,
      });

      fetchReservations();
      fetchInventory();
      fetchActiveSessions();
    } catch (error) {
      setStatusConfig((prev) => ({
        ...prev,
        visible: true,
        title: "Deletion Failed",
        message:
          "We couldn't delete the reservation. Please check your connection.",
      }));
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const totalAvailableStock = inventory.reduce(
    (total, item) => total + item.units,
    0,
  );

  const liveDateTime = currentTime.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formatReservationDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Split to avoid timezone shift issues (creates a local date)
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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
          fetchReservations();
          fetchInventory();
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
            {/* LEFT COLUMN */}
            <View style={{ flex: isMobile ? undefined : 1, width: "100%" }}>
              {/* Header Card */}
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

              {/* Start Session Card */}
              <View
                style={{
                  padding: rs(32),
                  marginBottom: CARD_MARGIN,
                  height: isMobile ? undefined : START_SESSION_H,
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

              {/* Available Equipments Card */}
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

            {/* RIGHT COLUMN */}
            <View style={{ flex: isMobile ? undefined : 1, width: "100%" }}>
              {/* Active Sessions Card */}
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
                            <View
                              className="flex-row items-center flex-wrap"
                              style={{ gap: rs(6) }}
                            >
                              <Text
                                style={{ fontSize: rf(16) }}
                                className="font-inter-bold text-textPrimary-light"
                                numberOfLines={1}
                              >
                                {session.equipment_name}
                              </Text>

                              {/* NEW: Conditional Reservation Badge */}
                              {session.reservation_id && (
                                <View className="bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                                  <Text
                                    style={{ fontSize: rf(10) }}
                                    className="text-blue-700 font-inter-bold"
                                  >
                                    Under reservation log
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-textSecondary-light mt-1"
                            >
                              Started: {session.time_in}
                            </Text>
                          </View>
                        </View>

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

              {/* Reservations Card */}
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
                  <SVG_ICONS.BookReservation size={rs(40)} />
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
                        className={`border-l-4 p-3 rounded-r-lg mb-3 flex-row justify-between items-center ${
                          res.status === "In Progress"
                            ? "border-green-500 bg-green-50/50"
                            : "border-blue-500 bg-blue-50/50"
                        }`}
                      >
                        <View style={{ flex: 1 }}>
                          <View className="flex-row items-center">
                            <Text
                              style={{ fontSize: rf(16) }}
                              className="font-inter-bold text-textPrimary-light"
                              numberOfLines={1}
                            >
                              {res.equipment_name}
                            </Text>
                            {/* ADD THIS STATUS BADGE */}
                            {res.status === "In Progress" && (
                              <View className="bg-green-600 px-2 py-0.5 rounded-full ml-2">
                                <Text
                                  style={{ fontSize: rf(10) }}
                                  className="text-white font-inter-bold"
                                >
                                  ACTIVE
                                </Text>
                              </View>
                            )}
                          </View>

                          <View className="mt-1">
                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-textPrimary-light font-inter-bold"
                            >
                              {formatReservationDate(res.date_from)} -{" "}
                              {formatReservationDate(res.date_to)}
                            </Text>
                            <Text
                              style={{ fontSize: rf(12) }}
                              className="text-textSecondary-light"
                            >
                              {res.time_in} - {res.time_out}
                            </Text>
                          </View>
                        </View>

                        {/* Only show delete button if it hasn't started yet, or keep it if you want to allow cancelling active sessions */}
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

              {/* Stats Grid */}
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
