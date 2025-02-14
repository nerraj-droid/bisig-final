import JSZip from "jszip";
import { Chart } from "chart.js";

export function downloadChartAsImage(chartRef: { current: Chart | null }, filename: string) {
  if (chartRef.current) {
    const link = document.createElement("a");
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
    link.href = chartRef.current.canvas.toDataURL("image/png", 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function downloadAllCharts(chartRefs: { ref: { current: Chart | null }; name: string }[]) {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().split("T")[0];
  const folder = zip.folder(`charts-${timestamp}`);

  chartRefs.forEach(({ ref, name }) => {
    if (ref.current) {
      const imageData = ref.current.canvas.toDataURL("image/png", 1.0);
      const base64Data = imageData.split(",")[1];
      folder?.file(`${name}-${timestamp}.png`, base64Data, { base64: true });
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = `all-charts-${timestamp}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
