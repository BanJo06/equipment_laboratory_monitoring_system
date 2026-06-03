import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import HomeHelpModal from "../components/dialogs/HomeHelpModal";

interface GroupedSession {
  full_name: string;
  initials: string;
  equipments: any[];
}

export default function Home() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- STATE ---
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSession[]>([]);
  const [totalActiveEquipments, setTotalActiveEquipments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- HELPER: GET INITIALS ---
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // --- HELPER: LIVE DURATION ---
  const getLiveDuration = (startTimeString: string) => {
    const start = new Date(startTimeString).getTime();
    const current = currentTime.getTime();
    const diff = Math.max(0, current - start);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Subtract 1 from month because arrays start at 0
    return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`;
  };

  // --- DATA FETCHING & GROUPING ---
  const fetchActiveSessions = async () => {
    setLoading(true);

    // Fetch both Active Logs AND Pending Reservations concurrently
    const [logsResponse, reservationsResponse] = await Promise.all([
      supabase
        .from("equipment_logs")
        .select("*")
        .eq("status", "In Use")
        .order("created_at", { ascending: false }),
      supabase
        .from("equipment_reservations")
        .select("*")
        .eq("status", "Pending"), // Removed the date filter so ALL pending reservations show
    ]);

    if (logsResponse.error)
      console.error("Error fetching logs:", logsResponse.error);
    if (reservationsResponse.error)
      console.error("Error fetching reservations:", reservationsResponse.error);

    const allItems: any[] = [];

    // 1. Add Active Logs
    if (logsResponse.data) {
      logsResponse.data.forEach((log) => {
        allItems.push({
          ...log,
          full_name: log.full_name?.trim(),
          isReservation: !!log.reservation_id,
          isPending: false,
        });
      });
    }

    // 2. Add Pending Reservations
    if (reservationsResponse.data) {
      reservationsResponse.data.forEach((res) => {
        allItems.push({
          id: res.id,
          full_name: res.full_name?.trim(),
          equipment_name: res.equipment_name,
          model_name: res.model_name,
          time_in: res.time_in,
          date_from: res.date_from, // Passed the date to display it
          created_at: res.created_at,
          isReservation: true,
          isPending: true,
        });
      });
    }

    setTotalActiveEquipments(allItems.length);

    // Group everything by the user's name
    const grouped = allItems.reduce((acc: GroupedSession[], item: any) => {
      const existingUser = acc.find(
        (user) => user.full_name === item.full_name,
      );
      if (existingUser) {
        existingUser.equipments.push(item);
      } else {
        acc.push({
          full_name: item.full_name,
          initials: getInitials(item.full_name),
          equipments: [item],
        });
      }
      return acc;
    }, []);

    setGroupedSessions(grouped);
    setLoading(false);
  };

  // --- INITIALIZE & REALTIME SUBSCRIPTION ---
  useEffect(() => {
    fetchActiveSessions();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Listen to Active Logs
    const logsSubscription = supabase
      .channel("active-sessions-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment_logs" },
        () => fetchActiveSessions(),
      )
      .subscribe();

    // Listen to Pending Reservations
    const resSubscription = supabase
      .channel("pending-reservations-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment_reservations" },
        () => fetchActiveSessions(),
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(logsSubscription);
      supabase.removeChannel(resSubscription);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignSelf: isMobile ? "stretch" : "flex-start",
        paddingTop: rs(32),
        paddingHorizontal: rs(32),
        paddingBottom: rs(24),
        minHeight: rs(450),
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      <HomeHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
      {/* HEADER */}
      <View
        style={{
          marginBottom: rs(24),
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
              {totalActiveEquipments}{" "}
              {totalActiveEquipments === 1 ? "equipment" : "equipments"} tracked
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
          <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
        </TouchableOpacity>
      </View>

      {/* DYNAMIC SCROLLABLE CONTAINER */}
      <View style={{ height: rs(708), overflow: "hidden" }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: rs(8), flexGrow: 1 }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#1d4ed8" />
            </View>
          ) : groupedSessions.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text className="text-center font-inter text-gray-500">
                No active sessions currently.
              </Text>
            </View>
          ) : (
            groupedSessions.map((userSession, index) => (
              <View
                key={index}
                style={{ padding: rs(20), marginBottom: rs(16) }}
                className="bg-gray-100 rounded-xl border border-gray-200"
              >
                {/* User Avatar & Name */}
                <View className="flex-row gap-4 items-center mb-4">
                  <View className="bg-blue-600 w-[48px] h-[48px] rounded-full items-center justify-center shadow-sm">
                    <Text className="text-white font-inter-bold text-[18px]">
                      {userSession.initials}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: rf(18) }}
                    className="font-inter-bold text-textPrimary-light flex-1"
                    numberOfLines={1}
                  >
                    {userSession.full_name}
                  </Text>
                </View>

                {/* User's Active/Reserved Equipment(s) */}
                <View style={{ gap: rs(12) }}>
                  {userSession.equipments.map((eq) => (
                    <View
                      key={eq.id}
                      style={{ padding: rs(16) }}
                      className={`rounded-lg border shadow-sm ${
                        eq.isPending
                          ? "bg-amber-50 border-amber-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons
                          name="flask"
                          size={rs(20)}
                          color={eq.isPending ? "#b45309" : "#1d4ed8"}
                        />
                        <Text
                          style={{ fontSize: rf(16) }}
                          className="font-inter-bold text-textPrimary-light ml-2 flex-1"
                        >
                          {eq.equipment_name}{" "}
                          {eq.model_name ? `- ${eq.model_name}` : ""}
                        </Text>

                        {/* Status Badge */}
                        {eq.isReservation && (
                          <View
                            className={`px-2 py-1 rounded-full ml-2 ${
                              eq.isPending ? "bg-amber-200" : "bg-purple-100"
                            }`}
                          >
                            <Text
                              style={{ fontSize: rf(10) }}
                              className={`font-inter-bold ${
                                eq.isPending
                                  ? "text-amber-800"
                                  : "text-purple-700"
                              }`}
                            >
                              {eq.isPending ? "UPCOMING" : "RESERVED"}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: rs(12),
                        }}
                      >
                        <View className="flex-row items-center">
                          <Feather name="clock" size={rs(16)} color="#64748b" />
                          <Text
                            style={{ fontSize: rf(14) }}
                            className="text-slate-500 font-inter ml-2"
                          >
                            {/* ADDED DATE DISPLAY SO ADMIN KNOWS IT IS FOR THE FUTURE */}
                            {eq.isPending
                              ? `${formatDisplayDate(eq.date_from)} at`
                              : "Started:"}{" "}
                            {eq.time_in}
                          </Text>
                        </View>

                        {/* Live Duration Pill or Waiting Message */}
                        <View
                          style={{
                            paddingHorizontal: rs(12),
                            paddingVertical: rs(4),
                          }}
                          className={`rounded-md border ${
                            eq.isPending
                              ? "bg-amber-100 border-amber-200"
                              : "bg-blue-50 border-blue-100"
                          }`}
                        >
                          <Text
                            style={{ fontSize: rf(14) }}
                            className={`font-inter-bold ${
                              eq.isPending ? "text-amber-700" : "text-blue-700"
                            }`}
                          >
                            {eq.isPending
                              ? "Reserved Equipment"
                              : getLiveDuration(eq.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
