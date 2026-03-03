import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate?: Date | null;
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate,
}: DatePickerModalProps) {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const scale = isMobile ? Math.min(width / 430, 1) : Math.min(width / 1440, 1);
  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- CALENDAR STATE ---
  const [viewDate, setViewDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewDate(initialDate || new Date());
      setShowYearPicker(false); // Reset to calendar view when opened
    }
  }, [visible, initialDate]);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Generate a list of years (e.g., 2000 to 2050)
  const yearsArray = Array.from({ length: 51 }, (_, i) => 2000 + i);

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const daysArray = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthNames = [
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
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDaySelect = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    onSelect(selected);
    onClose();
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
    setShowYearPicker(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{ width: isMobile ? "100%" : 400, padding: rs(24) }}
          className="bg-white rounded-xl shadow-lg"
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-6">
            <Text
              style={{ fontSize: rf(20) }}
              className="font-inter-bold text-textPrimary-light"
            >
              {showYearPicker ? "Select Year" : "Select Date"}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: rs(4) }}>
              <Feather name="x" size={rs(24)} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* MONTH & YEAR NAVIGATION */}
          <View className="flex-row justify-between items-center mb-4 px-2">
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={{ padding: rs(8), opacity: showYearPicker ? 0 : 1 }}
              disabled={showYearPicker}
            >
              <Feather name="chevron-left" size={rs(24)} color="#1d4ed8" />
            </TouchableOpacity>

            {/* Clickable Month/Year text to toggle Year Picker */}
            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: rs(4),
              }}
            >
              <Text
                style={{ fontSize: rf(16) }}
                className="font-inter-bold text-textPrimary-light"
              >
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <Feather
                name={showYearPicker ? "chevron-up" : "chevron-down"}
                size={rs(16)}
                color="#1d4ed8"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={{ padding: rs(8), opacity: showYearPicker ? 0 : 1 }}
              disabled={showYearPicker}
            >
              <Feather name="chevron-right" size={rs(24)} color="#1d4ed8" />
            </TouchableOpacity>
          </View>

          {showYearPicker ? (
            /* YEAR PICKER VIEW */
            <View style={{ height: rs(260) }}>
              <ScrollView showsVerticalScrollIndicator={true}>
                <View className="flex-row flex-wrap">
                  {yearsArray.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => handleYearSelect(year)}
                      style={{
                        width: "25%", // 4 columns
                        paddingVertical: rs(12),
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor:
                            year === currentYear ? "#1d4ed8" : "transparent",
                          paddingHorizontal: rs(12),
                          paddingVertical: rs(6),
                          borderRadius: 100,
                        }}
                      >
                        <Text
                          style={{ fontSize: rf(14) }}
                          className={`font-inter ${
                            year === currentYear
                              ? "text-white font-inter-bold"
                              : "text-textPrimary-light"
                          }`}
                        >
                          {year}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            /* DAY PICKER VIEW (CALENDAR GRID) */
            <View>
              {/* WEEKDAYS */}
              <View className="flex-row mb-2">
                {weekDays.map((day) => (
                  <Text
                    key={day}
                    style={{ flex: 1, textAlign: "center", fontSize: rf(14) }}
                    className="font-inter-bold text-textSecondary-light"
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* DAYS GRID */}
              <View className="flex-row flex-wrap">
                {daysArray.map((day, index) => {
                  const isSelected =
                    initialDate &&
                    day === initialDate.getDate() &&
                    currentMonth === initialDate.getMonth() &&
                    currentYear === initialDate.getFullYear();

                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <View
                      key={index}
                      style={{
                        width: "14.28%", // 100% / 7 columns
                        aspectRatio: 1,
                        padding: rs(2),
                      }}
                    >
                      {day ? (
                        <TouchableOpacity
                          onPress={() => handleDaySelect(day)}
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 100,
                            backgroundColor: isSelected
                              ? "#1d4ed8"
                              : "transparent",
                            borderWidth: isToday && !isSelected ? 1 : 0,
                            borderColor: "#1d4ed8",
                          }}
                        >
                          <Text
                            style={{ fontSize: rf(14) }}
                            className={`font-inter ${
                              isSelected
                                ? "text-white font-inter-bold"
                                : isToday
                                  ? "text-blue-700 font-inter-bold"
                                  : "text-textPrimary-light"
                            }`}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
