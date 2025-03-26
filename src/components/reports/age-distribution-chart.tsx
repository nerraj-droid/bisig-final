"use client"

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
import { useRef, forwardRef } from "react"
import { downloadChartAsImage } from "@/lib/chart-utils"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface AgeDistributionProps {
    ageGroups: {
        range: string
        count: number
    }[]
}

export const AgeDistributionChart = forwardRef<HTMLDivElement, AgeDistributionProps>(function AgeDistributionChart({ ageGroups }, ref) {
    const chartRef = useRef<any>(null)

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Age Distribution",
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
                title: {
                    display: true,
                    text: "Number of Residents",
                    font: {
                        size: 11
                    }
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: "Age Groups",
                    font: {
                        size: 11
                    }
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
        },
    }

    const data = {
        labels: ageGroups.map(g => g.range),
        datasets: [
            {
                data: ageGroups.map(g => g.count),
                backgroundColor: "rgba(99, 102, 241, 0.5)", // indigo
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
            },
        ],
    }

    return (
        <div ref={ref}>
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-medium">Age Distribution</h3>
                <button
                    onClick={() => downloadChartAsImage(chartRef, "age-distribution")}
                    className="rounded-md bg-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-500"
                >
                    Export Chart
                </button>
            </div>
            <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <Bar ref={chartRef} options={options} data={data} />
            </div>
        </div>
    )
}) 