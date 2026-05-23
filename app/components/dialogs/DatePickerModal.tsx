import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date | null;
  activePicker: "start" | "end" | null;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate,
  activePicker,
}: DatePickerModalProps) {
  // State to track which month/year the user is currently viewing
  const [viewDate, setViewDate] = useState(new Date());

  // Reset the view to the initialDate or today when the modal opens
  useEffect(() => {
    if (visible) {
      setViewDate(initialDate ? new Date(initialDate) : new Date());
    }
  }, [visible, initialDate]);

  // --- Date Math Utilities ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Strip time for accurate day comparison

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get total days in the current viewing month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // --- Handlers ---
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);
    onSelect(selectedDate);
  };

  // --- Grid Generation ---
  // Create empty slots for the days before the 1st of the month
  const emptySlots = Array.from({ length: firstDayOfMonth }).map((_, i) => i);
  // Create an array of days [1, 2, 3, ... daysInMonth]
  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-inter-bold text-lg text-gray-800">
              Select {activePicker === "start" ? "Start" : "End"} Date
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Feather name="x" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Month/Year Navigation */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="p-2 bg-gray-50 rounded-full"
            >
              <Feather name="chevron-left" size={20} color="#334155" />
            </TouchableOpacity>
            <Text className="font-inter-bold text-base text-gray-800">
              {MONTHS[month]} {year}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              className="p-2 bg-gray-50 rounded-full"
            >
              <Feather name="chevron-right" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          {/* Days of the Week Header */}
          <View className="flex-row justify-between mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-inter-semibold text-gray-400">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {/* Render Empty Slots */}
            {emptySlots.map((slot) => (
              <View
                key={`empty-${slot}`}
                style={{ width: "14.28%", aspectRatio: 1 }}
              />
            ))}

            {/* Render Actual Days */}
            {monthDays.map((day) => {
              const dateObj = new Date(year, month, day);
              dateObj.setHours(0, 0, 0, 0);

              // Core Logic: Disable if the date is before 'today'
              const isPast = dateObj.getTime() < today.getTime();

              // Check if this day is currently selected
              const isSelected = initialDate
                ? dateObj.getTime() ===
                  new Date(initialDate).setHours(0, 0, 0, 0)
                : false;

              return (
                <Pressable
                  key={`day-${day}`}
                  disabled={isPast}
                  onPress={() => handleSelectDay(day)}
                  style={{
                    width: "14.28%", // 100% / 7 columns
                    aspectRatio: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 18,
                      backgroundColor: isSelected ? "#1d4ed8" : "transparent",
                      opacity: isPast ? 0.3 : 1, // Visually fade out past dates
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected
                          ? "white"
                          : isPast
                            ? "#94a3b8"
                            : "#1e293b",
                        fontWeight: isSelected ? "bold" : "normal",
                        textDecorationLine: isPast ? "line-through" : "none",
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
