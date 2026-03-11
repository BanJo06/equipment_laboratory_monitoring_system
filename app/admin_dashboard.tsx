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
import { supabase } from "../lib/supabase";
import Accounts from "./screens/accounts";
import Analytics from "./screens/analytics";
import EquipmentInventory from "./screens/equipment_inventory";
import Home from "./screens/home";
import UsageHistory from "./screens/usage_history";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();

  // --- STATE FOR NAVIGATION ---
  const [activeTab, setActiveTab] = useState("Home");

  // --- STATE FOR INVENTORY & ONLINE USERS ---
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(true);

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

  const fetchOnlineUsers = async () => {
    setLoadingOnline(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("first_name, last_name, role")
      .eq("isOnline", true)
      .neq("role", "admin"); // Database-level exclusion

    if (!error && data) {
      // Client-side fallback exclusion (catches "Admin" or "ADMIN" just in case of casing differences)
      const filteredUsers = data.filter(
        (user) => user.role?.toLowerCase() !== "admin",
      );
      setOnlineUsers(filteredUsers);
    } else if (error) {
      console.error("Error fetching online users:", error);
    }
    setLoadingOnline(false);
  };

  // --- INITIAL FETCH & REALTIME SUBSCRIPTION ---
  useEffect(() => {
    fetchInventory();
    fetchOnlineUsers();

    // Set up Realtime subscription for live online status updates
    const accountsSubscription = supabase
      .channel("accounts-online-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "accounts",
        },
        () => {
          // Re-fetch online users whenever any account is updated
          fetchOnlineUsers();
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(accountsSubscription);
    };
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
                  <View className="mb-6 flex-row justify-between items-center">
                    <Text
                      style={{ fontSize: isSmallPhone ? rf(18) : 18 }}
                      className="text-textPrimary-light font-inter-bold"
                    >
                      Online
                    </Text>
                    <View className="bg-green-100 px-2 py-1 rounded-full">
                      <Text className="text-green-700 font-inter-bold text-xs">
                        {onlineUsers.length} Active
                      </Text>
                    </View>
                  </View>

                  {/* DYNAMIC SCROLLABLE USER LIST */}
                  <ScrollView
                    style={{ maxHeight: rs(250) }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View className="gap-4">
                      {loadingOnline ? (
                        <ActivityIndicator
                          color="#1d4ed8"
                          style={{ marginTop: 20 }}
                        />
                      ) : onlineUsers.length === 0 ? (
                        <Text className="text-gray-500 font-inter text-center mt-4">
                          No users online.
                        </Text>
                      ) : (
                        onlineUsers.map((user, i) => (
                          <View key={i} className="flex-row gap-4 items-center">
                            <View className="relative">
                              <View className="bg-blue-600 w-[48px] h-[48px] rounded-full items-center justify-center">
                                <Text className="text-white font-inter-bold text-[18px]">
                                  {user.first_name?.charAt(0)}
                                  {user.last_name?.charAt(0)}
                                </Text>
                              </View>
                              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            </View>

                            <View className="flex-col gap-1 flex-1">
                              <Text
                                className="font-inter-bold text-[16px] text-textPrimary-light"
                                numberOfLines={1}
                              >
                                {user.first_name} {user.last_name}
                              </Text>
                              <Text className="font-inter text-[14px] text-textSecondary-light capitalize">
                                {user.role || "User"}
                              </Text>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  </ScrollView>
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

            {/* ================= RIGHT COLUMN (DYNAMIC) ================= */}
            {activeTab === "Home" && <Home />}
            {activeTab === "Accounts" && <Accounts />}
            {activeTab === "Usage History" && <UsageHistory />}
            {activeTab === "Equipment Inventory" && <EquipmentInventory />}

            {activeTab == "Analytics" && <Analytics />}
          </View>

          <View style={{ height: rs(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
