import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const StartSessionCard = ({ children, className = "" }) => (
  <View
    className={`bg-white rounded-lg px-8 pt-8 pb-6 mb-6 shadow-sm ${className}`}
  >
    {children}
  </View>
);

const Card = ({ children, className = "" }) => (
  <View className={`bg-white rounded-lg p-8 mb-6 shadow-sm ${className}`}>
    {children}
  </View>
);

// 1. Updated BlueButton: Added "onPress = () => {}" to make it optional
const BlueButton = ({ children, onPress = () => {}, className = "" }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-mainColor-light rounded-md py-2.5 px-4 items-center justify-center ${className}`}
  >
    {children}
  </TouchableOpacity>
);

const BlueButtonText = ({ children, className = "" }) => (
  <Text
    className={`text-white font-bold font-inter-bold text-[16px] ${className}`}
  >
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
    className={`bg-[#EBEDF0] rounded-lg p-3 flex-row justify-between items-center mt-2 ${className}`}
  >
    {children}
  </View>
);

const InsideCardDropdownMock = ({ children, className = "" }) => (
  <View
    className={`bg-white rounded-lg p-3 flex-row justify-between items-center mt-2 ${className}`}
  >
    {children}
  </View>
);

const SectionTitle = ({ children }) => (
  <Text className="text-[28px] font-inter-bold text-textPrimary-light">
    {children}
  </Text>
);

const LabelText = ({ children }) => (
  <Text className="text-textPrimary-light font-inter text-[16px]">
    {children}
  </Text>
);

const StatCard = ({ children }) => (
  <View className="bg-white rounded-2xl p-4 mb-6 w-[48%] shadow-sm min-h-[140px] max-h-[302px]">
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
    <Text className="text-textPrimary-light font-inter text-[14px]">
      {label}
    </Text>
  </View>
);

export default function user_dashboard() {
  return (
    <View className="flex-1 bg-bgPrimary-light">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 p-4 pt-8">
        {/* --- MAIN GRID CONTAINER --- */}
        <View className="flex-row items-start">
          {/* =======================
              LEFT COLUMN 
             ======================= */}
          <View className="flex-1 mr-6">
            {/* 1. Hello Juan */}
            <Card className="flex-row justify-between items-center">
              <View className="gap-2">
                <Text className="text-[34px] font-inter-bold leading-bigger-text-line text-textPrimary-light">
                  Hello, Juan!
                </Text>
                <Text className="text-[16px] font-inter leading-normal text-textSecondary-light">
                  Ready to use laboratory equipment
                </Text>
              </View>
              <BlueButton>
                <BlueButtonText>Logout</BlueButtonText>
              </BlueButton>
            </Card>

            {/* 2. Start Session */}
            <StartSessionCard>
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-4">
                  <View className="bg-blue-100 p-[14px] rounded-full">
                    <Feather name="clock" size={36} color="#1d4ed8" />
                  </View>
                  <View className="gap-[6px]">
                    <SectionTitle>Start Session</SectionTitle>
                    <Text className="text-[16px] font-inter leading-normal text-textSecondary-light">
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
                    size={24}
                    color="#112747"
                    style={{ marginRight: 8 }}
                  />
                  <LabelText>Select Equipment</LabelText>
                </View>
                <DropdownMock>
                  <Text className="text-textPrimary-light font-inter text-[14px]">
                    Choose equipment
                  </Text>
                  <Feather name="chevron-down" size={20} color="gray" />
                </DropdownMock>
              </View>

              <View className="mb-6 bg-[#DADFE5] p-4 rounded-[10px]">
                <View className="flex-row items-center mb-2">
                  <Feather
                    name="clock"
                    size={24}
                    color="#112747"
                    style={{ marginRight: 8 }}
                  />
                  <LabelText>Start Time</LabelText>
                </View>
                <View className="flex-row mb-2">
                  <RadioOption label="Dropdown" selected={true} />
                  <RadioOption label="Manual Entry" selected={false} />
                </View>
                <InsideCardDropdownMock>
                  <Text className="text-textPrimary-light font-inter text-[14px]">
                    11:45 AM
                  </Text>
                  <Feather name="chevron-down" size={20} color="gray" />
                </InsideCardDropdownMock>
              </View>

              <BlueButton className="w-full py-3">
                <BlueButtonText className="text-lg">
                  Start Using Equipment
                </BlueButtonText>
              </BlueButton>
            </StartSessionCard>

            {/* 3. Available Equipments (Moved to Left Column) */}
            <Card>
              <Text className="text-[28px] font-inter-bold text-textPrimary-light mb-4">
                Available Equipments
              </Text>

              {/* Table Header */}
              <View className="flex-row border-b border-[#6684B0] pb-2 mb-2">
                <Text className="flex-1 font-inter-bold text-textPrimary-light">
                  Item
                </Text>
                <Text className="w-1/4 text-center font-inter-bold text-textPrimary-light">
                  Qty
                </Text>
                <Text className="w-1/3 text-right font-inter-bold text-textPrimary-light">
                  Last Used
                </Text>
              </View>

              {/* Table Rows */}
              <View className="flex-row border-b border-[#DADFE5] py-2">
                <Text className="flex-1 font-inter text-textPrimary-light">
                  Microscope A
                </Text>
                <Text className="w-1/4 font-inter text-center text-textPrimary-light">
                  1
                </Text>
                <Text className="w-1/3 font-inter text-right text-textPrimary-light">
                  Jan 2
                </Text>
              </View>
              <View className="flex-row border-b border-[#DADFE5] py-2">
                <Text className="flex-1 font-inter text-textPrimary-light">
                  PCR Machine
                </Text>
                <Text className="w-1/4 font-inter text-center text-textPrimary-light">
                  3
                </Text>
                <Text className="w-1/3 font-inter text-right text-textPrimary-light">
                  Dec 10
                </Text>
              </View>
              <View className="flex-row py-2">
                <Text className="flex-1 font-inter text-textPrimary-light">
                  Incubator
                </Text>
                <Text className="w-1/4 font-inter text-center text-textPrimary-light">
                  1
                </Text>
                <Text className="w-1/3 font-inter text-right text-textPrimary-light">
                  Jan 5
                </Text>
              </View>
            </Card>
          </View>

          {/* =======================
              RIGHT COLUMN 
             ======================= */}
          <View className="flex-1">
            {/* 1. Active Sessions */}
            <Card>
              {/* Header Section (Stays Fixed) */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-4">
                  <View className="bg-blue-100 p-[14px] rounded-full">
                    <MaterialCommunityIcons
                      name="account-clock-outline"
                      size={36}
                      color="#1d4ed8"
                    />
                  </View>
                  <View className="gap-[6px]">
                    <SectionTitle>Active Sessions</SectionTitle>
                    <Text className="text-[16px] font-inter text-textSecondary-light">
                      2 equipments in use
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Feather name="help-circle" size={24} color="#1d4ed8" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Area for Items */}
              {/* Added h-96 (approx 384px) to force scrolling. Adjust height as needed. */}
              <ScrollView
                className="h-[492px]"
                nestedScrollEnabled={true}
                // showsVerticalScrollIndicator={true}
              >
                {/* Active Item 1: Microscope A */}
                <View className="bg-gray-200 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="microscope"
                        size={20}
                        color="#1d4ed8"
                      />
                      <Text className="font-inter text-textPrimary-light ml-2 text-[16px]">
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

                  <View className="bg-white flex-row items-center rounded-xl px-4 py-3 self-start shadow-sm border border-gray-100 mb-6">
                    <Feather name="clock" size={24} color="#112747" />
                    <Text className="text-textPrimary-light font-inter ml-2 mr-4 text-[14px]">
                      Started: 8:00 AM
                    </Text>
                    <View className="bg-[#DADFE5] rounded-[4px] px-3 py-1">
                      <Text className="text-textPrimary-light font-inter text-[14px]">
                        3h 55m
                      </Text>
                    </View>
                  </View>

                  <View>
                    <View className="flex-row items-center mb-2">
                      <Feather
                        name="clock"
                        size={24}
                        color="#112747"
                        style={{ marginRight: 8 }}
                      />
                      <LabelText>End Time</LabelText>
                    </View>
                    <View className="flex-row mb-2">
                      <RadioOption label="Dropdown" selected={true} />
                      <RadioOption label="Manual" selected={false} />
                    </View>
                    <View className="flex-row">
                      <InsideCardDropdownMock className="flex-1 mr-2 mt-0 bg-gray-300">
                        <Text className="font-inter text-textPrimary-light">
                          11:45 AM
                        </Text>
                        <Feather name="chevron-down" size={20} color="gray" />
                      </InsideCardDropdownMock>
                      <BlueButton className="px-6 bg-blue-700">
                        <BlueButtonText>Stop</BlueButtonText>
                      </BlueButton>
                    </View>
                  </View>
                </View>

                {/* Active Item 2: PCR Machine */}
                <View className="bg-gray-200 rounded-xl p-4 mb-2">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="printer-3d"
                        size={20}
                        color="#1d4ed8"
                      />
                      <Text className="font-inter text-textPrimary-light ml-2 text-[16px]">
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

                  <View className="bg-white flex-row items-center rounded-xl px-4 py-3 self-start shadow-sm border border-gray-100 mb-6">
                    <Feather name="clock" size={24} color="#112747" />
                    <Text className="text-textPrimary-light font-inter ml-2 mr-4 text-[14px]">
                      Started: 9:00 AM
                    </Text>
                    <View className="bg-[#DADFE5] rounded-[4px] px-3 py-1">
                      <Text className="text-textPrimary-light font-inter text-[14px]">
                        2h 55m
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </Card>

            {/* 4. Small Stats Grid (Moved to Right Column) */}
            <View className="flex-row flex-wrap justify-between">
              <StatCard>
                <Text className="text-[24px] font-inter-bold text-textPrimary-light">
                  My Active
                </Text>
                <Text className="text-[20px] font-inter text-textSecondary-light">
                  2
                </Text>
              </StatCard>

              <StatCard>
                <Text className="text-[24px] font-inter-bold text-textPrimary-light">
                  Date/Time
                </Text>
                <View className="mt-2">
                  <Text className="text-[20px] font-inter text-textSecondary-light">
                    Jan 10, 2026
                  </Text>
                  <Text className="text-[20px] font-inter text-textSecondary-light">
                    11:15 AM
                  </Text>
                </View>
              </StatCard>

              <StatCard>
                <Text className="text-[24px] font-inter-bold text-textPrimary-light">
                  Available
                </Text>
                <Text className="text-[20px] font-inter text-textSecondary-light">
                  8
                </Text>
              </StatCard>

              <StatCard>
                <Text className="text-[24px] font-inter-bold text-textPrimary-light">
                  Total
                </Text>
                <Text className="text-[20px] font-inter text-textSecondary-light">
                  8
                </Text>
              </StatCard>
            </View>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
