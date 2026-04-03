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
import AnalyticsHelpModal from "../components/dialogs/AnalyticsHelpModal";
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
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All time");
  const [lists, setLists] = useState<AnalyticsLists>({
    equipment: [],
    logins: [],
    time: [],
    peak: [],
  });

  const [activeModal, setActiveModal] = useState<keyof AnalyticsLists | null>(
    null,
  );
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // --- HELPERS ---
  const formatTotalTime = (totalMins: number) => {
    if (totalMins === 0) return "0h 0m";
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  const formatHourBlock = (startH: number) => {
    const endH = (startH + 2) % 24;
    const formatHour = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const fmt = h % 12 === 0 ? 12 : h % 12;
      return `${fmt}:00 ${ampm}`;
    };
    return `${formatHour(startH)} - ${formatHour(endH)}`;
  };

  // --- DATA FETCHING ---
  const fetchRawData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipment_logs").select("*");
    if (error || !data) {
      console.error("Failed to load analytics", error);
      setLoading(false);
      return;
    }
    setRawLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRawData();
  }, []);

  // --- PROCESSING LOGIC ---
  useEffect(() => {
    if (rawLogs.length === 0) return;

    const now = new Date();
    const filteredData = rawLogs.filter((log) => {
      if (activeFilter === "All time") return true;
      const logDate = new Date(log.created_at);
      const diffInMs = now.getTime() - logDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (activeFilter === "24 hours") return diffInDays <= 1;
      if (activeFilter === "3 days") return diffInDays <= 3;
      if (activeFilter === "7 days") return diffInDays <= 7;
      if (activeFilter === "30 days") return diffInDays <= 30;
      return true;
    });

    const eqCounts: Record<string, number> = {};
    const loginCounts: Record<string, number> = {};
    const timeSpent: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};

    filteredData.forEach((log) => {
      if (log.equipment_name)
        eqCounts[log.equipment_name] = (eqCounts[log.equipment_name] || 0) + 1;
      if (log.full_name)
        loginCounts[log.full_name] = (loginCounts[log.full_name] || 0) + 1;
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

    const getSortedList = (
      obj: Record<string, number>,
      formatVal: (v: number) => string,
    ) => {
      return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value: formatVal(value) }));
    };

    const formattedHourCounts: Record<string, number> = {};
    Object.entries(hourCounts).forEach(([h, count]) => {
      formattedHourCounts[formatHourBlock(parseInt(h))] = count;
    });

    setLists({
      equipment: getSortedList(eqCounts, (v) => `${v} total log-ins`),
      logins: getSortedList(loginCounts, (v) => `${v} separate log-ins`),
      time: getSortedList(
        timeSpent,
        (v) => `${formatTotalTime(v)} total duration`,
      ),
      peak: getSortedList(formattedHourCounts, (v) => `${v} sessions recorded`),
    });
  }, [rawLogs, activeFilter]);

  // --- MODAL CONFIG HELPER ---
  const getModalConfig = () => {
    if (!activeModal) return null;
    const configs = {
      equipment: {
        title: "Equipment Usage Rankings",
        icon: "box",
        color: "#1d4ed8",
        bg: "bg-blue-100",
      },
      logins: {
        title: "User Log-in Rankings",
        icon: "user-check",
        color: "#16a34a",
        bg: "bg-green-100",
      },
      time: {
        title: "Active Time Rankings",
        icon: "clock",
        color: "#f59e0b",
        bg: "bg-amber-100",
      },
      peak: {
        title: "Peak Usage Timeframes",
        icon: "trending-up",
        color: "#dc2626",
        bg: "bg-red-100",
      },
    };
    return { ...configs[activeModal], data: lists[activeModal] };
  };

  const currentModal = getModalConfig();

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
          style={{ fontSize: rf(14), marginBottom: rs(4) }}
          className="font-inter text-gray-500"
        >
          {title}
        </Text>
        <Text
          style={{ fontSize: rf(18), marginBottom: rs(4) }}
          className="font-inter-bold text-gray-900"
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text style={{ fontSize: rf(14) }} className="font-inter text-blue-600">
          {subtext}
        </Text>
      </View>
      <Feather name="chevron-right" size={rs(20)} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <View
      style={{ flex: 1, padding: rs(32) }}
      className="bg-white rounded-lg shadow-sm"
    >
      {/* Fix: Conditional rendering prevents ghost modals */}
      {activeModal && currentModal && (
        <DataListModal
          visible={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={currentModal.title}
          icon={currentModal.icon}
          color={currentModal.color}
          bg={currentModal.bg}
          data={currentModal.data}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      <AnalyticsHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      <View
        style={{
          marginBottom: rs(24),
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: rs(16) }}
        >
          <SVG_ICONS.Analytics size={rs(50)} />
          <View>
            <Text
              style={{ fontSize: rf(24) }}
              className="font-inter-bold text-gray-900"
            >
              Analytics
            </Text>
            <Text style={{ fontSize: rf(14) }} className="text-gray-500">
              Usage statistics overview
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
          <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1d4ed8"
            style={{ marginTop: 50 }}
          />
        ) : (
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <MetricCard
              title="Top Equipment"
              value={lists.equipment[0]?.label || "N/A"}
              subtext={lists.equipment[0]?.value || "0 total log-ins"}
              icon="box"
              color="#1d4ed8"
              bg="bg-blue-100"
              onPress={() => setActiveModal("equipment")}
            />
            <MetricCard
              title="Top User"
              value={lists.logins[0]?.label || "N/A"}
              subtext={lists.logins[0]?.value || "0 separate log-ins"}
              icon="user-check"
              color="#16a34a"
              bg="bg-green-100"
              onPress={() => setActiveModal("logins")}
            />
            <MetricCard
              title="Most Active"
              value={lists.time[0]?.label || "N/A"}
              subtext={lists.time[0]?.value || "0h 0m total duration"}
              icon="clock"
              color="#f59e0b"
              bg="bg-amber-100"
              onPress={() => setActiveModal("time")}
            />
            <MetricCard
              title="Peak Time"
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
