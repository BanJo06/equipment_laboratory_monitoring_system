import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
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
  if (!sessionData) return null;

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
        <View className="bg-white rounded-xl shadow-lg items-center p-8 w-[350px] max-w-[90%]">
          <View className="absolute right-4 top-4">
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <Text className="font-inter-bold text-textPrimary-light text-[22px] mb-2 text-center mt-2">
            Logout QR Code
          </Text>
          <Text className="font-inter text-textSecondary-light text-[14px] text-center mb-6">
            Take a picture of the code. Scan the code on the main terminal later
            to quickly log out.
          </Text>

          <View className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            <QRCode
              value={sessionData.id}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>

          <Text className="font-inter-bold text-textPrimary-light text-[16px] text-center bg-blue-50 px-4 py-3 rounded-md w-full mb-4">
            {sessionData.equipment_name} {modelDisplay}
          </Text>

          <Text className="font-inter text-textSecondary-light text-[14px] text-center px-2">
            Please put back the equipment in the{" "}
            <Text className="font-inter-bold text-textPrimary-light">
              {locationDisplay}
            </Text>
            . Thank you!
          </Text>
        </View>
      </View>
    </Modal>
  );
}
