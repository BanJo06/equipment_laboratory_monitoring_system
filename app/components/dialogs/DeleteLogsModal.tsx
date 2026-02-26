import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface DeleteLogsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemCount: number;
}

export default function DeleteLogsModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  itemCount,
}: DeleteLogsModalProps) {
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
            <Feather name="alert-triangle" size={rs(32)} color="#dc2626" />
          </View>
          <Text
            style={{ fontSize: rf(20), marginBottom: rs(8) }}
            className="font-inter-bold text-textPrimary-light text-center"
          >
            Delete Logs?
          </Text>
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textSecondary-light text-center"
          >
            Delete {itemCount} selected {itemCount === 1 ? "log" : "logs"}? This
            action cannot be undone.
          </Text>

          <View className="flex-row w-full gap-4">
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: rs(12) }}
              className="bg-gray-200 rounded-md items-center"
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: rs(12) }}
              className="bg-red-600 rounded-md items-center"
              onPress={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
