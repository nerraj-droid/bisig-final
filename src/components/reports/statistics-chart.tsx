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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top" as const,
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: "Households and Residents by Barangay",
                    font: {
                        size: 14
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 12
                    },
                    bodyFont: {
                        size: 11
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 30
                    }
                }
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
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-medium">Households by Barangay</h3>
                    <button
                        onClick={() => downloadChartAsImage(chartRef, "households-by-barangay")}
                        className="rounded-md bg-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Export Chart
                    </button>
                </div>
                <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                    <Bar ref={chartRef} options={options} data={data} />
                </div>
            </div>
        )
    }
) 