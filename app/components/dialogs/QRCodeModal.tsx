import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  sessionData: {
    id: string;
    equipment_name: string;
    model_name?: string | null;
    location?: string | null;
  } | null;
}

export default function QRCodeModal({
  visible,
  onClose,
  sessionData,
}: QRCodeModalProps) {
  const { width } = useWindowDimensions();

  if (!sessionData) return null;

  // --- RESPONSIVE BREAKPOINT ---
  const isMobile = width < 1024;

  // --- DYNAMIC SIZES ---
  const modalWidth = isMobile ? "90%" : 400; // Web gets a fixed card size
  const qrSize = isMobile ? 150 : 240; // QR is larger on Web
  const titleSize = isMobile ? 18 : 24; // Font scales up for Desktop
  const descSize = isMobile ? 12 : 14;
  const padding = isMobile ? 24 : 40; // More "breathing room" on Web

  const modelDisplay = sessionData.model_name
    ? `- ${sessionData.model_name}`
    : "";
  const locationDisplay = sessionData.location || "designated area";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View
          style={{
            width: modalWidth,
            maxWidth: 500, // Safety cap for ultra-wide screens
            padding: padding,
          }}
          className="bg-white rounded-2xl shadow-lg items-center relative"
        >
          {/* Close Button */}
          <View className="absolute right-4 top-4">
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Feather name="x" size={isMobile ? 20 : 24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <Text
            style={{ fontSize: titleSize }}
            className="font-inter-bold text-textPrimary-light mb-2 text-center mt-2"
          >
            Logout QR Code
          </Text>

          <Text
            style={{ fontSize: descSize }}
            className="font-inter text-textSecondary-light text-center mb-6 leading-5"
          >
            Take a picture or scan this code at the main terminal to log out of
            your session.
          </Text>

          {/* QR Code Container */}
          <View
            className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6"
            style={{ padding: isMobile ? 12 : 20 }}
          >
            <QRCode
              value={sessionData.id}
              size={qrSize}
              color="black"
              backgroundColor="white"
            />
          </View>

          {/* Equipment Info Badge */}
          <View className="bg-blue-50 px-4 py-3 rounded-xl w-full mb-4">
            <Text
              style={{ fontSize: isMobile ? 14 : 16 }}
              className="font-inter-bold text-textPrimary-light text-center"
            >
              {sessionData.equipment_name} {modelDisplay}
            </Text>
          </View>

          {/* Footer Footer */}
          <Text
            style={{ fontSize: isMobile ? 11 : 13 }}
            className="font-inter text-textSecondary-light text-center"
          >
            Please return equipment to the{" "}
            <Text className="font-inter-bold text-textPrimary-light">
              {locationDisplay}
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}
