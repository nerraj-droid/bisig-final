import JSZip from "jszip";
import { Chart } from "chart.js";

export function downloadChartAsImage(chartRef: any, filename: string) {
  try {
    if (!chartRef) {
      console.error("Chart reference is null or undefined");
      return;
    }

    // Check if it's a React ref object or direct Chart instance
    let chart: Chart;
    if (chartRef.current) {
      chart = chartRef.current;
    } else if (chartRef instanceof Chart) {
      chart = chartRef;
    } else {
      console.error("Invalid chart reference format", chartRef);
      return;
    }

    // Ensure we have access to the canvas
    if (!chart.canvas) {
      console.error("Chart canvas is not available", chart);
      return;
    }

    const link = document.createElement("a");
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
    link.href = chart.canvas.toDataURL("image/png", 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Chart downloaded: ${filename}`);
  } catch (error) {
    console.error("Error downloading chart:", error);
  }
}

export async function downloadAllCharts(chartRefs: { ref: { current: Chart | null }; name: string }[]) {
  try {
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
    console.log("All charts downloaded as a zip file");
  } catch (error) {
    console.error("Error downloading all charts:", error);
  }
}
