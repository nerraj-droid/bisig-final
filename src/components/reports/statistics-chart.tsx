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
    compact?: boolean
}

export const StatisticsChart = forwardRef<HTMLDivElement, StatisticsChartProps>(function StatisticsChart(
    { householdsByBarangay, compact = false },
    ref
) {
    const chartRef = useRef<any>(null)

    const hasData = householdsByBarangay && householdsByBarangay.length > 0;

    const handleChartDownload = () => {
        if (chartRef.current && chartRef.current.canvas) {
            downloadChartAsImage(chartRef.current, "barangay-statistics");
        } else {
            console.error("Barangay chart reference is not available");
        }
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: compact ? 9 : 11
                    },
                    boxWidth: compact ? 12 : 15,
                    padding: compact ? 10 : 15
                }
            },
            title: {
                display: !compact,
                text: 'Households and Residents by Barangay',
                font: {
                    size: 14
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
                    text: 'Count',
                    font: {
                        size: 11
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
                    text: 'Barangay',
                    font: {
                        size: 11
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
        labels: hasData ? householdsByBarangay.map(b => b.barangay) : [],
        datasets: [
            {
                label: 'Households',
                data: hasData ? householdsByBarangay.map(b => b.households) : [],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderColor: 'rgba(53, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Residents',
                data: hasData ? householdsByBarangay.map(b => b.residents) : [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    }

    return (
        <div ref={ref} className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-medium">Barangay Statistics</h3>
                <button
                    onClick={handleChartDownload}
                    className="text-xs text-blue-600 hover:text-blue-500"
                    disabled={!hasData}
                >
                    Download Chart
                </button>
            </div>

            {hasData ? (
                <div className="flex-1 min-h-0 w-full">
                    <Bar
                        ref={chartRef}
                        options={options}
                        data={data}
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    No barangay data available to display
                </div>
            )}
        </div>
    )
}) 