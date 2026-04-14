import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://fxebpqjzmubtekgzltmu.supabase.co";
const supabaseAnonKey = "sb_publishable_gcTkliqe4K-ER4TdrIj8NA_cVYPpXE9";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are MISSING!");
}

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
