import React from "react";
import {
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
  title: string;
  message: string;
}

export default function StopSessionConfirmationModal({
  visible,
  onClose,
  onConfirm,
  isStopping,
  title,
  message,
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
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rf(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          <Text
            style={{ fontSize: rf(24), marginBottom: rs(16) }}
            className="font-inter-bold text-textPrimary-light"
          >
            {title} {/* Dynamic Title */}
          </Text>
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textPrimary-light leading-6"
          >
            {message} {/* Dynamic Message */}
          </Text>

          <View className="flex-row justify-end gap-2">
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

            <TouchableOpacity
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
              className="bg-red-600 rounded-md"
              onPress={onConfirm}
              disabled={isStopping}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white"
              >
                {isStopping ? "Processing..." : "Yes, Proceed"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
