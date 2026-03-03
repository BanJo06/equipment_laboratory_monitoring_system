import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function StatusModal({
  visible,
  onClose,
  title,
  message,
}: StatusModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- DYNAMIC UI LOGIC ---
  // Detects if the modal should show an error state based on the title string
  const isError =
    title.toLowerCase().includes("error") ||
    title.toLowerCase().includes("fail");

  const iconName = isError ? "x-circle" : "check-circle";
  const iconColor = isError ? "#dc2626" : "#16a34a"; // Red for error, Green for success
  const bgIconColor = isError ? "bg-red-100" : "bg-green-100";
  const titleColor = isError ? "text-red-600" : "text-textPrimary-light";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rf(32) }}
          className="bg-white rounded-xl shadow-lg items-center"
        >
          {/* Dynamic Icon */}
          <View className={`${bgIconColor} p-4 rounded-full mb-4`}>
            <Feather name={iconName} size={rs(32)} color={iconColor} />
          </View>

          <Text
            style={{ fontSize: rf(24), marginBottom: rs(16) }}
            className={`font-inter-bold text-center ${titleColor}`}
          >
            {title}
          </Text>

          <Text
            style={{ fontSize: rf(16), marginBottom: rs(32) }}
            className="font-inter text-textSecondary-light text-center leading-relaxed"
          >
            {message}
          </Text>

          <TouchableOpacity
            style={{ width: "100%", paddingVertical: rs(14) }}
            className="bg-mainColor-light rounded-md items-center"
            onPress={onClose}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-white"
            >
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
