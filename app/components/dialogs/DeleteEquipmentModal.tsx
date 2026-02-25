import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface DeleteEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentId: string | null;
}

export default function DeleteEquipmentModal({
  visible,
  onClose,
  onSuccess,
  equipmentId,
}: DeleteEquipmentModalProps) {
  const { width } = useWindowDimensions();
  const [isDeleting, setIsDeleting] = useState(false);

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  const handleDelete = async () => {
    if (!equipmentId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("equipment_inventory")
        .delete()
        .eq("id", equipmentId);

      if (error) throw new Error(error.message);

      onSuccess();
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rf(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          <Text
            style={{ fontSize: rf(20), marginBottom: rs(12) }}
            className="font-inter-bold text-textPrimary-light"
          >
            Delete Equipment
          </Text>
          <Text
            style={{ fontSize: rf(16), marginBottom: rs(24) }}
            className="font-inter text-textSecondary-light"
          >
            Confirm the deletion of this item. This action cannot be undone.
          </Text>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
              className="bg-gray-200 rounded-md"
              onPress={onClose}
              disabled={isDeleting}
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
              className={`bg-red-600 rounded-md ${isDeleting ? "opacity-50" : ""}`}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
