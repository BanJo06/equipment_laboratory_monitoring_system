import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface EquipmentLog {
  id: string;
  created_at: string;
  full_name: string;
  equipment_name: string;
  model_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  duration: string | null;
  status: string;
}

export default function UsageHistory() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- STATE ---
  const [logs, setLogs] = useState<EquipmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- DATA FETCHING ---
  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLogs(data);
    } else if (error) {
      console.error("Error fetching logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // --- LIVE CLOCK FOR "IN USE" DURATIONS ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatName = (fullName: string) => {
    if (!fullName) return "Unknown";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const firstNameInitial = parts[0].charAt(0).toUpperCase();
    const lastName = parts.slice(1).join(" ");
    return `${firstNameInitial}. ${lastName}`;
  };

  const getLiveDuration = (startTimeString: string) => {
    const start = new Date(startTimeString).getTime();
    const current = currentTime.getTime();
    const diff = Math.max(0, current - start);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}H ${minutes}M`;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in use":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  return (
    <View
      style={{
        flex: 1, // Keeps horizontal fill
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
          <SVG_ICONS.UsageHistory size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Usage History
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Check every equipment used
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      <View className="flex-row justify-end mb-4">
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-mainColor-light rounded-md"
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Date Picker
          </Text>
        </TouchableOpacity>
      </View>

      {/* CHANGED: Removed flex: 1 here to prevent infinite height expansion */}
      <View
        style={{ padding: rs(32) }}
        className="bg-white rounded-lg border-[2px] border-borderStrong-light"
      >
        {/* Table Header */}
        <View
          style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
          className="flex-row border-b border-[#6684B0]"
        >
          <Text
            style={{ fontSize: rf(14), flex: 1.5 }}
            className="font-inter-bold text-textPrimary-light"
          >
            User
          </Text>
          <Text
            style={{ fontSize: rf(14), flex: 1.5 }}
            className="text-center font-inter-bold text-textPrimary-light"
          >
            Equipment
          </Text>
          <Text
            style={{ fontSize: rf(14), flex: 1.5 }}
            className="text-center font-inter-bold text-textPrimary-light"
          >
            Time Used
          </Text>
          <Text
            style={{ fontSize: rf(14), flex: 1.2 }}
            className="text-center font-inter-bold text-textPrimary-light"
          >
            Duration
          </Text>
          <Text
            style={{ fontSize: rf(14), flex: 1.2 }}
            className="text-right font-inter-bold text-textPrimary-light pr-4"
          >
            Remarks
          </Text>
        </View>

        {/* CHANGED: Applied a strict maxHeight so it scrolls internally */}
        <ScrollView
          style={{ maxHeight: rs(550) }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#1d4ed8"
              style={{ marginTop: 20 }}
            />
          ) : logs.length === 0 ? (
            <Text className="text-center text-gray-500 font-inter mt-4">
              No usage history found.
            </Text>
          ) : (
            logs.map((log, idx) => {
              const statusStyle = getStatusStyle(log.status);

              return (
                <View
                  key={log.id}
                  style={{ paddingVertical: rs(12) }}
                  className={`flex-row items-center ${
                    idx !== logs.length - 1 ? "border-b border-[#DADFE5]" : ""
                  }`}
                >
                  <Text
                    style={{ fontSize: rf(14), flex: 1.5 }}
                    className="font-inter text-textPrimary-light"
                    numberOfLines={1}
                  >
                    {formatName(log.full_name)}
                  </Text>

                  <Text
                    style={{ fontSize: rf(14), flex: 1.5 }}
                    className="font-inter text-center text-textPrimary-light px-2"
                    numberOfLines={2}
                  >
                    {log.equipment_name}{" "}
                    {log.model_name ? `- ${log.model_name}` : ""}
                  </Text>

                  <Text
                    style={{ fontSize: rf(14), flex: 1.5 }}
                    className="font-inter text-center text-textPrimary-light"
                  >
                    {log.time_in} - {log.time_out || ""}
                  </Text>

                  <Text
                    style={{ fontSize: rf(14), flex: 1.2 }}
                    className="font-inter text-center text-textPrimary-light"
                  >
                    {log.status === "In Use"
                      ? getLiveDuration(log.created_at)
                      : log.duration || "-"}
                  </Text>

                  <View style={{ flex: 1.2, alignItems: "flex-end" }}>
                    <View
                      style={{
                        paddingVertical: rs(6),
                        paddingHorizontal: rs(12),
                      }}
                      className={`rounded-full ${statusStyle.bg}`}
                    >
                      <Text
                        style={{ fontSize: rf(12) }}
                        className={`font-inter-bold capitalize ${statusStyle.text}`}
                      >
                        {log.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
