import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface Equipment {
  id: string;
  name: string;
  units: number;
  model_name: string;
}

interface ChooseEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (equipment: Equipment) => void;
}

export default function ChooseEquipmentModal({
  visible,
  onClose,
  onSelect,
}: ChooseEquipmentModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const [searchQuery, setSearchQuery] = useState("");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEquipments();
      setSearchQuery("");
    }
  }, [visible]);

  const fetchEquipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("id, name, units, model_name")
      .order("name", { ascending: true });

    if (!error && data) {
      setEquipments(data);
    }
    setLoading(false);
  };

  const filteredEquipments = equipments.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.model_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        <View
          style={{
            width: isMobile ? "100%" : 500,
            maxHeight: "80%",
            padding: rf(24),
          }}
          className="bg-white rounded-xl shadow-lg flex-shrink-1"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ fontSize: rf(24) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Select Equipment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={rs(24)} color="#112747" />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={{ marginBottom: rs(16) }}>
            <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2 bg-[#F8FAFC]">
              <Feather name="search" size={rs(18)} color="gray" />
              <TextInput
                style={[
                  { fontSize: rf(14), marginLeft: rs(8), flex: 1 },
                  { outlineStyle: "none" } as any, // Bypasses TypeScript error for web-only style
                ]}
                className="font-inter text-textPrimary-light"
                placeholder="Search equipment..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Table Headers */}
          <View className="flex-row border-b border-[#6684B0] pb-2 mb-2">
            <Text
              style={{ fontSize: rf(14), flex: 3 }}
              className="font-inter-bold text-textPrimary-light"
            >
              Item
            </Text>
            <Text
              style={{ fontSize: rf(14), flex: 1 }}
              className="font-inter-bold text-textPrimary-light text-right"
            >
              Stock
            </Text>
          </View>

          {/* Table List */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#1d4ed8"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <FlatList
              data={filteredEquipments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: rs(12) }}
                  className="flex-row items-center border-b border-[#DADFE5]"
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text
                    style={{ fontSize: rf(14), flex: 3 }}
                    className="font-inter text-textPrimary-light"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ fontSize: rf(14), flex: 1 }}
                    className="font-inter text-textPrimary-light text-right"
                  >
                    {item.units}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    fontSize: rf(14),
                    textAlign: "center",
                    marginTop: rs(20),
                  }}
                  className="font-inter text-gray-500"
                >
                  No equipment found.
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
