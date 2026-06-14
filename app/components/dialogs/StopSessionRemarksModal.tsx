import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface StopSessionRemarksModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  session: any;
  isStopping: boolean;
}

export default function StopSessionRemarksModal({
  visible,
  onClose,
  onConfirm,
  session,
  isStopping,
}: StopSessionRemarksModalProps) {
  const { width } = useWindowDimensions();
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  useEffect(() => {
    if (visible) {
      setRemarks("");
      setError(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!remarks.trim()) {
      setError(true);
      return;
    }
    onConfirm(remarks.trim());
  };

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
            maxHeight: "100%",
            overflow: "visible",
          }}
          className="bg-white rounded-xl shadow-lg"
        >
          <View style={{ padding: rf(24), overflow: "visible" }}>
            <Text
              style={{ fontSize: rf(24), marginBottom: rs(8) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Stop Session
            </Text>

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(16) }}
              className="font-inter text-textSecondary-light"
            >
              Equipment: {session?.equipment_name}
            </Text>

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Remarks (Required)
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: error ? rs(4) : rs(16),
                minHeight: rs(80),
                textAlignVertical: "top",
              }}
              multiline={true}
              className={`border rounded-md text-textPrimary-light font-inter ${
                error ? "border-red-500" : "border-borderStrong-light"
              }`}
              placeholder="Enter remarks about the equipment usage..."
              value={remarks}
              onChangeText={(text) => {
                setRemarks(text);
                if (error) setError(false);
              }}
            />
            {error && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                Input required
              </Text>
            )}

            <View
              className="flex-row justify-end space-x-2"
              style={{ zIndex: 1 }}
            >
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
                style={{
                  paddingVertical: rs(10),
                  paddingHorizontal: rs(16),
                  marginLeft: rs(8),
                }}
                className={`bg-mainColor-light rounded-md ${
                  isStopping ? "opacity-50" : ""
                }`}
                onPress={handleConfirm}
                disabled={isStopping}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  {isStopping ? "Stopping..." : "Confirm & Stop"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
