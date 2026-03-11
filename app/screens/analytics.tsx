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

interface AnalyticsMetrics {
  mostUsedEquipment: string;
  mostUsedEqCount: number;
  mostLoginsUser: string;
  mostLoginsCount: number;
  mostActiveUser: string;
  mostActiveMinutes: number;
  peakTimeFrame: string;
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
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    mostUsedEquipment: "N/A",
    mostUsedEqCount: 0,
    mostLoginsUser: "N/A",
    mostLoginsCount: 0,
    mostActiveUser: "N/A",
    mostActiveMinutes: 0,
    peakTimeFrame: "N/A",
  });

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
    const timeSpent: Record<string, number> = {}; // Stored in total minutes
    const hourCounts: Record<number, number> = {}; // Groups time into 2-hour blocks

    data.forEach((log) => {
      // 1. Equipment Usage Count
      if (log.equipment_name) {
        eqCounts[log.equipment_name] = (eqCounts[log.equipment_name] || 0) + 1;
      }

      // 2. User Log-in Count
      if (log.full_name) {
        loginCounts[log.full_name] = (loginCounts[log.full_name] || 0) + 1;
      }

      // 3. User Total Time Spent
      if (log.full_name && log.duration) {
        let mins = 0;
        // Extracts numbers before "H" and "M" (e.g., "2H 30M")
        const hMatch = log.duration.match(/(\d+)\s*H/i);
        const mMatch = log.duration.match(/(\d+)\s*M/i);
        if (hMatch) mins += parseInt(hMatch[1]) * 60;
        if (mMatch) mins += parseInt(mMatch[1]);

        timeSpent[log.full_name] = (timeSpent[log.full_name] || 0) + mins;
      }

      // 4. Peak Time Frame Grouping
      if (log.time_in) {
        const match = log.time_in.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hour = parseInt(match[1]);
          const ampm = match[3].toUpperCase();

          // Convert to 24-hour format for easier math
          if (ampm === "PM" && hour < 12) hour += 12;
          if (ampm === "AM" && hour === 12) hour = 0;

          // Group into 2-hour blocks (e.g., 8 means 8:00 AM - 10:00 AM)
          const blockStart = Math.floor(hour / 2) * 2;
          hourCounts[blockStart] = (hourCounts[blockStart] || 0) + 1;
        }
      }
    });

    // Helper to find the highest value in a dictionary
    const getTop = (obj: Record<string, number>) =>
      Object.entries(obj).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    const topEq = getTop(eqCounts);
    const topLogin = getTop(loginCounts);
    const topTime = getTop(timeSpent);
    const topHour = getTop(hourCounts);

    // Format the Peak Time Frame string
    let peakStr = "N/A";
    if (topHour[0] !== "N/A") {
      const startH = parseInt(topHour[0]);
      const endH = startH + 2;

      const formatHour = (h: number) => {
        const ampm = h >= 12 && h < 24 ? "PM" : "AM";
        const fmt = h % 12 === 0 ? 12 : h % 12;
        return `${fmt}:00 ${ampm}`;
      };
      peakStr = `${formatHour(startH)} - ${formatHour(endH)}`;
    }

    setMetrics({
      mostUsedEquipment: topEq[0],
      mostUsedEqCount: topEq[1] as number,
      mostLoginsUser: topLogin[0],
      mostLoginsCount: topLogin[1] as number,
      mostActiveUser: topTime[0],
      mostActiveMinutes: topTime[1] as number,
      peakTimeFrame: peakStr,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchAndProcessAnalytics();
  }, []);

  // --- HELPER UI ---
  const formatTotalTime = (totalMins: number) => {
    if (totalMins === 0) return "0h 0m";
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m total duration`;
  };

  const MetricCard = ({ title, value, subtext, icon, color, bg }: any) => (
    <View
      style={{
        width: isMobile ? "100%" : "48%",
        marginBottom: rs(24),
        padding: rs(24),
      }}
      className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex-row items-center"
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
          style={{ fontSize: rf(24), marginBottom: rs(4) }}
          className="font-inter-bold text-textPrimary-light"
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text style={{ fontSize: rf(14) }} className="font-inter text-gray-500">
          {subtext}
        </Text>
      </View>
    </View>
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
              value={metrics.mostUsedEquipment}
              subtext={`${metrics.mostUsedEqCount} total log-ins`}
              icon="box"
              color="#1d4ed8"
              bg="bg-blue-100"
            />
            <MetricCard
              title="Most Frequent User"
              value={metrics.mostLoginsUser}
              subtext={`${metrics.mostLoginsCount} separate log-ins`}
              icon="user-check"
              color="#16a34a"
              bg="bg-green-100"
            />
            <MetricCard
              title="Highest Time Spent"
              value={metrics.mostActiveUser}
              subtext={formatTotalTime(metrics.mostActiveMinutes)}
              icon="clock"
              color="#f59e0b"
              bg="bg-amber-100"
            />
            <MetricCard
              title="Peak Usage Time"
              value={metrics.peakTimeFrame}
              subtext="Highest traffic time-frame"
              icon="trending-up"
              color="#dc2626"
              bg="bg-red-100"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
