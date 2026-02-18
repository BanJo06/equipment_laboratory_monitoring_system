import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const Card = ({ children, className = "" }) => (
  <View className={`bg-white rounded-2xl p-5 mb-5 shadow-sm ${className}`}>
    {children}
  </View>
);

// 1. Updated BlueButton: Added "onPress = () => {}" to make it optional
const BlueButton = ({ children, onPress = () => {}, className = "" }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-blue-700 rounded-lg py-2.5 px-4 items-center justify-center ${className}`}
  >
    {children}
  </TouchableOpacity>
);

const BlueButtonText = ({ children, className = "" }) => (
  <Text className={`text-white font-semibold text-base ${className}`}>
    {children}
  </Text>
);

// 2. Updated OutlineButton: Added "onPress = () => {}" to make it optional
const OutlineButton = ({ children, onPress = () => {} }) => (
  <TouchableOpacity
    onPress={onPress}
    className="border border-blue-700 rounded-lg py-1.5 px-3 flex-row items-center"
  >
    {children}
  </TouchableOpacity>
);

const OutlineButtonText = ({ children }) => (
  <Text className="text-blue-700 font-semibold ml-2">{children}</Text>
);

const DropdownMock = ({ children, className = "" }) => (
  <View
    className={`bg-gray-200 rounded-lg p-3 flex-row justify-between items-center mt-2 ${className}`}
  >
    {children}
  </View>
);

const SectionTitle = ({ children }) => (
  <Text className="text-xl font-bold text-gray-800 ml-3">{children}</Text>
);

const LabelText = ({ children }) => (
  <Text className="text-gray-600 font-medium mb-1">{children}</Text>
);

const StatCard = ({ children }) => (
  <View className="bg-white rounded-2xl p-5 mb-4 w-[48%] shadow-sm justify-between min-h-[140px]">
    {children}
  </View>
);

const RadioOption = ({ label, selected }) => (
  <View className="flex-row items-center mr-4">
    <View
      className={`h-5 w-5 rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"} items-center justify-center mr-2`}
    >
      {selected && <View className="h-2 w-2 rounded-full bg-white" />}
    </View>
    <Text className="text-gray-700">{label}</Text>
  </View>
);

