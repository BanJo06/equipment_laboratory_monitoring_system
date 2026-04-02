import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
// Import your existing DatePickerModal
import DatePickerModal from "./DatePickerModal";

interface ExportRangeModalProps {
  visible: boolean;
  type: "excel" | "pdf";
  onClose: () => void;
  onConfirm: (dateFrom: Date, dateTo: Date) => Promise<void> | void;
}

export default function ExportRangeModal({
  visible,
  type,
  onClose,
  onConfirm,
}: ExportRangeModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- STATE ---
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  // Picker Logic State
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"from" | "to">("from");

  const openPicker = (mode: "from" | "to") => {
    setPickerMode(mode);
    setIsPickerVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    if (pickerMode === "from") {
      setDateFrom(date);
    } else {
      setDateTo(date);
    }
    setIsPickerVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 450, padding: rf(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text
              style={{ fontSize: rf(22) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Export to {type.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={rs(24)} color="#112747" />
            </TouchableOpacity>
          </View>

          {/* Date Selection Buttons */}
          <View style={{ gap: rs(12), marginBottom: rs(24) }}>
            {/* From Button */}
            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(6) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Date From:
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300 rounded-md px-4 py-3 bg-[#F8FAFC]"
                onPress={() => openPicker("from")}
              >
                <Feather
                  name="calendar"
                  size={rs(18)}
                  color="gray"
                  style={{ marginRight: rs(10) }}
                />
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textPrimary-light"
                >
                  {dateFrom.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Button */}
            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(6) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Date To:
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300 rounded-md px-4 py-3 bg-[#F8FAFC]"
                onPress={() => openPicker("to")}
              >
                <Feather
                  name="calendar"
                  size={rs(18)}
                  color="gray"
                  style={{ marginRight: rs(10) }}
                />
                <Text
                  style={{ fontSize: rf(14) }}
                  className="font-inter text-textPrimary-light"
                >
                  {dateTo.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View
            className="flex-row justify-end items-center"
            style={{ gap: rs(12) }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-gray-500"
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(dateFrom, dateTo)}
              style={{
                paddingVertical: rs(10),
                paddingHorizontal: rs(24),
                backgroundColor: type === "excel" ? "#16a34a" : "#ea580c",
              }}
              className="rounded-md"
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white"
              >
                Generate Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- NESTED DATE PICKER MODAL --- */}
      <DatePickerModal
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        initialDate={pickerMode === "from" ? dateFrom : dateTo}
        onSelect={handleDateSelect}
      />
    </Modal>
  );
}
