import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface StopSessionConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isStopping: boolean;
}

export default function StopSessionConfirmationModal({
  visible,
  onClose,
  onConfirm,
  isStopping,
}: StopSessionConfirmationModalProps) {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH (Matches your Dashboard/Logout logic) ---
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
      {/* Overlay */}
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        {/* Modal Card */}
        <View
          style={{
            width: isMobile ? "100%" : 400,
            padding: rf(24),
            borderRadius: rs(12),
          }}
          className="bg-white shadow-lg"
        >
          {/* Header */}
          <Text
            style={{ fontSize: rf(24), marginBottom: rs(16) }}
            className="font-inter-bold text-textPrimary-light"
          >
            Stop Session
          </Text>

          {/* Body Text */}
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textPrimary-light leading-6"
          >
            Are you sure you want to stop this session? This action will record
            your final duration and return the equipment to the inventory.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row justify-end gap-2">
            {/* Cancel Button */}
            <TouchableOpacity
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
              className="bg-gray-200 rounded-md"
              onPress={onClose}
              disabled={isStopping}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-gray-700"
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Confirm Stop Button */}
            <TouchableOpacity
              style={{
                paddingVertical: rs(10),
                paddingHorizontal: rs(16),
                minWidth: rs(120), // Ensure button doesn't jump when loading
              }}
              className={`bg-red-600 rounded-md items-center justify-center ${isStopping ? "opacity-50" : ""}`}
              onPress={onConfirm}
              disabled={isStopping}
            >
              {isStopping ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  Yes, Stop Session
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
