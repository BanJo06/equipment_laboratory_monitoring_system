import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const downloadPDF = async (
  data: any[],
  formatName: (n: string) => string,
) => {
  const htmlContent = `
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Usage History Report</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #1d4ed8; color: white;">
            <th>User</th><th>Equipment</th><th>Date</th><th>Status</th>
          </tr>
          ${data
            .map(
              (log) => `
            <tr>
              <td>${formatName(log.full_name)}</td>
              <td>${log.equipment_name}</td>
              <td>${log.date}</td>
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
