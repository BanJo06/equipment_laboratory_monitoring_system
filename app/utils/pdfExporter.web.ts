// components/utils/pdfExporter.web.ts

export const downloadPDF = async (
  data: any[],
  formatName: (n: string) => string,
) => {
  // 1. ENSURE SCRIPTS ARE LOADED
  if (!(window as any).jspdf) {
    const loadScript = (url: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    try {
      // Load main library
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      );
      // Load AutoTable plugin
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js",
      );
    } catch (err) {
      alert(
        "Failed to load PDF libraries. Please check your internet connection.",
      );
      return;
    }
  }

  // 2. ACCESS THE CORRECT CONSTRUCTOR
  // In the CDN (UMD) version, the class is nested: window.jspdf.jsPDF
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();

  // --- DEBUGGING: TEST TEXT ---
  // If you see this text but no table, the data mapping is the problem.
  doc.setFont("helvetica", "bold");
  doc.text("Equipment Usage History", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  // 3. PREPARE DATA
  const tableRows = data.map((log) => [
    log.full_name || "N/A",
    log.equipment_name || "N/A",
    log.model_name || "-",
    log.date || "-",
    log.time_in || "-",
    log.time_out || "-",
    log.status || "-",
  ]);

  // 4. CALL AUTOTABLE
  // When using CDN, sometimes doc.autoTable isn't patched.
  // We check window.jspdf.jsPDF.autoTable or call it directly.
  const autoTable =
    (window as any).jspdf.jsPDF.autoTable || (doc as any).autoTable;

  if (typeof autoTable === "function") {
    (doc as any).autoTable({
      startY: 30,
      head: [["User", "Equipment", "Model", "Date", "In", "Out", "Status"]],
      body: tableRows,
      headStyles: { fillColor: [29, 78, 216] }, // Your blue theme
      styles: { fontSize: 8 },
    });
  } else {
    // Fallback if plugin failed to load
    doc.text("Error: Table plugin not loaded.", 14, 40);
    console.error("autoTable plugin not found on doc or jsPDF global");
  }

  // 5. SAVE
  doc.save(`Usage_History_${Date.now()}.pdf`);
};
