import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase"; // Make sure the path is correct
import Accounts from "./screens/accounts";
import EquipmentInventory from "./screens/equipment_inventory";
import Home from "./screens/home";
import UsageHistory from "./screens/usage_history";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();

  // --- STATE FOR NAVIGATION ---
  const [activeTab, setActiveTab] = useState("Home");

  // --- STATE FOR INVENTORY ---
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const isSmallPhone = width < 600;

  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- DATA FETCHING ---
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
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-bgPrimary-light">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: rs(24) }}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= MASTER CONTAINER ================= */}
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: "stretch",
              gap: rs(24),
            }}
          >
            {/* ================= LEFT COLUMN ================= */}
            <View style={{ flex: isMobile ? undefined : 1.5, gap: rs(24) }}>
              {/* 1. Hello Admin Card */}
              <View
                style={{
                  padding: rs(32),
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
                    Hello, Admin Joed!
                  </Text>
                  <Text
                    style={{ fontSize: rf(16) }}
                    className="font-inter text-textSecondary-light"
                  >
                    Monitor equipment usage in real-time
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
                  className="bg-mainColor-light rounded-md"
                >
                  <Text
                    style={{ fontSize: rf(16) }}
                    className="text-white font-inter-bold"
                  >
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. Middle Row (Nav & Online) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "stretch",
                  gap: rs(24),
                }}
              >
                {/* Navigation Menu */}
                <View
                  style={{ flex: 1, padding: rs(32), gap: rs(16) }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  {[
                    "Home",
                    "Accounts",
                    "Usage History",
                    "Analytics",
                    "Equipment Inventory",
                  ].map((label) => (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setActiveTab(label)}
                      style={{ paddingVertical: rs(16) }}
                      className="bg-mainColor-light rounded-md items-center justify-center w-full"
                    >
                      <Text
                        style={{ fontSize: isSmallPhone ? 14 : 16 }}
                        className="text-white font-inter-bold"
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Who's Online */}
                <View
                  style={{ flex: 1, padding: rs(32) }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <View className="mb-6">
                    <Text
                      style={{ fontSize: isSmallPhone ? rf(18) : 18 }}
                      className="text-textPrimary-light font-inter-bold"
                    >
                      Online
                    </Text>
                  </View>
                  <View className="gap-4">
                    {[
                      { n: "Juan Dela Cruz", r: "Researcher II" },
                      { n: "Carl Lozano", r: "Researcher III" },
                      { n: "Dave Yokingco", r: "Researcher III" },
                    ].map((p, i) => (
                      <View key={i} className="flex-row gap-4">
                        <View className="bg-blue-600 w-[48px] h-[48px] rounded-full" />
                        <View className="flex-col gap-1">
                          <Text className="font-inter-bold text-[16px] text-textPrimary-light">
                            {p.n}
                          </Text>
                          <Text className="font-inter text-[14px] text-textSecondary-light">
                            {p.r}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* 3. Available Equipments Table */}
              <View
                style={{ padding: rs(32) }}
                className="bg-white rounded-lg shadow-sm"
              >
                <Text
                  style={{ fontSize: rf(28), marginBottom: rs(16) }}
                  className="font-inter-bold text-textPrimary-light"
                >
                  Available Equipments
                </Text>

                {/* Header (Fixed at the top) */}
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
                    Status
                  </Text>
                </View>

                {/* STRICT SCROLLABLE CONTAINER */}
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
                    {/* Dynamic Rows */}
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

            {/* ================= RIGHT COLUMN (DYNAMIC) ================= */}
            {activeTab === "Home" && <Home />}
            {activeTab === "Accounts" && <Accounts />}
            {activeTab === "Usage History" && <UsageHistory />}
            {activeTab === "Equipment Inventory" && <EquipmentInventory />}

            {/* Fallback view for unbuilt pages */}
            {activeTab == "Analytics" && (
              <View
                style={{
                  flex: 1,
                  padding: rs(32),
                  minHeight: isMobile ? rs(450) : undefined,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className="bg-white rounded-lg shadow-sm"
              >
                <Text
                  style={{ fontSize: rf(24) }}
                  className="font-inter-bold text-textPrimary-light text-center"
                >
                  {activeTab} Content Coming Soon...
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: rs(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