export default function user_dashboard() {
  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 p-4 pt-12">
        {/* --- MAIN GRID CONTAINER --- */}
        <View className="flex-row items-start">
          {/* =======================
              LEFT COLUMN 
             ======================= */}
          <View className="flex-1 mr-4">
            {/* 1. Hello Juan */}
            <Card className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  Hello, Juan!
                </Text>
                <Text className="text-gray-500 mt-1">
                  Ready to use laboratory equipment
                </Text>
              </View>
              <BlueButton>
                <BlueButtonText>Logout</BlueButtonText>
              </BlueButton>
            </Card>

            {/* 2. Start Session */}
            <Card>
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full">
                    <Feather name="clock" size={24} color="#1d4ed8" />
                  </View>
                  <View>
                    <SectionTitle>Start Session</SectionTitle>
                    <Text className="text-gray-500 ml-3">
                      Begin using equipment
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Feather name="help-circle" size={24} color="#1d4ed8" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-1">
                  <FontAwesome5
                    name="flask"
                    size={14}
                    color="#4b5563"
                    style={{ marginRight: 8 }}
                  />
                  <LabelText>Select Equipment</LabelText>
                </View>
                <DropdownMock>
                  <Text className="text-gray-600">Choose equipment</Text>
                  <Feather name="chevron-down" size={20} color="gray" />
                </DropdownMock>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <Feather
                    name="clock"
                    size={14}
                    color="#4b5563"
                    style={{ marginRight: 8 }}
                  />
                  <LabelText>Start Time</LabelText>
                </View>
                <View className="flex-row mb-2">
                  <RadioOption label="Dropdown" selected={true} />
                  <RadioOption label="Manual Entry" selected={false} />
                </View>
                <DropdownMock>
                  <Text className="text-gray-800">11:45 AM</Text>
                  <Feather name="chevron-down" size={20} color="gray" />
                </DropdownMock>
              </View>

              <BlueButton className="w-full py-3">
                <BlueButtonText className="text-lg">
                  Start Using Equipment
                </BlueButtonText>
              </BlueButton>
            </Card>

            {/* 3. Available Equipments (Moved to Left Column) */}
            <Card>
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Available Equipments
              </Text>

              {/* Table Header */}
              <View className="flex-row border-b border-gray-300 pb-2 mb-2">
                <Text className="flex-1 font-semibold text-gray-700">Item</Text>
                <Text className="w-1/4 text-center font-semibold text-gray-700">
                  Qty
                </Text>
                <Text className="w-1/3 text-right font-semibold text-gray-700">
                  Last Used
                </Text>
              </View>

              {/* Table Rows */}
              <View className="flex-row border-b border-gray-200 py-3">
                <Text className="flex-1 text-gray-800">Microscope A</Text>
                <Text className="w-1/4 text-center text-gray-800">1</Text>
                <Text className="w-1/3 text-right text-gray-600">Jan 2</Text>
              </View>
              <View className="flex-row border-b border-gray-200 py-3">
                <Text className="flex-1 text-gray-800">PCR Machine</Text>
                <Text className="w-1/4 text-center text-gray-800">3</Text>
                <Text className="w-1/3 text-right text-gray-600">Dec 10</Text>
              </View>
              <View className="flex-row py-3">
                <Text className="flex-1 text-gray-800">Incubator</Text>
                <Text className="w-1/4 text-center text-gray-800">1</Text>
                <Text className="w-1/3 text-right text-gray-600">Jan 5</Text>
              </View>
            </Card>
          </View>

          {/* =======================
              RIGHT COLUMN 
             ======================= */}
          <View className="flex-1">
            {/* 1. Active Sessions */}
            <Card>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full">
                    <MaterialCommunityIcons
                      name="account-clock-outline"
                      size={24}
                      color="#1d4ed8"
                    />
                  </View>
                  <View>
                    <SectionTitle>Active Sessions</SectionTitle>
                    <Text className="text-gray-500 ml-3">
                      2 equipments in use
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Feather name="help-circle" size={24} color="#1d4ed8" />
                </TouchableOpacity>
              </View>

              {/* Active Item 1: Microscope A */}
              <View className="bg-gray-200 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="microscope"
                      size={20}
                      color="#1d4ed8"
                    />
                    <Text className="font-semibold text-gray-800 ml-2 text-lg">
                      Microscope A
                    </Text>
                  </View>
                  <OutlineButton>
                    <Ionicons
                      name="qr-code-outline"
                      size={16}
                      color="#1d4ed8"
                    />
                    <OutlineButtonText>QR</OutlineButtonText>
                  </OutlineButton>
                </View>

                <View className="flex-row items-center mb-4">
                  <Feather name="clock" size={14} color="gray" />
                  <Text className="text-gray-600 ml-2">Started: 8:00 AM</Text>
                  <View className="bg-gray-300 rounded px-2 py-0.5 ml-3">
                    <Text className="text-gray-700 text-xs font-medium">
                      3h 55m
                    </Text>
                  </View>
                </View>

                <View>
                  <View className="flex-row items-center mb-2">
                    <Feather
                      name="clock"
                      size={14}
                      color="#4b5563"
                      style={{ marginRight: 8 }}
                    />
                    <LabelText>End Time</LabelText>
                  </View>
                  <View className="flex-row mb-2">
                    <RadioOption label="Dropdown" selected={true} />
                    <RadioOption label="Manual" selected={false} />
                  </View>
                  <View className="flex-row">
                    <DropdownMock className="flex-1 mr-2 mt-0 bg-gray-300">
                      <Text className="text-gray-800">11:45 AM</Text>
                      <Feather name="chevron-down" size={20} color="gray" />
                    </DropdownMock>
                    <BlueButton className="px-6 bg-blue-700">
                      <BlueButtonText>Stop</BlueButtonText>
                    </BlueButton>
                  </View>
                </View>
              </View>

              {/* Active Item 2: PCR Machine */}
              <View className="bg-gray-200 rounded-xl p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="printer-3d"
                      size={20}
                      color="#1d4ed8"
                    />
                    <Text className="font-semibold text-gray-800 ml-2 text-lg">
                      PCR Machine
                    </Text>
                  </View>
                  <OutlineButton>
                    <Ionicons
                      name="qr-code-outline"
                      size={16}
                      color="#1d4ed8"
                    />
                    <OutlineButtonText>QR</OutlineButtonText>
                  </OutlineButton>
                </View>
                <View className="flex-row items-center">
                  <Feather name="clock" size={14} color="gray" />
                  <Text className="text-gray-600 ml-2">Started: 9:00 AM</Text>
                  <View className="bg-gray-300 rounded px-2 py-0.5 ml-3">
                    <Text className="text-gray-700 text-xs font-medium">
                      2h 55m
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 4. Small Stats Grid (Moved to Right Column) */}
            <View className="flex-row flex-wrap justify-between">
              <StatCard>
                <Text className="text-lg font-semibold text-gray-800">
                  My Active
                </Text>
                <Text className="text-3xl font-bold text-blue-700 mt-2">2</Text>
              </StatCard>

              <StatCard>
                <Text className="text-lg font-semibold text-gray-800">
                  Date/Time
                </Text>
                <View className="mt-2">
                  <Text className="text-gray-700 text-base">Jan 10, 2026</Text>
                  <Text className="text-gray-500 text-sm mt-1">11:15 AM</Text>
                </View>
              </StatCard>

              <StatCard>
                <Text className="text-lg font-semibold text-gray-800">
                  Available
                </Text>
                <Text className="text-3xl font-bold text-blue-700 mt-2">8</Text>
              </StatCard>

              <StatCard>
                <Text className="text-lg font-semibold text-gray-800">
                  Total
                </Text>
                <Text className="text-3xl font-bold text-blue-700 mt-2">8</Text>
              </StatCard>
            </View>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
