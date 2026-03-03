import { SVG_ICONS } from "@/assets/constants/icons";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { CameraView, useCameraPermissions } from "expo-camera"; // NEW IMPORT
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import StatusModal from "./components/dialogs/StatusModal";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 768;
  const isSmallPhone = width < 440;

  const rf = (size: number) => (isSmallPhone ? size * (width / 440) : size);
  const rs = (size: number) => (isMobile ? size * (width / 430) : size);

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- QR SCANNER STATE ---
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingQR, setIsProcessingQR] = useState(false);

  // Modal State Management
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const closeModal = () => setModalConfig({ ...modalConfig, visible: false });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // --- QR LOGOUT PROCESS ---
  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        setModalConfig({
          visible: true,
          title: "Permission Denied",
          message: "Camera permission is required to scan QR codes.",
        });
        return;
      }
    }
    setIsScanning(true);
  };

  const handleQRScanned = async ({ data }: { data: string }) => {
    if (isProcessingQR) return; // Prevent duplicate scans
    setIsProcessingQR(true);
    setIsScanning(false); // Close camera

    try {
      // 1. Fetch the session based on the scanned QR (which contains the log ID)
      const { data: logData, error: logError } = await supabase
        .from("equipment_logs")
        .select("*")
        .eq("id", data)
        .single();

      if (logError || !logData) {
        throw new Error("Invalid QR Code or Session not found.");
      }

      if (logData.status !== "In Use") {
        throw new Error("This session is already completed or cancelled.");
      }

      // 2. Calculate Final Duration
      const start = new Date(logData.created_at).getTime();
      const current = new Date().getTime();
      const diff = Math.max(0, current - start);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const finalDuration = `${hours}H ${minutes}M`;
      const timeOut = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // 3. Update Log Status
      const { error: updateError } = await supabase
        .from("equipment_logs")
        .update({
          time_out: timeOut,
          duration: finalDuration,
          status: "completed",
        })
        .eq("id", data);

      if (updateError) throw updateError;

      // 4. Return Stock to Inventory
      const { data: eqData } = await supabase
        .from("equipment_inventory")
        .select("units")
        .eq("name", logData.equipment_name)
        .single();

      if (eqData) {
        await supabase
          .from("equipment_inventory")
          .update({ units: eqData.units + 1 })
          .eq("name", logData.equipment_name);
      }

      setModalConfig({
        visible: true,
        title: "Logout Success",
        message: `Successfully logged out equipment: ${logData.equipment_name}`,
      });
    } catch (err: any) {
      setModalConfig({
        visible: true,
        title: "Scan Error",
        message: err.message || "An error occurred during logout.",
      });
    } finally {
      setIsProcessingQR(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setModalConfig({
        visible: true,
        title: "Error",
        message: "Please enter both username and password.",
      });
      return;
    }

    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("accounts")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .eq("role", "User")
      .single();

    if (fetchError || !data) {
      setLoading(false);
      setModalConfig({
        visible: true,
        title: "Login Failed",
        message: "Username and password is incorrect, please try again.",
      });
      return;
    }

    if (data.isOnline) {
      setLoading(false);
      setModalConfig({
        visible: true,
        title: "Login Failed",
        message: "This user is already log-in now.",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("accounts")
      .update({ isOnline: true })
      .eq("id", data.id);

    setLoading(false);

    if (updateError) {
      setModalConfig({
        visible: true,
        title: "Error",
        message: "Failed to update online status.",
      });
      return;
    }

    router.push({
      pathname: "/user_dashboard",
      params: {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });
  };

  if (!loaded && !error) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* SCANNER MODAL OVERLAY */}
      <Modal visible={isScanning} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleQRScanned}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 50,
              }}
            >
              <View className="bg-black/60 p-4 rounded-xl mb-6 items-center">
                <Text className="text-white font-inter-bold text-lg">
                  Align QR Code within the camera
                </Text>
              </View>
              <TouchableOpacity
                style={{ paddingVertical: 16, paddingHorizontal: 40 }}
                className="bg-red-600 rounded-full"
                onPress={() => setIsScanning(false)}
              >
                <Text
                  style={{ fontSize: 18 }}
                  className="font-inter-bold text-white"
                >
                  Cancel Scan
                </Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      <StatusModal
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 40,
        }}
        className="bg-bgPrimary-light"
      >
        <View
          style={{
            width: isMobile ? "90%" : 560,
            maxWidth: "90%",
            minHeight: isMobile ? 0 : 800,
            paddingTop: 32,
            paddingHorizontal: 32,
            paddingBottom: 0,
            borderRadius: 12,
          }}
          className="bg-card-light shadow-lg"
        >
          {/* Header Section */}
          <View className="items-center">
            <View style={{ marginTop: 40, marginBottom: 16 }}>
              <SVG_ICONS.LogIn size={64} />
            </View>
            <View style={{ gap: 8 }} className="items-center">
              <Text
                style={{ fontSize: rf(34) }}
                className="font-inter-bold text-center text-textPrimary-light"
              >
                Lab Equipment Monitor
              </Text>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter text-center text-textSecondary-light"
              >
                Log-in to record equipment usage
              </Text>
            </View>
          </View>

          {/* Inputs Section */}
          <View
            style={{
              marginTop: isMobile ? 60 : 96,
              marginBottom: isMobile ? 60 : 98,
              marginHorizontal: 16,
            }}
          >
            <View style={{ gap: 8, marginBottom: 32 }}>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter text-textPrimary-light"
              >
                Username
              </Text>
              <TextInput
                style={{ padding: 12, fontSize: rf(16), borderRadius: 6 }}
                className="font-inter border border-borderStrong-light text-textPrimary-light"
                placeholder="Enter username"
                onChangeText={setUsername}
                value={username}
                autoCapitalize="none"
              />
            </View>
            <View style={{ gap: 8 }}>
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter text-textPrimary-light"
              >
                Password
              </Text>
              <TextInput
                style={{ padding: 12, fontSize: rf(16), borderRadius: 6 }}
                className="font-inter border border-borderStrong-light text-textPrimary-light"
                placeholder="Enter password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
              />
            </View>
          </View>

          {/* Buttons Section */}
          <View style={{ marginHorizontal: 16 }}>
            <View style={{ gap: 16 }}>
              <TouchableOpacity
                style={{ height: 56, opacity: loading ? 0.7 : 1 }}
                className="w-full rounded-md bg-mainColor-light justify-center items-center"
                onPress={handleLogin}
                disabled={loading}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  {loading ? "Logging In..." : "Log In"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ height: 56 }}
                className="w-full rounded-md bg-mainColor-light justify-center items-center"
                onPress={() => router.push("/admin_dashboard")}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-white"
                >
                  Admin Log In
                </Text>
              </TouchableOpacity>
            </View>

            {/* CHANGED: Hooked up to openScanner */}
            <TouchableOpacity
              style={{
                height: 56,
                marginTop: 40,
                marginBottom: 40,
              }}
              className="w-full rounded-md bg-mainColor-light justify-center items-center"
              onPress={openScanner}
              disabled={isProcessingQR}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-white text-center px-4"
              >
                {isProcessingQR
                  ? "Processing Logout..."
                  : "Log Out using QR Code"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
