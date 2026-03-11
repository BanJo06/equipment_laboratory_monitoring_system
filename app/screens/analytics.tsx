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
import DataListModal, { DataItem } from "../components/dialogs/DataListModal";

interface AnalyticsLists {
  equipment: DataItem[];
  logins: DataItem[];
  time: DataItem[];
  peak: DataItem[];
}

export default function Analytics() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- STATE ---
  const [loading, setLoading] = useState(true);

  // Stores the full lists for the modals
  const [lists, setLists] = useState<AnalyticsLists>({
    equipment: [],
    logins: [],
    time: [],
    peak: [],
  });

  // Modal control state
  const [activeModal, setActiveModal] = useState<keyof AnalyticsLists | null>(
    null,
  );

  // --- HELPER: FORMAT TIME ---
  const formatTotalTime = (totalMins: number) => {
    if (totalMins === 0) return "0h 0m";
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  const formatHourBlock = (startH: number) => {
    const endH = startH + 2;
    const formatHour = (h: number) => {
      const ampm = h >= 12 && h < 24 ? "PM" : "AM";
      const fmt = h % 12 === 0 ? 12 : h % 12;
      return `${fmt}:00 ${ampm}`;
    };
    return `${formatHour(startH)} - ${formatHour(endH)}`;
  };

  // --- DATA PROCESSING ---
  const fetchAndProcessAnalytics = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipment_logs").select("*");

    if (error || !data || data.length === 0) {
      console.error("Failed to load analytics or data is empty", error);
      setLoading(false);
      return;
    }

    const eqCounts: Record<string, number> = {};
    const loginCounts: Record<string, number> = {};
    const timeSpent: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};

    data.forEach((log) => {
      if (log.equipment_name) {
        eqCounts[log.equipment_name] = (eqCounts[log.equipment_name] || 0) + 1;
      }

      if (log.full_name) {
        loginCounts[log.full_name] = (loginCounts[log.full_name] || 0) + 1;
      }

      if (log.full_name && log.duration) {
        let mins = 0;
        const hMatch = log.duration.match(/(\d+)\s*H/i);
        const mMatch = log.duration.match(/(\d+)\s*M/i);
        if (hMatch) mins += parseInt(hMatch[1]) * 60;
        if (mMatch) mins += parseInt(mMatch[1]);

        timeSpent[log.full_name] = (timeSpent[log.full_name] || 0) + mins;
      }

      if (log.time_in) {
        const match = log.time_in.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hour = parseInt(match[1]);
          const ampm = match[3].toUpperCase();

          if (ampm === "PM" && hour < 12) hour += 12;
          if (ampm === "AM" && hour === 12) hour = 0;

          const blockStart = Math.floor(hour / 2) * 2;
          hourCounts[blockStart] = (hourCounts[blockStart] || 0) + 1;
        }
      }
    });

    // Convert dictionaries to sorted arrays
    const getSortedList = (
      obj: Record<string, number>,
      formatValue?: (val: number) => string,
    ) => {
      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({
          label,
          value: formatValue ? formatValue(value) : value.toString(),
        }));
    };

    const formattedHourCounts: Record<string, number> = {};
    Object.entries(hourCounts).forEach(([hourStr, count]) => {
      formattedHourCounts[formatHourBlock(parseInt(hourStr))] = count;
    });

    setLists({
      equipment: getSortedList(eqCounts, (val) => `${val} total log-ins`),
      logins: getSortedList(loginCounts, (val) => `${val} separate log-ins`),
      time: getSortedList(
        timeSpent,
        (val) => `${formatTotalTime(val)} total duration`,
      ),
      peak: getSortedList(
        formattedHourCounts,
        (val) => `${val} recorded sessions`,
      ),
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchAndProcessAnalytics();
  }, []);

  // --- HELPER UI ---
  const MetricCard = ({
    title,
    value,
    subtext,
    icon,
    color,
    bg,
    onPress,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: isMobile ? "100%" : "48%",
        marginBottom: rs(24),
        padding: rs(24),
      }}
      className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex-row items-center active:bg-gray-100"
    >
      <View
        style={{ marginRight: rs(20) }}
        className={`${bg} p-4 rounded-full`}
      >
        <Feather name={icon} size={rs(32)} color={color} />
      </View>
      <View className="flex-1">
        <Text
          style={{ fontSize: rf(16), marginBottom: rs(4) }}
          className="font-inter text-textSecondary-light"
        >
          {title}
        </Text>
        <Text
          style={{ fontSize: rf(16), marginBottom: rs(4) }}
          className="font-inter-bold text-textPrimary-light"
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text style={{ fontSize: rf(14) }} className="font-inter text-gray-500">
          {subtext}
        </Text>
      </View>
      <Feather name="chevron-right" size={rs(20)} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: rs(32),
        minHeight: isMobile ? rs(450) : undefined,
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      {/* MODAL MOUNTS */}
      <DataListModal
        visible={activeModal === "equipment"}
        onClose={() => setActiveModal(null)}
        title="Equipment Usage Rankings"
        icon="box"
        color="#1d4ed8"
        bg="bg-blue-100"
        data={lists.equipment}
      />
      <DataListModal
        visible={activeModal === "logins"}
        onClose={() => setActiveModal(null)}
        title="User Log-in Rankings"
        icon="user-check"
        color="#16a34a"
        bg="bg-green-100"
        data={lists.logins}
      />
      <DataListModal
        visible={activeModal === "time"}
        onClose={() => setActiveModal(null)}
        title="Active Time Rankings"
        icon="clock"
        color="#f59e0b"
        bg="bg-amber-100"
        data={lists.time}
      />
      <DataListModal
        visible={activeModal === "peak"}
        onClose={() => setActiveModal(null)}
        title="Peak Usage Timeframes"
        icon="trending-up"
        color="#dc2626"
        bg="bg-red-100"
        data={lists.peak}
      />

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
          <SVG_ICONS.Analytics size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Analytics
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Check detailed equipment usage
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {loading ? (
          <View style={{ marginTop: rs(60) }}>
            <ActivityIndicator size="large" color="#1d4ed8" />
          </View>
        ) : (
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <MetricCard
              title="Most Used Equipment"
              value={lists.equipment[0]?.label || "N/A"}
              subtext={lists.equipment[0]?.value || "0 total log-ins"}
              icon="box"
              color="#1d4ed8"
              bg="bg-blue-100"
              onPress={() => setActiveModal("equipment")}
            />
            <MetricCard
              title="Most Frequent User"
              value={lists.logins[0]?.label || "N/A"}
              subtext={lists.logins[0]?.value || "0 separate log-ins"}
              icon="user-check"
              color="#16a34a"
              bg="bg-green-100"
              onPress={() => setActiveModal("logins")}
            />
            <MetricCard
              title="Highest Time Spent"
              value={lists.time[0]?.label || "N/A"}
              subtext={lists.time[0]?.value || "0h 0m total duration"}
              icon="clock"
              color="#f59e0b"
              bg="bg-amber-100"
              onPress={() => setActiveModal("time")}
            />
            <MetricCard
              title="Peak Usage Time"
              value={lists.peak[0]?.label || "N/A"}
              subtext="Highest traffic time-frame"
              icon="trending-up"
              color="#dc2626"
              bg="bg-red-100"
              onPress={() => setActiveModal("peak")}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
