"use client"

import { useRef, forwardRef } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { downloadChartAsImage } from "@/lib/chart-utils"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface StatisticsChartProps {
    householdsByBarangay: {
        barangay: string
        households: number
        residents: number
    }[]
}

export const StatisticsChart = forwardRef<HTMLDivElement, StatisticsChartProps>(
    function StatisticsChart({ householdsByBarangay }, ref) {
        const chartRef = useRef<any>(null)

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: "Households and Residents by Barangay",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        }

        const data = {
            labels: householdsByBarangay.map(b => b.barangay),
            datasets: [
                {
                    label: "Households",
                    data: householdsByBarangay.map(b => b.households),
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                },
                {
                    label: "Residents",
                    data: householdsByBarangay.map(b => b.residents),
                    backgroundColor: "rgba(16, 185, 129, 0.5)",
                },
            ],
        }

        return (
            <div ref={ref}>
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={() => downloadChartAsImage(chartRef, "households-by-barangay")}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Export Chart
                    </button>
                </div>
                <Bar ref={chartRef} options={options} data={data} />
            </div>
        )
    }
) 