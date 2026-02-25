import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AddEquipmentModal from "../components/dialogs/AddEquipmentModal";

export default function EquipmentInventory() {
  const { width } = useWindowDimensions();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) {
      setEquipmentList(data);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

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
          <SVG_ICONS.EquipmentInventory size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Equipment Inventory
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Change equipment stock
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      <View className="flex-row justify-start mb-4">
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-mainColor-light rounded-md"
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Add Item
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ padding: rs(32) }}
          className="bg-white rounded-lg border-[2px] border-borderStrong-light"
        >
          <View
            style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
            className="flex-row border-b border-[#6684B0] items-center"
          >
            <Text
              style={{ fontSize: rf(16), flex: 2 }}
              className="font-inter-bold text-textPrimary-light"
            >
              Equipment Name
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 0.5 }}
              className="text-center font-inter-bold text-textPrimary-light"
            >
              Stock
            </Text>
            <Text style={{ fontSize: rf(16), flex: 1.2 }}></Text>
          </View>

          {equipmentList.map((item, idx) => (
            <View
              key={item.id || idx}
              style={{ paddingVertical: rs(8) }}
              className={`flex-row items-center ${idx !== equipmentList.length - 1 ? "border-b border-[#DADFE5]" : ""}`}
            >
              <Text
                style={{ fontSize: rf(16), flex: 2 }}
                className="font-inter text-textPrimary-light"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{ fontSize: rf(16), flex: 0.5 }}
                className="font-inter text-center text-textPrimary-light"
              >
                {item.units}
              </Text>
              <View
                style={{
                  flex: 1.2,
                  alignItems: "flex-end",
                  paddingRight: rs(8),
                }}
              >
                <TouchableOpacity>
                  <Feather
                    name="more-horizontal"
                    size={rs(20)}
                    color="#112747"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {equipmentList.length === 0 && (
            <Text
              style={{
                fontSize: rf(16),
                textAlign: "center",
                marginTop: rs(16),
                color: "#6684B0",
              }}
              className="font-inter"
            >
              No equipment found. Add an item to get started.
            </Text>
          )}
        </View>
      </ScrollView>

      <AddEquipmentModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchEquipment}
      />
    </View>
  );
}
