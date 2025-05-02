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
        min?: number
        max?: number
        count: number
    }[]
    compact?: boolean
}

export const AgeDistributionChart = forwardRef<HTMLDivElement, AgeDistributionProps>(function AgeDistributionChart(
    { ageGroups, compact = false },
    ref
) {
    const chartRef = useRef<any>(null)

    const hasData = ageGroups && ageGroups.length > 0 && ageGroups.some(g => g.count > 0);

    const handleChartDownload = () => {
        if (chartRef.current && chartRef.current.canvas) {
            downloadChartAsImage(chartRef.current, "age-distribution");
        } else {
            console.error("Age distribution chart reference is not available");
        }
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !compact,
                text: "Age Distribution",
                font: {
                    size: compact ? 12 : 14
                }
            },
            tooltip: {
                titleFont: {
                    size: compact ? 10 : 12
                },
                bodyFont: {
                    size: compact ? 9 : 11
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: !compact,
                    text: "Number of Residents",
                    font: {
                        size: compact ? 9 : 11
                    }
                },
                ticks: {
                    font: {
                        size: compact ? 8 : 10
                    }
                }
            },
            x: {
                title: {
                    display: !compact,
                    text: "Age Groups",
                    font: {
                        size: compact ? 9 : 11
                    }
                },
                ticks: {
                    font: {
                        size: compact ? 8 : 10
                    }
                }
            },
        },
    }

    const data = {
        labels: hasData ? ageGroups.map(g => g.range) : [],
        datasets: [
            {
                data: hasData ? ageGroups.map(g => g.count) : [],
                backgroundColor: "rgba(99, 102, 241, 0.5)", // indigo
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
            },
        ],
    }

    return (
        <div ref={ref} className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Age Distribution</h3>
                <button
                    onClick={handleChartDownload}
                    className="text-xs text-blue-600 hover:text-blue-500"
                    disabled={!hasData}
                >
                    Download Chart
                </button>
            </div>

            {hasData ? (
                <div className={`w-full ${compact ? 'h-52' : 'h-80'}`}>
                    <Bar
                        ref={chartRef}
                        data={data}
                        options={options}
                    />
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No age distribution data available to display
                </div>
            )}
        </div>
    )
}) 