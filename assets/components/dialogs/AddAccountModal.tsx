import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newAccount?: any) => void;
}

export default function AddAccountModal({
  visible,
  onClose,
  onSuccess,
}: AddAccountModalProps) {
  const { width } = useWindowDimensions();

  // --- MODAL & FORM STATE ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("User");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- SAVE LOGIC (ONLINE / OFFLINE) ---
  const handleSaveAccount = async () => {
    if (!firstName || !lastName || !newUsername || !newPassword || !role) {
      Alert.alert("Error", "Every field is required.");
      return;
    }

    setIsLoading(true);
    const accountData = {
      first_name: firstName,
      last_name: lastName,
      username: newUsername,
      password: newPassword, // Passwords require secure hashing in production environments
      role: role,
    };

    try {
      const { error } = await supabase.from("accounts").insert([accountData]);

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert("Success", "Account successfully added online.");
      onSuccess(); // Refresh the table
    } catch (error) {
      try {
        const existingOfflineData =
          await AsyncStorage.getItem("offline_accounts");
        const offlineAccounts = existingOfflineData
          ? JSON.parse(existingOfflineData)
          : [];
        offlineAccounts.push(accountData);
        await AsyncStorage.setItem(
          "offline_accounts",
          JSON.stringify(offlineAccounts),
        );

        Alert.alert(
          "Saved Offline",
          "No connection detected. Data saved locally.",
        );
        onSuccess(accountData); // Optimistically update the UI for offline mode
      } catch (storageError) {
        Alert.alert("Error", "Failed to save account locally.");
      }
    } finally {
      setIsLoading(false);
      onClose(); // Close modal instead of setModalVisible
      setFirstName("");
      setLastName("");
      setNewUsername("");
      setNewPassword("");
      setRole("User");
      setIsDropdownOpen(false);
    }
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
              style={{ fontSize: rf(24), marginBottom: rs(16) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Add New Account
            </Text>

            {/* First Name Input */}
            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              First Name
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: rs(16),
              }}
              className="border border-borderStrong-light rounded-md text-textPrimary-light font-inter"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Last Name Input */}
            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Last Name
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: rs(16),
              }}
              className="border border-borderStrong-light rounded-md text-textPrimary-light font-inter"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Username Input */}
            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Username
            </Text>
            <TextInput
              style={{
                padding: rs(12),
                fontSize: rf(16),
                marginBottom: rs(16),
              }}
              className="border border-borderStrong-light rounded-md text-textPrimary-light font-inter"
              placeholder="Enter username"
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
            />

            {/* Password Input */}
            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Password
            </Text>
            <View
              style={{ marginBottom: rs(16) }}
              className="flex-row items-center border border-borderStrong-light rounded-md pr-3"
            >
              <TextInput
                style={{ padding: rs(12), fontSize: rf(16), flex: 1 }}
                className="text-textPrimary-light font-inter"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={rs(20)}
                  color="#112747"
                />
              </TouchableOpacity>
            </View>

            {/* Role Dropdown */}
            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Role
            </Text>

            {/* Applied zIndex and elevation to force the container to the front layer */}
            <View style={{ zIndex: 50, elevation: 50, marginBottom: rs(24) }}>
              <TouchableOpacity
                style={{ padding: rs(12) }}
                className="border border-borderStrong-light rounded-md flex-row justify-between items-center bg-white"
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter text-textPrimary-light"
                >
                  {role}
                </Text>
                <Feather
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={rs(20)}
                  color="#6684B0"
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <View
                  className="absolute top-full left-0 right-0 bg-white border border-borderStrong-light rounded-md mt-1 shadow-sm"
                  style={{ zIndex: 100, elevation: 5 }}
                >
                  <TouchableOpacity
                    style={{ padding: rs(12) }}
                    className="border-b border-borderStrong-light"
                    onPress={() => {
                      setRole("User");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={{ fontSize: rf(16) }} className="font-inter">
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: rs(12) }}
                    onPress={() => {
                      setRole("Admin");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={{ fontSize: rf(16) }} className="font-inter">
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Actions */}
            {/* Removed the dynamic marginTop and explicitly set a lower zIndex */}
            <View
              className="flex-row justify-end space-x-3 gap-3"
              style={{ zIndex: 1 }}
            >
              <TouchableOpacity
                style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
                className="bg-gray-200 rounded-md"
                onPress={onClose}
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
                className={`bg-mainColor-light rounded-md ${isLoading ? "opacity-50" : ""}`}
                onPress={handleSaveAccount}
                disabled={isLoading}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  {isLoading ? "Saving..." : "Save Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
