import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface EquipmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  equipment: any | null;
}

export default function EquipmentDetailsModal({
  visible,
  onClose,
  equipment,
}: EquipmentDetailsModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  if (!equipment) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4 py-8">
        <View
          style={{
            width: isMobile ? "100%" : 400,
            padding: rf(24),
          }}
          className="bg-white rounded-xl shadow-lg"
        >
          <View
            className="flex-row justify-between items-center"
            style={{ marginBottom: rs(20) }}
          >
            <Text
              style={{ fontSize: rf(20) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Equipment Details
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: rs(4) }}>
              <Feather name="x" size={rs(24)} color="#112747" />
            </TouchableOpacity>
          </View>

          <View style={{ gap: rs(16) }}>
            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(4) }}
                className="font-inter text-textSecondary-light"
              >
                Equipment Name
              </Text>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                {equipment.name}
              </Text>
            </View>

            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(4) }}
                className="font-inter text-textSecondary-light"
              >
                Stock (Units)
              </Text>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                {equipment.units}
              </Text>
            </View>

            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(4) }}
                className="font-inter text-textSecondary-light"
              >
                Model Name
              </Text>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                {equipment.model_name || "N/A"}
              </Text>
            </View>

            <View>
              <Text
                style={{ fontSize: rf(14), marginBottom: rs(4) }}
                className="font-inter text-textSecondary-light"
              >
                Location
              </Text>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                {equipment.location || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-end mt-6">
            <TouchableOpacity
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
              className="bg-mainColor-light rounded-md"
              onPress={onClose}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white"
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
