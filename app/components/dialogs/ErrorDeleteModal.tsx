import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface ErrorDeleteModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ErrorDeleteModal({
  visible,
  onClose,
}: ErrorDeleteModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rs(24) }}
          className="bg-white rounded-xl shadow-lg items-center"
        >
          <View className="bg-red-100 p-4 rounded-full mb-4">
            <Feather name="x-circle" size={rs(32)} color="#dc2626" />
          </View>
          <Text
            style={{ fontSize: rf(20), marginBottom: rs(8) }}
            className="font-inter-bold text-textPrimary-light text-center"
          >
            Action Denied
          </Text>
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textSecondary-light text-center"
          >
            Error, can't delete items that are still active.
          </Text>

          <TouchableOpacity
            style={{ width: "100%", paddingVertical: rs(12) }}
            className="bg-gray-200 rounded-md items-center"
            onPress={onClose}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
