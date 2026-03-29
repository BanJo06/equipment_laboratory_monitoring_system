import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AddEquipmentModal from "../components/dialogs/AddEquipmentModal";
import DeleteEquipmentModal from "../components/dialogs/DeleteEquipmentModal";
import EquipmentDetailsModal from "../components/dialogs/EquipmentDetailsModal";
import EquipmentInventoryHelpModal from "../components/dialogs/EquipmentInventoryHelpModal";
import StatusModal from "../components/dialogs/StatusModal";

export default function EquipmentInventory() {
  const { width } = useWindowDimensions();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [equipmentToEdit, setEquipmentToEdit] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(
    null,
  );

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEquipmentDetails, setSelectedEquipmentDetails] =
    useState<any>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "units" | "model_name" | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("cached_equipment_list");
      if (cachedData) {
        setEquipmentList(JSON.parse(cachedData));
        setIsFetching(false);
      }
    } catch (error) {
      console.error("Cache load error:", error);
    }
    fetchEquipment(false);
  };

  const fetchEquipment = async (showLoader = true) => {
    if (showLoader) setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("equipment_inventory")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      if (data) {
        setEquipmentList(data);
        await AsyncStorage.setItem(
          "cached_equipment_list",
          JSON.stringify(data),
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadCachedData();
  }, []);

  const requestSort = (key: "name" | "units" | "model_name") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEquipment = React.useMemo(() => {
    let result = equipmentList.filter((item) => {
      const nameMatch = item.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const modelMatch = item.model_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      return nameMatch || modelMatch;
    });

    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [equipmentList, sortConfig, searchQuery]);

  const openAddModal = () => {
    setEquipmentToEdit(null);
    setIsAddModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEquipmentToEdit(item);
    setActiveDropdown(null);
    setIsAddModalVisible(true);
  };

  const openDetailsModal = (item: any) => {
    setActiveDropdown(null);
    setSelectedEquipmentDetails(item);
    setDetailsModalVisible(true);
  };

  const confirmDelete = (id: string) => {
    setActiveDropdown(null);
    setEquipmentToDelete(id);
    setDeleteModalVisible(true);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: rs(32),
        minHeight: isMobile ? rs(450) : undefined,
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      <AddEquipmentModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        equipmentToEdit={equipmentToEdit}
        onSuccess={() => fetchEquipment(false)}
      />

      <DeleteEquipmentModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        equipmentId={equipmentToDelete}
        onSuccess={() => {
          fetchEquipment(false);
          setSuccessModalVisible(true);
        }}
      />

      <EquipmentDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        equipment={selectedEquipmentDetails}
      />

      <StatusModal
        visible={successModalVisible}
        title="Success"
        message="Item successfully deleted."
        onClose={() => setSuccessModalVisible(false)}
      />

      <EquipmentInventoryHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      {/* Header */}
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
        <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
          <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
        </TouchableOpacity>
      </View>

      {/* Actions & Search */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          style={{
            paddingVertical: rs(10),
            paddingHorizontal: rs(16),
            minWidth: rs(140),
            alignItems: "center",
          }}
          className="bg-mainColor-light rounded-md"
          onPress={openAddModal}
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Add Item
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[
            {
              height: rs(40),
              paddingHorizontal: rs(12),
              fontSize: rf(14),
              borderRadius: 6,
              minWidth: rs(250),
            },
            { outlineStyle: "none" } as any,
          ]}
          className="font-inter border border-borderStrong-light text-textPrimary-light bg-[#F8FAFC]"
          placeholder="Search name or model..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Table */}
      <View
        style={{ padding: rs(32), zIndex: 10 }}
        className="bg-white rounded-lg border-[2px] border-borderStrong-light"
      >
        <View
          style={{ paddingBottom: rs(8), marginBottom: rs(8), zIndex: 11 }}
          className="flex-row border-b border-[#6684B0] items-center"
        >
          <TouchableOpacity
            onPress={() => requestSort("name")}
            style={{
              flex: 1.5,
              flexDirection: "row",
              alignItems: "center",
              gap: rs(4),
            }}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Name
            </Text>
            {sortConfig.key === "name" && (
              <Feather
                name={
                  sortConfig.direction === "asc" ? "arrow-up" : "arrow-down"
                }
                size={rs(14)}
                color="#1d4ed8"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => requestSort("model_name")}
            style={{
              flex: 1.5,
              flexDirection: "row",
              alignItems: "center",
              gap: rs(4),
            }}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Model Name
            </Text>
            {sortConfig.key === "model_name" && (
              <Feather
                name={
                  sortConfig.direction === "asc" ? "arrow-up" : "arrow-down"
                }
                size={rs(14)}
                color="#1d4ed8"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => requestSort("units")}
            style={{
              flex: 0.6,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: rs(4),
            }}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="text-center font-inter-bold text-textPrimary-light"
            >
              Stock
            </Text>
            {sortConfig.key === "units" && (
              <Feather
                name={
                  sortConfig.direction === "asc" ? "arrow-up" : "arrow-down"
                }
                size={rs(14)}
                color="#1d4ed8"
              />
            )}
          </TouchableOpacity>

          <View style={{ flex: 0.8 }} />
        </View>

        <View style={{ height: Math.floor(rs(544)), zIndex: 10 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: rs(120), flexGrow: 1 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {isFetching && equipmentList.length === 0 ? (
              <View style={{ padding: rs(32), alignItems: "center" }}>
                <ActivityIndicator size="large" color="#1d4ed8" />
              </View>
            ) : filteredAndSortedEquipment.length === 0 ? (
              <Text
                style={{
                  padding: rs(16),
                  textAlign: "center",
                  fontSize: rf(16),
                }}
                className="font-inter text-[#6684B0]"
              >
                {searchQuery ? "No matches found." : "No equipment found."}
              </Text>
            ) : (
              filteredAndSortedEquipment.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={{
                    paddingVertical: rs(12),
                    zIndex: activeDropdown === item.id ? 100 : 1,
                  }}
                  className={`flex-row items-center ${idx !== filteredAndSortedEquipment.length - 1 ? "border-b border-[#DADFE5]" : ""}`}
                >
                  <Text
                    style={{ fontSize: rf(16), flex: 1.5 }}
                    className="font-inter text-textPrimary-light"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ fontSize: rf(16), flex: 1.5 }}
                    className="font-inter text-textSecondary-light"
                    numberOfLines={1}
                  >
                    {item.model_name || "N/A"}
                  </Text>
                  <Text
                    style={{ fontSize: rf(16), flex: 0.6 }}
                    className="font-inter text-center text-textPrimary-light"
                  >
                    {item.units}
                  </Text>

                  <View
                    style={{
                      flex: 0.8,
                      alignItems: "flex-end",
                      position: "relative",
                    }}
                  >
                    <TouchableOpacity
                      style={{ padding: rs(4) }}
                      onPress={() =>
                        setActiveDropdown(
                          activeDropdown === item.id ? null : item.id,
                        )
                      }
                    >
                      <Feather
                        name="more-horizontal"
                        size={rs(20)}
                        color="#112747"
                      />
                    </TouchableOpacity>

                    {activeDropdown === item.id && (
                      <>
                        {/* INVISIBLE DISMISS LAYER - THIS ALLOWS CLICK OUTSIDE TO WORK */}
                        <Pressable
                          style={
                            {
                              position: "fixed", // Use 'fixed' for web or 'absolute' for mobile
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 90,
                              backgroundColor: "transparent",
                            } as any
                          }
                          onPress={() => setActiveDropdown(null)}
                        />

                        {/* ACTUAL MENU */}
                        <View
                          className="absolute top-full right-0 bg-white border border-borderStrong-light rounded-md shadow-sm"
                          style={{
                            minWidth: rs(100),
                            zIndex: 100,
                            marginTop: rs(4),
                          }}
                        >
                          <TouchableOpacity
                            style={{ padding: rs(10) }}
                            className="border-b border-borderStrong-light"
                            onPress={() => openDetailsModal(item)}
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="font-inter text-textPrimary-light"
                            >
                              Details
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ padding: rs(10) }}
                            className="border-b border-borderStrong-light"
                            onPress={() => openEditModal(item)}
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="font-inter text-textPrimary-light"
                            >
                              Edit
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ padding: rs(10) }}
                            onPress={() => confirmDelete(item.id)}
                          >
                            <Text
                              style={{ fontSize: rf(14) }}
                              className="font-inter text-red-600"
                            >
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
