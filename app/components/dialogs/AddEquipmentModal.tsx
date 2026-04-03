import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import StatusModal from "../dialogs/StatusModal";

interface AddEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentToEdit?: any;
}

export default function AddEquipmentModal({
  visible,
  onClose,
  onSuccess,
  equipmentToEdit,
}: AddEquipmentModalProps) {
  const { width } = useWindowDimensions();

  const [equipmentName, setEquipmentName] = useState("");
  const [units, setUnits] = useState("");
  const [modelName, setModelName] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    equipmentName: false,
    units: false,
    modelName: false,
    location: false,
  });

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusTitle, setStatusTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  useEffect(() => {
    if (visible && equipmentToEdit) {
      setEquipmentName(equipmentToEdit.name || "");
      setUnits(equipmentToEdit.units?.toString() || "");
      setModelName(equipmentToEdit.model_name || "");
      setLocation(equipmentToEdit.location || "");
      setErrors({
        equipmentName: false,
        units: false,
        modelName: false,
        location: false,
      });
    } else if (visible && !equipmentToEdit) {
      setEquipmentName("");
      setUnits("");
      setModelName("");
      setLocation("");
      setErrors({
        equipmentName: false,
        units: false,
        modelName: false,
        location: false,
      });
    }
  }, [visible, equipmentToEdit]);

  const triggerStatus = (title: string, message: string) => {
    setStatusTitle(title);
    setStatusMessage(message);
    setStatusVisible(true);
  };

  const handleStatusClose = () => {
    setStatusVisible(false);
    if (statusTitle === "Success" || statusTitle === "Saved Offline") {
      onClose();
      onSuccess();
    }
  };

  const handleSaveEquipment = async () => {
    const newErrors = {
      equipmentName: !equipmentName.trim(),
      units: !units.trim(),
      modelName: !modelName.trim(),
      location: !location.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((isError) => isError)) {
      return;
    }

    setIsLoading(true);

    const equipmentData = {
      name: equipmentName.trim(),
      units: parseInt(units, 10) || 0,
      model_name: modelName.trim(),
      location: location.trim(),
    };

    try {
      // 1. DUPLICATE CHECK LOGIC
      let query = supabase
        .from("equipment_inventory")
        .select("id")
        .eq("name", equipmentData.name)
        .eq("model_name", equipmentData.model_name)
        .eq("location", equipmentData.location);

      // If we are editing, exclude the current item's ID from the search
      if (equipmentToEdit) {
        query = query.neq("id", equipmentToEdit.id);
      }

      const { data: existingItems, error: fetchError } = await query;

      if (fetchError) throw new Error(fetchError.message);

      if (existingItems && existingItems.length > 0) {
        triggerStatus(
          "Error",
          "This equipment model already exists in this specific location.",
        );
        setIsLoading(false);
        return;
      }

      // 3. PROCEED WITH SAVE/UPDATE IF NO DUPLICATE
      if (equipmentToEdit) {
        const { error } = await supabase
          .from("equipment_inventory")
          .update(equipmentData)
          .eq("id", equipmentToEdit.id);

        if (error) throw new Error(error.message);
        triggerStatus("Success", "Equipment successfully updated.");
      } else {
        const { error } = await supabase
          .from("equipment_inventory")
          .insert([equipmentData]);

        if (error) throw new Error(error.message);
        triggerStatus("Success", "Equipment successfully added.");
      }
    } catch (error: any) {
      // Offline fallback logic remains the same
      try {
        const existingOfflineData =
          await AsyncStorage.getItem("offline_equipment");
        const offlineEquipment = existingOfflineData
          ? JSON.parse(existingOfflineData)
          : [];

        offlineEquipment.push({ ...equipmentData, id: Date.now().toString() });
        await AsyncStorage.setItem(
          "offline_equipment",
          JSON.stringify(offlineEquipment),
        );

        triggerStatus(
          "Saved Offline",
          "No connection detected. Data saved locally.",
        );
      } catch (storageError) {
        triggerStatus("Error", "Failed to save equipment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!equipmentToEdit;

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
              style={{ fontSize: rf(24), marginBottom: rs(16) }}
              className="font-inter-bold text-textPrimary-light"
            >
              {isEditing ? "Edit Equipment" : "Add New Equipment"}
            </Text>

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Equipment Name
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: errors.equipmentName ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.equipmentName ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter equipment name"
              value={equipmentName}
              onChangeText={(text) => {
                setEquipmentName(text);
                if (errors.equipmentName)
                  setErrors({ ...errors, equipmentName: false });
              }}
            />
            {errors.equipmentName && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                Input required
              </Text>
            )}

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Units (Stock)
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: errors.units ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.units ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter number of units"
              keyboardType="numeric"
              value={units}
              onChangeText={(text) => {
                setUnits(text);
                if (errors.units) setErrors({ ...errors, units: false });
              }}
            />
            {errors.units && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                Input required
              </Text>
            )}

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Model Name
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: errors.modelName ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.modelName ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter model name"
              value={modelName}
              onChangeText={(text) => {
                setModelName(text);
                if (errors.modelName)
                  setErrors({ ...errors, modelName: false });
              }}
            />
            {errors.modelName && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                Input required
              </Text>
            )}

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Location
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: errors.location ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.location ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter location"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (errors.location) setErrors({ ...errors, location: false });
              }}
            />
            {errors.location && (
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
                onPress={() => {
                  setErrors({
                    equipmentName: false,
                    units: false,
                    modelName: false,
                    location: false,
                  });
                  onClose();
                }}
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
                className={`bg-mainColor-light rounded-md ${isLoading ? "opacity-50" : ""}`}
                onPress={handleSaveEquipment}
                disabled={isLoading}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  {isLoading
                    ? "Saving..."
                    : isEditing
                      ? "Update Item"
                      : "Save Item"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusModal
          visible={statusVisible}
          title={statusTitle}
          message={statusMessage}
          onClose={handleStatusClose}
        />
      </View>
    </Modal>
  );
}
