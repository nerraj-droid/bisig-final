"use client"

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js"
import { Pie } from "react-chartjs-2"
import { useRef, forwardRef } from "react"
import { downloadChartAsImage } from "@/lib/chart-utils"

ChartJS.register(ArcElement, Tooltip, Legend)

interface DemographicsChartProps {
    genderDistribution: {
        gender: string
        count: number
    }[]
    civilStatusDistribution: {
        civilStatus: string
        count: number
    }[]
}

export const DemographicsChart = forwardRef<HTMLDivElement, DemographicsChartProps>(function DemographicsChart({ genderDistribution, civilStatusDistribution }, ref) {
    const genderChartRef = useRef<any>(null)
    const civilStatusChartRef = useRef<any>(null)

    const genderData = {
        labels: genderDistribution.map(d => d.gender),
        datasets: [
            {
                data: genderDistribution.map(d => d.count),
                backgroundColor: [
                    "rgba(59, 130, 246, 0.5)", // blue
                    "rgba(236, 72, 153, 0.5)", // pink
                ],
                borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(236, 72, 153, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    const civilStatusData = {
        labels: civilStatusDistribution.map(d => d.civilStatus),
        datasets: [
            {
                data: civilStatusDistribution.map(d => d.count),
                backgroundColor: [
                    "rgba(16, 185, 129, 0.5)", // green
                    "rgba(245, 158, 11, 0.5)", // yellow
                    "rgba(99, 102, 241, 0.5)", // indigo
                    "rgba(239, 68, 68, 0.5)",  // red
                ],
                borderColor: [
                    "rgba(16, 185, 129, 1)",
                    "rgba(245, 158, 11, 1)",
                    "rgba(99, 102, 241, 1)",
                    "rgba(239, 68, 68, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            animateRotate: true,
            animateScale: true,
        },
        plugins: {
            legend: {
                position: 'right' as const,
                align: 'center' as const,
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    font: {
                        size: 10,
                    },
                    boxWidth: 8,
                },
                display: window.innerWidth > 500, // Hide legend on very small screens
            },
            tooltip: {
                titleFont: {
                    size: 12,
                },
                bodyFont: {
                    size: 11,
                },
            },
        },
        cutout: '45%',
        radius: '85%',
    }

    // Specific options for mobile
    const mobileOptions = {
        ...options,
        plugins: {
            ...options.plugins,
            legend: {
                ...options.plugins.legend,
                position: 'bottom' as const,
            }
        }
    }

    // Use the appropriate options based on screen width
    const chartOptions = window.innerWidth < 768 ? mobileOptions : options;

    return (
        <div ref={ref} className="grid gap-8 grid-cols-1 md:grid-cols-2">
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-medium">Gender Distribution</h3>
                    <button
                        onClick={() => downloadChartAsImage(genderChartRef, "gender-distribution")}
                        className="rounded-md bg-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Export Chart
                    </button>
                </div>
                <div className="h-[200px] sm:h-[220px] md:h-[220px]">
                    <Pie ref={genderChartRef} data={genderData} options={chartOptions} />
                </div>
            </div>
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-medium">Civil Status Distribution</h3>
                    <button
                        onClick={() => downloadChartAsImage(civilStatusChartRef, "civil-status-distribution")}
                        className="rounded-md bg-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Export Chart
                    </button>
                </div>
                <div className="h-[200px] sm:h-[220px] md:h-[220px]">
                    <Pie ref={civilStatusChartRef} data={civilStatusData} options={chartOptions} />
                </div>
            </div>
        </div>
    )
}) 