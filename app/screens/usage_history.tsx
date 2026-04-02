import { SVG_ICONS } from "@/assets/constants/icons";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as XLSX from "xlsx-js-style";
import DatePickerModal from "../components/dialogs/DatePickerModal";
import DeleteLogsModal from "../components/dialogs/DeleteLogsModal";
import ErrorDeleteModal from "../components/dialogs/ErrorDeleteModal";
import ExportRangeModal from "../components/dialogs/ExportRangeModal";
import StatusModal from "../components/dialogs/StatusModal";
import UsageHistoryHelpModal from "../components/dialogs/UsageHistoryHelpModal";

interface EquipmentLog {
  id: string;
  created_at: string;
  full_name: string;
  equipment_name: string;
  model_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  duration: string | null;
  status: string;
}

export default function UsageHistory() {
  const { width } = useWindowDimensions();

  // --- RESPONSIVE MATH ---
  const isMobile = width < 1024;
  const desktopScale = Math.min(width / 1440, 1);
  const mobileScale = Math.min(width / 430, 1);
  const scale = isMobile ? mobileScale : desktopScale;

  const rf = (size: number) => size * scale;
  const rs = (size: number) => size * scale;

  // --- STATE ---
  const [logs, setLogs] = useState<EquipmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- DATE PICKER STATE ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // --- SELECTION & MODAL STATE ---
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // ---STATE FOR EXPORT ---
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");

  const closeStatusModal = () => {
    setStatusConfig((prev) => ({ ...prev, visible: false }));
  };

  // --- SORTING STATE ---
  const [sortColumn, setSortColumn] = useState<keyof EquipmentLog | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // --- DATA FETCHING ---
  const fetchLogs = async () => {
    setLoading(true);
    setLogs([]); // Wipes old data to prevent crashes

    let query = supabase
      .from("equipment_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (selectedDate) {
      // Format to YYYY-MM-DD safely avoiding timezone shifts
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      query = query.eq("date", formattedDate);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLogs(data);
      setSelectedLogs([]);
    } else if (error) {
      console.error("Error fetching logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDate]);

  // --- LIVE CLOCK FOR "IN USE" DURATIONS ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatName = (fullName: string) => {
    if (!fullName) return "Unknown";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const firstNameInitial = parts[0].charAt(0).toUpperCase();
    const lastName = parts.slice(1).join(" ");
    return `${firstNameInitial}. ${lastName}`;
  };

  const getLiveDuration = (startTimeString: string) => {
    const start = new Date(startTimeString).getTime();
    const current = currentTime.getTime();
    const diff = Math.max(0, current - start);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}H ${minutes}M`;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in use":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  // --- SELECTION LOGIC ---
  const allSelected = logs.length > 0 && selectedLogs.length === logs.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((log) => log.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedLogs.includes(id)) {
      setSelectedLogs((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedLogs((prev) => [...prev, id]);
    }
  };

  // --- SORTING LOGIC ---
  const handleSort = (column: keyof EquipmentLog) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedLogs = useMemo(() => {
    if (!sortColumn) return logs;

    return [...logs].sort((a, b) => {
      let valA = a[sortColumn] || "";
      let valB = b[sortColumn] || "";

      // String comparison
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [logs, sortColumn, sortDirection]);

  // Helper to render sortable headers
  const renderSortHeader = (
    label: string,
    column: keyof EquipmentLog,
    flex: number,
    align: "left" | "center" | "right",
    pr: number = 0,
  ) => {
    return (
      <TouchableOpacity
        onPress={() => handleSort(column)}
        style={{
          flex,
          flexDirection: "row",
          alignItems: "center",
          justifyContent:
            align === "center"
              ? "center"
              : align === "right"
                ? "flex-end"
                : "flex-start",
          paddingRight: pr,
        }}
      >
        <Text
          style={{ fontSize: rf(14) }}
          className="font-inter-bold text-textPrimary-light"
        >
          {label}
        </Text>
        {sortColumn === column && (
          <Feather
            name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
            size={rs(14)}
            color="#1d4ed8"
            style={{ marginLeft: rs(4) }}
          />
        )}
      </TouchableOpacity>
    );
  };

  // --- DELETE LOGIC ---
  const handleDeletePress = () => {
    if (selectedLogs.length === 0) {
      setStatusConfig({
        visible: true,
        title: "Error",
        message: "Please select at least one log to delete.",
      });
      return;
    }

    const hasActiveLog = selectedLogs.some((id) => {
      const log = logs.find((l) => l.id === id);
      return log?.status.toLowerCase() === "in use";
    });

    if (hasActiveLog) {
      setIsErrorModalVisible(true);
      return;
    }

    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("equipment_logs")
      .delete()
      .in("id", selectedLogs);

    setIsDeleting(false);
    setIsDeleteModalVisible(false);

    if (error) {
      console.error("Error deleting logs:", error);
      alert("Failed to delete logs. Please try again.");
    } else {
      fetchLogs();
    }
  };

  // --- EXPORT LOGIC ---
  const handleExportData = async (dateFrom: Date, dateTo: Date) => {
    try {
      setLoading(true);

      // 1. Format dates for Supabase query (YYYY-MM-DD)
      const from = dateFrom.toISOString().split("T")[0];
      const to = dateTo.toISOString().split("T")[0];

      // 2. Fetch data specifically for the range
      const { data, error } = await supabase
        .from("equipment_logs")
        .select("*")
        .gte("date", from)
        .lte("date", to)
        .order("created_at", { ascending: true });

      if (error || !data) throw new Error("Failed to fetch data for export");

      if (exportType === "excel") {
        await generateExcel(data);
      } else {
        await generatePDF(data);
      }
    } catch (error) {
      console.error(error);
      alert("Export failed");
    } finally {
      setLoading(false);
      setExportModalVisible(false);
    }
  };

  const generateExcel = async (data: EquipmentLog[]) => {
    // 1. Prepare the Header and Rows
    const header = [
      "User",
      "Equipment",
      "Model",
      "Date",
      "Time In",
      "Time Out",
      "Duration",
      "Status",
    ];
    const rows = data.map((log) => [
      formatName(log.full_name),
      log.equipment_name,
      log.model_name || "N/A",
      log.date,
      log.time_in,
      log.time_out || "N/A",
      log.duration || "In Use",
      log.status,
    ]);

    // 2. Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // 3. Add styling to the Header (Row 1)
    const range = XLSX.utils.decode_range(ws["!ref"]!!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"; // Targeting the first row
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } }, // Nice blue background
        alignment: { horizontal: "center" },
      };
    }

    // 4. Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usage Logs");

    const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const FS = FileSystem as any;

    const fileName = `Usage_History_${Date.now()}.xlsx`;
    const uri = (FS.cacheDirectory || FS.documentDirectory) + fileName;

    try {
      // Calling the function directly from the casted object
      await FS.writeAsStringAsync(uri, base64, {
        encoding: FS.EncodingType?.Base64 || "base64",
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Export Error:", error);
    }
  };

  const generatePDF = async (data: EquipmentLog[]) => {
    const htmlContent = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Usage History Report</h2>
          <table>
            <tr>
              <th>User</th><th>Equipment</th><th>Date</th><th>In</th><th>Out</th><th>Status</th>
            </tr>
            ${data
              .map(
                (log) => `
              <tr>
                <td>${log.full_name}</td>
                <td>${log.equipment_name}</td>
                <td>${log.date}</td>
                <td>${log.time_in}</td>
                <td>${log.time_out || "-"}</td>
                <td>${log.status}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: rs(32),
        minHeight: isMobile ? rs(450) : undefined,
      }}
      className="bg-white rounded-lg shadow-sm"
    >
      <ErrorDeleteModal
        visible={isErrorModalVisible}
        onClose={() => setIsErrorModalVisible(false)}
      />

      <DeleteLogsModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        itemCount={selectedLogs.length}
      />

      <UsageHistoryHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        initialDate={selectedDate}
        onSelect={(date) => setSelectedDate(date)}
      />

      <StatusModal
        visible={statusConfig.visible}
        title={statusConfig.title}
        message={statusConfig.message}
        onClose={closeStatusModal}
      />

      <ExportRangeModal
        visible={exportModalVisible}
        type={exportType}
        onClose={() => setExportModalVisible(false)}
        onConfirm={handleExportData}
      />

      <View
        style={{
          marginBottom: rs(16),
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            gap: rs(16),
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 1,
          }}
        >
          <SVG_ICONS.UsageHistory size={rs(64)} />
          <View style={{ gap: rs(6), flexShrink: 1 }}>
            <Text
              style={{ fontSize: rf(28) }}
              className="font-inter-bold text-textPrimary-light"
            >
              Usage History
            </Text>
            <Text
              style={{ fontSize: rf(16) }}
              className="font-inter text-textSecondary-light"
            >
              Check every equipment used
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
          <Feather name="help-circle" size={rs(24)} color="#1d4ed8" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-end mb-4 gap-2">
        {/* --- EXISTING CLEAR FILTER --- */}
        {selectedDate && (
          <TouchableOpacity
            style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
            className="bg-gray-500 rounded-md"
            onPress={() => setSelectedDate(null)}
          >
            <Text
              style={{ fontSize: rf(16) }}
              className="text-white font-inter-bold"
            >
              Clear Filter
            </Text>
          </TouchableOpacity>
        )}

        {/* --- EXISTING SELECT DATE --- */}
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-mainColor-light rounded-md"
          onPress={() => setIsDatePickerVisible(true)}
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            {selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}
          </Text>
        </TouchableOpacity>

        {/* --- NEW EXCEL BUTTON --- */}
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-green-600 rounded-md flex-row items-center"
          onPress={() => {
            setExportType("excel");
            setExportModalVisible(true);
          }}
        >
          <Feather
            name="file-text"
            size={rs(18)}
            color="white"
            style={{ marginRight: rs(6) }}
          />
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Excel
          </Text>
        </TouchableOpacity>

        {/* --- NEW PDF BUTTON --- */}
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className="bg-orange-600 rounded-md flex-row items-center"
          onPress={() => {
            setExportType("pdf");
            setExportModalVisible(true);
          }}
        >
          <Feather
            name="file"
            size={rs(18)}
            color="white"
            style={{ marginRight: rs(6) }}
          />
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            PDF
          </Text>
        </TouchableOpacity>

        {/* --- EXISTING DELETE BUTTON --- */}
        <TouchableOpacity
          style={{ paddingVertical: rs(10), paddingHorizontal: rs(16) }}
          className={`${selectedLogs.length > 0 ? "bg-red-600" : "bg-gray-400"} rounded-md`}
          onPress={handleDeletePress}
        >
          <Text
            style={{ fontSize: rf(16) }}
            className="text-white font-inter-bold"
          >
            Delete {selectedLogs.length > 0 ? `(${selectedLogs.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ padding: rs(32), overflow: "hidden" }}
        className="bg-white rounded-lg border-[2px] border-borderStrong-light"
      >
        {/* Table Header with Sorting */}
        <View
          style={{ paddingBottom: rs(8), marginBottom: rs(8) }}
          className="flex-row border-b border-[#6684B0] items-center"
        >
          <TouchableOpacity
            onPress={toggleSelectAll}
            style={{ flex: 0.3, alignItems: "center", marginRight: rs(8) }}
          >
            <Feather
              name={allSelected ? "check-square" : "square"}
              size={rs(20)}
              color={allSelected ? "#1d4ed8" : "gray"}
            />
          </TouchableOpacity>

          {renderSortHeader("User", "full_name", 1.5, "left")}
          {renderSortHeader("Equipment", "equipment_name", 1.5, "center")}
          {/* Sorting by 'created_at' yields the most accurate chronological sort for 'Time Used' */}
          {renderSortHeader("Time Used", "created_at", 1.5, "center")}
          {renderSortHeader("Duration", "duration", 1.2, "center")}
          {renderSortHeader("Remarks", "status", 1.2, "right", rs(16))}
        </View>

        <View style={{ height: rs(544), overflow: "hidden" }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: rs(16), flexGrow: 1 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#1d4ed8"
                style={{ marginTop: 20 }}
              />
            ) : sortedLogs.length === 0 ? (
              <Text className="text-center text-gray-500 font-inter mt-4">
                No usage history found.
              </Text>
            ) : (
              // MAP OVER sortedLogs INSTEAD OF logs
              sortedLogs.map((log, idx) => {
                const statusStyle = getStatusStyle(log.status);
                const isSelected = selectedLogs.includes(log.id);

                return (
                  <View
                    key={log.id}
                    style={{ paddingVertical: rs(12) }}
                    className={`flex-row items-center ${
                      idx !== sortedLogs.length - 1
                        ? "border-b border-[#DADFE5]"
                        : ""
                    } ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <TouchableOpacity
                      onPress={() => toggleSelectOne(log.id)}
                      style={{
                        flex: 0.3,
                        alignItems: "center",
                        marginRight: rs(8),
                      }}
                    >
                      <Feather
                        name={isSelected ? "check-square" : "square"}
                        size={rs(20)}
                        color={isSelected ? "#1d4ed8" : "gray"}
                      />
                    </TouchableOpacity>

                    <Text
                      style={{ fontSize: rf(14), flex: 1.5 }}
                      className="font-inter text-textPrimary-light"
                      numberOfLines={1}
                    >
                      {formatName(log.full_name)}
                    </Text>

                    <Text
                      style={{ fontSize: rf(14), flex: 1.5 }}
                      className="font-inter text-center text-textPrimary-light px-2"
                      numberOfLines={2}
                    >
                      {log.equipment_name}{" "}
                      {log.model_name ? `- ${log.model_name}` : ""}
                    </Text>

                    <Text
                      style={{ fontSize: rf(14), flex: 1.5 }}
                      className="font-inter text-center text-textPrimary-light"
                    >
                      {log.time_in} - {log.time_out || ""}
                    </Text>

                    <Text
                      style={{ fontSize: rf(14), flex: 1.2 }}
                      className="font-inter text-center text-textPrimary-light"
                    >
                      {log.status === "In Use"
                        ? getLiveDuration(log.created_at)
                        : log.duration || "-"}
                    </Text>

                    <View style={{ flex: 1.2, alignItems: "flex-end" }}>
                      <View
                        style={{
                          paddingVertical: rs(6),
                          paddingHorizontal: rs(12),
                        }}
                        className={`rounded-full ${statusStyle.bg}`}
                      >
                        <Text
                          style={{ fontSize: rf(12) }}
                          className={`font-inter-bold capitalize ${statusStyle.text}`}
                        >
                          {log.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
