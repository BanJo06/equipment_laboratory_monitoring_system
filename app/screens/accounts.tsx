import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AddAccountModal from "../components/dialogs/AddAccountModal";
import DeleteConfirmationModal from "../components/dialogs/DeleteConfirmationModal";
import StatusModal from "../components/dialogs/StatusModal";

export default function Accounts() {
  const [nameSearch, setNameSearch] = useState("");
  const { width } = useWindowDimensions();

  const [modalVisible, setModalVisible] = useState(false);
  const [accountsList, setAccountsList] = useState<any[]>([]);

  const [accountToEdit, setAccountToEdit] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isFetching, setIsFetching] = useState(true);

  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // New function to load cached data instantly
  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("cached_accounts_list");
      if (cachedData) {
        setAccountsList(JSON.parse(cachedData));
        setIsFetching(false); // Stop loading spinner immediately if cache exists
      }
    } catch (error) {
      console.error("Cache load error:", error);
    }

    // Always fetch fresh data in the background
    fetchAccounts(false);
  };

  const fetchAccounts = async (showLoader = true) => {
    if (showLoader) setIsFetching(true);
    try {
      const { data, error } = await supabase.from("accounts").select("*");
      if (error) {
        console.error("Fetch error:", error.message);
        return;
      }
      if (data) {
        setAccountsList(data);
        // Save the fresh data to cache for the next time the screen is opened
        await AsyncStorage.setItem(
          "cached_accounts_list",
          JSON.stringify(data),
        );
      }
    } catch (error) {
      console.error("Unexpected fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Call the cache loader instead of directly calling fetchAccounts on mount
    loadCachedData();
  }, []);

  const openAddModal = () => {
    setAccountToEdit(null);
    setModalVisible(true);
  };

  const openEditModal = (account: any) => {
    setAccountToEdit(account);
    setActiveDropdown(null);
    setModalVisible(true);
  };

  const confirmDelete = (id: string) => {
    setActiveDropdown(null);
    setAccountToDelete(id);
    setDeleteModalVisible(true);
  };

  const deleteAccountItem = async () => {
    if (!accountToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountToDelete);
      if (error) throw new Error(error.message);

      fetchAccounts(false); // Fetch silently after delete
      setDeleteModalVisible(false);
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to delete account.");
    } finally {
      setIsDeleting(false);
      setAccountToDelete(null);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: rs(32),
        minHeight: isMobile ? rs(450) : undefined,
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        accountToEdit={accountToEdit}
        onSuccess={() => {
          fetchAccounts(false); // Fetch silently after adding/editing
        }}
      />

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={deleteAccountItem}
        isDeleting={isDeleting}
      />

      <StatusModal
        visible={successModalVisible}
        title="Success"
        message="This account is deleted."
        onClose={() => setSuccessModalVisible(false)}
      />

      <View
        style={{
          marginBottom: rs(16),
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            gap: rs(16),
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 1,
          }}
        >
          <SVG_ICONS.Accounts size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Accounts
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Manage accounts
            </Text>
          </View>
        </View>
        <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
      </View>

      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-mainColor-light rounded-md"
          onPress={openAddModal}
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Add Account
          </Text>
        </TouchableOpacity>

        <TextInput
          style={{ padding: 12, fontSize: rf(16), borderRadius: 6 }}
          className="font-inter border border-borderStrong-light text-textPrimary-light"
          placeholder="Search name"
          onChangeText={setNameSearch}
          value={nameSearch}
        />
      </View>

      <ScrollView
        style={{ flex: 1, overflow: "visible" }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ padding: rs(32) }}
          className="bg-white rounded-lg border-[2px] border-borderStrong-light"
        >
          <View
            style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
            className="flex-row border-b border-[#6684B0]"
          >
            <Text
              style={{ fontSize: rf(16), flex: 2 }}
              className="font-inter-bold text-textPrimary-light"
            >
              Full Name
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 2 }}
              className="text-left font-inter-bold text-textPrimary-light"
            >
              Username
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 1 }}
              className="text-left font-inter-bold text-textPrimary-light"
            >
              Role
            </Text>
            <Text
              style={{ fontSize: rf(16), flex: 0.5 }}
              className="text-right font-inter-bold text-textPrimary-light"
            >
              Status
            </Text>
            <View style={{ flex: 0.3 }} />
          </View>

          {isFetching && accountsList.length === 0 ? (
            <View style={{ padding: rs(32), alignItems: "center" }}>
              <ActivityIndicator size="large" color="#1d4ed8" />
              <Text
                style={{ marginTop: rs(16), fontSize: rf(14) }}
                className="font-inter text-textSecondary-light"
              >
                Loading accounts...
              </Text>
            </View>
          ) : accountsList.length === 0 ? (
            <Text
              style={{ padding: rs(16), textAlign: "center" }}
              className="font-inter text-textSecondary-light"
            >
              No accounts found.
            </Text>
          ) : (
            accountsList.map((item, idx) => (
              <View
                key={item.id || idx}
                style={{
                  paddingVertical: rs(12),
                  zIndex: activeDropdown === item.id ? 10 : 1,
                }}
                className={`flex-row items-center ${idx !== accountsList.length - 1 ? "border-b border-[#DADFE5]" : ""}`}
              >
                <Text
                  style={{ fontSize: rf(16), flex: 2 }}
                  className="font-inter text-textPrimary-light"
                  numberOfLines={1}
                >
                  {item.first_name} {item.last_name}
                </Text>
                <Text
                  style={{ fontSize: rf(16), flex: 2 }}
                  className="font-inter text-left text-textPrimary-light"
                >
                  {item.username}
                </Text>
                <Text
                  style={{ fontSize: rf(16), flex: 1 }}
                  className="font-inter text-left text-textPrimary-light capitalize"
                >
                  {item.role || "user"}
                </Text>
                <Text
                  style={{ fontSize: rf(16), flex: 0.5 }}
                  className="font-inter text-right text-textPrimary-light"
                >
                  Online
                </Text>

                <View
                  style={{
                    flex: 0.3,
                    alignItems: "flex-end",
                    position: "relative",
                  }}
                >
                  <TouchableOpacity
                    style={{ padding: rs(4) }}
                    onPress={() =>
                      setActiveDropdown(
                        activeDropdown === item.id ? null : item.id,
                      )
                    }
                  >
                    <Feather
                      name="more-vertical"
                      size={rs(20)}
                      color="#112747"
                    />
                  </TouchableOpacity>

                  {activeDropdown === item.id && (
                    <>
                      <Pressable
                        style={
                          {
                            position: "absolute",
                            top: -5000,
                            left: -5000,
                            width: 10000,
                            height: 10000,
                            zIndex: 90,
                            cursor: "auto",
                          } as any
                        }
                        onPress={() => setActiveDropdown(null)}
                      />

                      <View
                        className="absolute top-full right-0 bg-white border border-borderStrong-light rounded-md shadow-sm"
                        style={{
                          minWidth: rs(100),
                          zIndex: 100,
                          elevation: 5,
                          marginTop: rs(4),
                        }}
                      >
                        <TouchableOpacity
                          style={{ padding: rs(10) }}
                          className="border-b border-borderStrong-light"
                          onPress={() => openEditModal(item)}
                        >
                          <Text
                            style={{ fontSize: rf(14) }}
                            className="font-inter text-textPrimary-light"
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ padding: rs(10) }}
                          onPress={() => confirmDelete(item.id)}
                        >
                          <Text
                            style={{ fontSize: rf(14) }}
                            className="font-inter text-red-600"
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
