import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import StatusModal from "../dialogs/StatusModal";
import DatePickerModal from "./DatePickerModal"; // Adjust path as needed

interface BookEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName: string; // Passed from the dashboard (fullNameStr)
}

export default function BookEquipmentModal({
  visible,
  onClose,
  onSuccess,
  userName,
}: BookEquipmentModalProps) {
  const { width } = useWindowDimensions();

  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // --- Form States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  // --- Feedback States ---
  const [statusConfig, setStatusConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // --- Responsive Math ---
  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- Fetch Inventory for Dropdown ---
  const fetchInventory = async () => {
    setIsInventoryLoading(true);
    const { data, error } = await supabase
      .from("equipment_inventory")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) setInventory(data);
    setIsInventoryLoading(false);
  };

  useEffect(() => {
    if (visible) {
      fetchInventory();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSearchQuery("");
    setSelectedEquipment(null);
    setSelectedDate(null);
    setTimeIn("");
    setTimeOut("");
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSaveReservation = async () => {
    // 1. Validation
    if (!selectedEquipment || !selectedDate || !timeIn || !timeOut) {
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Please fill in all fields before booking.",
      });
      return;
    }

    // Double-check stock before proceeding
    if (selectedEquipment.units <= 0) {
      setStatusConfig({
        visible: true,
        title: "Out of Stock",
        message: "This equipment is currently unavailable for reservation.",
      });
      return;
    }

    setIsLoading(true);

    // 2. Insert the Reservation Log
    const { error: insertError } = await supabase
      .from("equipment_reservations")
      .insert([
        {
          full_name: userName,
          equipment_name: selectedEquipment.name,
          model_name: selectedEquipment.model_name,
          reservation_date: selectedDate.toISOString().split("T")[0],
          time_in: timeIn.toUpperCase(),
          time_out: timeOut.toUpperCase(),
          status: "Pending",
        },
      ]);

    if (insertError) {
      setIsLoading(false);
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Failed to save reservation. Please try again.",
      });
      return;
    }

    // 3. Deduct the Stock by 1
    const newStock = selectedEquipment.units - 1;
    const { error: updateError } = await supabase
      .from("equipment_inventory")
      .update({ units: newStock })
      .eq("id", selectedEquipment.id);

    setIsLoading(false);

    if (updateError) {
      console.error("Stock update error:", updateError);
      // Even if stock update fails, the reservation was saved.
      // You might want to inform the admin or just proceed.
    }

    // 4. Trigger Success
    setStatusConfig({
      visible: true,
      title: "Success",
      message: "Reservation saved and equipment stock updated.",
    });
  };

  const handleStatusClose = () => {
    setStatusConfig({ ...statusConfig, visible: false });

    if (statusConfig.title === "Success") {
      onSuccess(); // Triggers the fetchReservations in UserDashboard
      onClose(); // Closes the BookEquipmentModal
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 450, maxHeight: "90%" }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <View
            style={{ paddingHorizontal: rs(24), paddingTop: rs(24) }}
            className="flex-row justify-between items-center"
          >
            <Text
              style={{ fontSize: rf(22) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Book Equipment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={rs(24)} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: rs(24) }}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Searchable Dropdown */}
            <Text
              style={{ fontSize: rf(14) }}
              className="font-inter-bold text-textPrimary-light mb-2"
            >
              Select Equipment
            </Text>
            <View style={{ zIndex: 100 }}>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
                <Feather name="search" size={rs(18)} color="#94a3b8" />
                <TextInput
                  style={{ flex: 1, padding: rs(12), fontSize: rf(16) }}
                  placeholder="Search item..."
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {isInventoryLoading && (
                  <ActivityIndicator size="small" color="#1d4ed8" />
                )}
              </View>

              {isDropdownOpen && searchQuery.length > 0 && (
                <View
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1"
                  style={{ maxHeight: rs(200), zIndex: 1000 }}
                >
                  <ScrollView nestedScrollEnabled>
                    {filteredInventory.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        className="p-3 border-b border-gray-50 flex-row justify-between"
                        onPress={() => {
                          setSelectedEquipment(item);
                          setSearchQuery(item.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={{ fontSize: rf(14) }}
                          className="font-inter text-textPrimary-light"
                        >
                          {item.name}{" "}
                          {item.model_name ? `(${item.model_name})` : ""}
                        </Text>
                        <Text
                          style={{ fontSize: rf(12) }}
                          className="font-inter-bold text-blue-600"
                        >
                          Stock: {item.units}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 2. Selected Date */}
            <Text
              style={{ fontSize: rf(14) }}
              className="font-inter-bold text-textPrimary-light mt-4 mb-2"
            >
              Reservation Date
            </Text>
            <TouchableOpacity
              onPress={() => setIsDatePickerVisible(true)}
              className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50"
            >
              <Feather name="calendar" size={rs(18)} color="#1d4ed8" />
              <Text
                style={{ fontSize: rf(16), marginLeft: rs(10) }}
                className="font-inter text-textPrimary-light"
              >
                {selectedDate ? selectedDate.toDateString() : "Select a date"}
              </Text>
            </TouchableOpacity>

            {/* 3. Time Inputs */}
            <View className="flex-row mt-4" style={{ gap: rs(16) }}>
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter-bold text-textPrimary-light mb-2"
                >
                  Time In
                </Text>
                <TextInput
                  style={{ padding: rs(12), fontSize: rf(16) }}
                  className="border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="e.g., 08:00 AM"
                  value={timeIn}
                  onChangeText={setTimeIn}
                />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter-bold text-textPrimary-light mb-2"
                >
                  Time Out
                </Text>
                <TextInput
                  style={{ padding: rs(12), fontSize: rf(16) }}
                  className="border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="e.g., 10:00 AM"
                  value={timeOut}
                  onChangeText={setTimeOut}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSaveReservation}
              disabled={isLoading}
              style={{
                paddingVertical: rs(16),
                marginTop: rs(32),
                marginBottom: rs(24),
              }}
              className={`rounded-xl items-center justify-center ${isLoading ? "bg-blue-300" : "bg-mainColor-light"}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ fontSize: rf(18) }}
                  className="text-white font-inter-bold"
                >
                  Confirm Reservation
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Support Modals */}
        <DatePickerModal
          visible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
          onSelect={(date) => setSelectedDate(date)}
          initialDate={selectedDate}
        />

        <StatusModal
          visible={statusConfig.visible}
          title={statusConfig.title}
          message={statusConfig.message}
          onClose={handleStatusClose}
        />
      </View>
    </Modal>
  );
}
