import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

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

  // --- DATA FETCHING & GROUPING ---
  const fetchActiveSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment_logs")
      .select("*")
      .eq("status", "In Use")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active sessions:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setTotalActiveEquipments(data.length);

      const grouped = data.reduce((acc: GroupedSession[], log: any) => {
        const existingUser = acc.find(
          (user) => user.full_name === log.full_name,
        );
        if (existingUser) {
          existingUser.equipments.push(log);
        } else {
          acc.push({
            full_name: log.full_name,
            initials: getInitials(log.full_name),
            equipments: [log],
          });
        }
        return acc;
      }, []);

      setGroupedSessions(grouped);
    }
    setLoading(false);
  };

  // --- INITIALIZE & REALTIME SUBSCRIPTION ---
  useEffect(() => {
    fetchActiveSessions();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const logsSubscription = supabase
      .channel("active-sessions-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipment_logs",
        },
        () => {
          fetchActiveSessions();
        },
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(logsSubscription);
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
        // CHANGED: Keep card height substantial across all devices
        minHeight: rs(450),
      }}
      className="bg-white rounded-lg shadow-sm"
    >
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
              {totalActiveEquipments === 1 ? "equipment" : "equipments"} in use
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      {/* DYNAMIC SCROLLABLE CONTAINER */}
      <View style={{ maxHeight: rs(708), overflow: "hidden" }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: rs(8), flexGrow: 1 }} // flexGrow helps center items if height is large
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {loading ? (
            // CHANGED: Wrapped loader in a view with height and centered it
            <View
              style={{
                minHeight: rs(708),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#1d4ed8" />
            </View>
          ) : groupedSessions.length === 0 ? (
            // CHANGED: Wrapped empty state text in a view with height and centered it
            <View
              style={{
                minHeight: rs(708),
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

                {/* User's Active Equipment(s) */}
                <View style={{ gap: rs(12) }}>
                  {userSession.equipments.map((eq) => (
                    <View
                      key={eq.id}
                      style={{ padding: rs(16) }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons
                          name="flask"
                          size={rs(20)}
                          color="#1d4ed8"
                        />
                        <Text
                          style={{ fontSize: rf(16) }}
                          className="font-inter-bold text-textPrimary-light ml-2 flex-1"
                        >
                          {eq.equipment_name}{" "}
                          {eq.model_name ? `- ${eq.model_name}` : ""}
                        </Text>
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
                            Started: {eq.time_in}
                          </Text>
                        </View>

                        {/* Live Duration Pill */}
                        <View
                          style={{
                            paddingHorizontal: rs(12),
                            paddingVertical: rs(4),
                          }}
                          className="bg-blue-50 rounded-md border border-blue-100"
                        >
                          <Text
                            style={{ fontSize: rf(14) }}
                            className="text-blue-700 font-inter-bold"
                          >
                            {getLiveDuration(eq.created_at)}
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
