import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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

  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  // Note: In your main file, you can pass the logic to open your DatePickerModal
  // and update these local states.

  const handleExport = () => {
    onConfirm(dateFrom, dateTo);
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
          style={{
            width: isMobile ? "100%" : 450,
            padding: rf(24),
          }}
          className="bg-white rounded-xl shadow-lg"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Feather
                name={type === "excel" ? "file-text" : "file"}
                size={rs(24)}
                color={type === "excel" ? "#16a34a" : "#ea580c"}
                style={{ marginRight: rs(10) }}
              />
              <Text
                style={{ fontSize: rf(22) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Export to {type === "excel" ? "Excel" : "PDF"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={rs(24)} color="#112747" />
            </TouchableOpacity>
          </View>

          <Text
            style={{ fontSize: rf(14), marginBottom: rs(16) }}
            className="font-inter text-textSecondary-light"
          >
            Select the date range for the equipment logs you wish to export.
          </Text>

          {/* Date Range Selection Area */}
          <View style={{ gap: rs(12), marginBottom: rs(24) }}>
            {/* Date From */}
            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(6) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Date From:
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300 rounded-md px-4 py-3 bg-[#F8FAFC]"
                onPress={() => {
                  /* Logic to open your DatePicker for 'From' */
                }}
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

            {/* Date To */}
            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(6) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Date To:
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300 rounded-md px-4 py-3 bg-[#F8FAFC]"
                onPress={() => {
                  /* Logic to open your DatePicker for 'To' */
                }}
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
            <TouchableOpacity
              onPress={onClose}
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(20) }}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-gray-500"
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExport}
              style={{
                paddingVertical: rs(10),
                paddingHorizontal: rs(24),
                backgroundColor: type === "excel" ? "#16a34a" : "#ea580c",
              }}
              className="rounded-md shadow-sm"
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
    </Modal>
  );
}
