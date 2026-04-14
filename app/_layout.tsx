import { Stack } from "expo-router";
import { View } from "react-native";
import "../app/globals.css";

export default function RootLayout() {
  return (
    // 'flex-1' makes it grow, 'min-h-screen' (or h-full) ensures it fills the browser
    <View className="flex-1 min-h-screen">
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
