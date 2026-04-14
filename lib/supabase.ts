import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "process.env.EXPO_PUBLIC_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY";

// Custom storage adapter to prevent SSR crashes
const ExpoAsyncStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return null;
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    await AsyncStorage.removeItem(key);
  },
};

console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("Supabase Key:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
