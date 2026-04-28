import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemName?: string; // Optional: to show what is being deleted
}

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  itemName,
}: DeleteConfirmationModalProps) {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH (Standardized with your Dashboard) ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View
          style={{ width: isMobile ? "100%" : 400 }}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          {/* Header & Icon */}
          <View className="items-center mb-6">
            <View className="bg-red-100 p-4 rounded-full mb-4">
              <Feather name="alert-triangle" size={rs(32)} color="#dc2626" />
            </View>

            <Text
              style={{ fontSize: rf(22) }}
              className="font-inter-bold text-textPrimary-light text-center"
            >
              Cancel Reservation?
            </Text>

            <Text
              style={{ fontSize: rf(14), marginTop: rs(8) }}
              className="font-inter text-textSecondary-light text-center"
            >
              Are you sure you want to remove the reservation for{" "}
              <Text className="font-inter-bold text-textPrimary-light">
                {itemName || "this equipment"}
              </Text>
              ? This action cannot be undone.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-center" style={{ gap: rs(16) }}>
            {/* Cancel / Go Back Button */}
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              style={{ paddingVertical: rs(12), paddingHorizontal: rs(24) }}
              className="bg-gray-100 rounded-lg flex-1 items-center"
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-gray-600"
              >
                Go Back
              </Text>
            </TouchableOpacity>

            {/* Confirm Delete Button */}
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              style={{ paddingVertical: rs(12), paddingHorizontal: rs(24) }}
              className="bg-red-600 rounded-lg flex-1 items-center"
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
