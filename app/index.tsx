import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SVG_ICONS } from "../assets/constants/icons";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 768;
  const isSmallPhone = width < 440;

  // Font stays 100% size until width < 440px
  const rf = (size) => (isSmallPhone ? size * (width / 440) : size);
  // Spacing stays proportional on mobile, fixed on desktop
  const rs = (size) => (isMobile ? size * (width / 430) : size);

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

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
                className="font-inter border border-borderStrong-light text-search-light"
                placeholder="your username"
                onChangeText={setUsername}
                value={username}
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
                className="font-inter border border-borderStrong-light text-search-light"
                placeholder="your password"
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
                style={{ height: 56 }}
                className="w-full rounded-md bg-primary-light justify-center items-center"
                onPress={() => router.push("/user_dashboard")}
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textButton-light"
                >
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ height: 56 }}
                className="w-full rounded-md bg-primary-light justify-center items-center"
              >
                <Text
                  style={{ fontSize: rf(16) }}
                  className="font-inter-bold text-textButton-light"
                >
                  Admin Log In
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                height: 56,
                marginTop: 40,
                marginBottom: 40,
              }}
              className="w-full rounded-md bg-primary-light justify-center items-center"
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textButton-light text-center px-4"
              >
                Log Out using QR Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
