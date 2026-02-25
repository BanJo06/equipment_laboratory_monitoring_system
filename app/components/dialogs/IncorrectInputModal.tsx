import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface IncorrectInputModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function IncorrectInputModal({
  visible,
  onClose,
}: IncorrectInputModalProps) {
  const { width } = useWindowDimensions();
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
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rf(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          <Text
            style={{ fontSize: rf(24), marginBottom: rs(16) }}
            className="font-inter-bold text-red-600"
          >
            Login Failed
          </Text>
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textPrimary-light"
          >
            Username and password is incorrect, please try again.
          </Text>

          <View className="flex-row justify-end">
            <TouchableOpacity
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
              className="bg-mainColor-light rounded-md"
              onPress={onClose}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white"
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
