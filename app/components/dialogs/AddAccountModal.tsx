import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
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

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updatedAccount?: any) => void;
  accountToEdit?: any;
}

export default function AddAccountModal({
  visible,
  onClose,
  onSuccess,
  accountToEdit,
}: AddAccountModalProps) {
  const { width } = useWindowDimensions();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("User");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    username: false,
    password: false,
  });

  // New state variables for the StatusModal
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
    if (visible && accountToEdit) {
      setFirstName(accountToEdit.first_name || "");
      setLastName(accountToEdit.last_name || "");
      setNewUsername(accountToEdit.username || "");
      setNewPassword(accountToEdit.password || "");
      setRole(accountToEdit.role || "User");
      setErrors({
        firstName: false,
        lastName: false,
        username: false,
        password: false,
      });
    } else if (visible && !accountToEdit) {
      setFirstName("");
      setLastName("");
      setNewUsername("");
      setNewPassword("");
      setRole("User");
      setErrors({
        firstName: false,
        lastName: false,
        username: false,
        password: false,
      });
    }
  }, [visible, accountToEdit]);

  const triggerStatus = (title: string, message: string) => {
    setStatusTitle(title);
    setStatusMessage(message);
    setStatusVisible(true);
  };

  const handleStatusClose = () => {
    setStatusVisible(false);
    // If successful, close the main modal and refresh the list
    if (statusTitle === "Success" || statusTitle === "Saved Offline") {
      onClose();
      onSuccess();
    }
  };

  const handleSaveAccount = async () => {
    const newErrors = {
      firstName: !firstName.trim(),
      lastName: !lastName.trim(),
      username: !newUsername.trim(),
      password: !newPassword.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((isError) => isError)) {
      return;
    }

    setIsLoading(true);
    const accountData = {
      first_name: firstName,
      last_name: lastName,
      username: newUsername,
      password: newPassword,
      role: role,
    };

    try {
      if (accountToEdit) {
        const { error } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", accountToEdit.id);

        if (error) throw new Error(error.message);
        triggerStatus("Success", "Account successfully updated.");
      } else {
        const { error } = await supabase.from("accounts").insert([accountData]);

        if (error) throw new Error(error.message);
        triggerStatus("Success", "Account successfully added.");
      }
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

        triggerStatus(
          "Saved Offline",
          "No connection detected. Data saved locally.",
        );
      } catch (storageError) {
        triggerStatus("Error", "Failed to save account.");
      }
    } finally {
      setIsLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const isEditing = !!accountToEdit;

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
              {isEditing ? "Edit an account" : "Add New Account"}
            </Text>

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
                marginBottom: errors.firstName ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.firstName ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter first name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName)
                  setErrors({ ...errors, firstName: false });
              }}
            />
            {errors.firstName && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                * Input required
              </Text>
            )}

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
                marginBottom: errors.lastName ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.lastName ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors({ ...errors, lastName: false });
              }}
            />
            {errors.lastName && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                * Input required
              </Text>
            )}

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
                marginBottom: errors.username ? rs(4) : rs(16),
              }}
              className={`border rounded-md text-textPrimary-light font-inter ${errors.username ? "border-red-500" : "border-borderStrong-light"}`}
              placeholder="Enter username"
              value={newUsername}
              onChangeText={(text) => {
                setNewUsername(text);
                if (errors.username) setErrors({ ...errors, username: false });
              }}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                * Input required
              </Text>
            )}

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Password
            </Text>
            <View
              style={{ marginBottom: errors.password ? rs(4) : rs(16) }}
              className={`flex-row items-center border rounded-md pr-3 ${errors.password ? "border-red-500" : "border-borderStrong-light"}`}
            >
              <TextInput
                style={{ padding: rs(12), fontSize: rf(16), flex: 1 }}
                className="text-textPrimary-light font-inter"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.password)
                    setErrors({ ...errors, password: false });
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={rs(20)}
                  color="#112747"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text
                style={{ color: "red", fontSize: rf(12), marginBottom: rs(16) }}
                className="font-inter"
              >
                * Input required
              </Text>
            )}

            <Text
              style={{ fontSize: rf(14), marginBottom: rs(4) }}
              className="font-inter text-textPrimary-light"
            >
              Role
            </Text>
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

            <View
              className="flex-row justify-end space-x-3 gap-4"
              style={{ zIndex: 1 }}
            >
              <TouchableOpacity
                style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
                className="bg-gray-200 rounded-md"
                onPress={() => {
                  setErrors({
                    firstName: false,
                    lastName: false,
                    username: false,
                    password: false,
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
                style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
                className={`bg-mainColor-light rounded-md ${isLoading ? "opacity-50" : ""}`}
                onPress={handleSaveAccount}
                disabled={isLoading}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  {isLoading
                    ? "Saving..."
                    : isEditing
                      ? "Update Account"
                      : "Save Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Feedback Modal Triggered Here */}
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
