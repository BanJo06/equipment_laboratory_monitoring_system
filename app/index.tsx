import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SVG_ICONS } from "../assets/constants/icons";

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
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

  const toUserDashboard = () => {
    // Perform logic here
    console.log("Navigating to User Dashboard");

    // Then navigate
    router.push("/user_dashboard");
  };

  return (
    <View className="flex-1 bg-bgPrimary-light justify-center items-center">
      <View className="w-[560] h-[850] p-8 bg-card-light rounded-xl drop-shadow-[1px_2px_4px_rgba(0,0,0,0.25)]">
        <View className="items-center">
          <View className="mt-8 mb-4">
            <SVG_ICONS.LogIn size={64} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-[34px] font-inter-bold leading-bigger-text-line text-textPrimary-light">
              Lab Equipment Monitor
            </Text>
            <Text className="text-[16px] font-inter leading-normal text-textSecondary-light">
              Log-in to record equipment usage
            </Text>
          </View>
        </View>
        <View className="mt-[96px] mb-[98px] mx-4">
          <View className="gap-2 mb-8">
            <Text className="font-inter text-[16px] leading-normal text-textPrimary-light">
              Username
            </Text>
            <TextInput
              className="p-2 font-inter text-[16px] leading-normal border rounded-md border-borderStrong-light dark:border-borderStrong-dark text-search-light dark:text-search-dark"
              placeholder="your username"
              onChangeText={setUsername}
              value={username}
            />
          </View>
          <View className="gap-2">
            <Text className="font-inter text-[16px] leading-normal text-textPrimary-light">
              Password
            </Text>
            <TextInput
              className="p-2 font-inter text-[16px] border rounded-md border-borderStrong-light dark:border-borderStrong-dark text-search-light dark:text-search-dark"
              placeholder="your password"
              onChangeText={setPassword}
              value={password}
            />
          </View>
        </View>
        <View className="items-center mx-4 gap-4">
          <TouchableOpacity
            className="w-full py-4 rounded-md bg-primary-light justify-center items-center"
            onPress={toUserDashboard}
          >
            <Text className="font-inter-bold text-[16px] leading-normal text-textButton-light dark:text-textButton-dark">
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-md bg-primary-light justify-center items-center mb-6"
            onPress={() => console.log("Hi!")}
          >
            <Text className="font-inter-bold text-[16px] leading-normal text-textButton-light dark:text-textButton-dark">
              Admin Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-md bg-primary-light justify-center items-center"
            onPress={() => console.log("Hi!")}
          >
            <Text className="font-inter-bold text-[16px] leading-normal text-textButton-light dark:text-textButton-dark">
              Log Out using QR Code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
