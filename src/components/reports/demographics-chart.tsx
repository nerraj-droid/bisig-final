"use client"

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js"
import { Pie } from "react-chartjs-2"
import { useRef, forwardRef, useState, useEffect } from "react"
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
    compact?: boolean
}

export const DemographicsChart = forwardRef<HTMLDivElement, DemographicsChartProps>(function DemographicsChart(
    { genderDistribution, civilStatusDistribution, compact = false },
    ref
) {
    const chartRefGender = useRef<any>(null)
    const chartRefCivilStatus = useRef<any>(null)
    const [legendPosition, setLegendPosition] = useState<"right" | "bottom">("right")

    // Handle responsive legend position
    useEffect(() => {
        const handleResize = () => {
            // In compact mode, use bottom for legends when space is constrained
            const breakpoint = compact ? 1024 : 768
            setLegendPosition(window.innerWidth < breakpoint ? "bottom" : "right")
        }

        // Initial check
        handleResize()

        // Set up event listener
        window.addEventListener('resize', handleResize)

        // Clean up
        return () => window.removeEventListener('resize', handleResize)
    }, [compact])

    const formatGenderLabel = (gender: string) => {
        if (gender === "MALE") return "Male"
        if (gender === "FEMALE") return "Female"
        return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
    }

    const formatCivilStatusLabel = (status: string) => {
        if (status === "SINGLE") return "Single"
        if (status === "MARRIED") return "Married"
        if (status === "WIDOWED") return "Widowed"
        if (status === "DIVORCED") return "Divorced"
        if (status === "SEPARATED") return "Separated"
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    }

    const handleGenderChartDownload = () => {
        if (chartRefGender.current && chartRefGender.current.canvas) {
            downloadChartAsImage(chartRefGender.current, "gender-distribution");
        } else {
            console.error("Gender chart reference is not available");
        }
    }

    const handleCivilStatusChartDownload = () => {
        if (chartRefCivilStatus.current && chartRefCivilStatus.current.canvas) {
            downloadChartAsImage(chartRefCivilStatus.current, "civil-status-distribution");
        } else {
            console.error("Civil status chart reference is not available");
        }
    }

    const showGenderChart = genderDistribution && genderDistribution.length > 0
    const showCivilStatusChart = civilStatusDistribution && civilStatusDistribution.length > 0

    const genderData = {
        labels: showGenderChart ? genderDistribution.map(g => formatGenderLabel(g.gender)) : [],
        datasets: [
            {
                label: "Gender Distribution",
                data: showGenderChart ? genderDistribution.map(g => g.count) : [],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.6)", // blue for male
                    "rgba(255, 99, 132, 0.6)", // pink for female
                    "rgba(153, 102, 255, 0.6)", // purple for other
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    const civilStatusData = {
        labels: showCivilStatusChart ? civilStatusDistribution.map(cs => formatCivilStatusLabel(cs.civilStatus)) : [],
        datasets: [
            {
                label: "Civil Status Distribution",
                data: showCivilStatusChart ? civilStatusDistribution.map(cs => cs.count) : [],
                backgroundColor: [
                    "rgba(255, 206, 86, 0.6)", // yellow for single
                    "rgba(75, 192, 192, 0.6)", // green for married
                    "rgba(255, 159, 64, 0.6)", // orange for widowed
                    "rgba(255, 99, 132, 0.6)", // pink for divorced
                    "rgba(153, 102, 255, 0.6)", // purple for separated
                ],
                borderColor: [
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 10,
                bottom: 10
            }
        },
        plugins: {
            legend: {
                position: legendPosition,
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                titleFont: {
                    size: 12
                },
                bodyFont: {
                    size: 11
                },
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || ''
                        const value = context.raw || 0
                        const dataset = context.dataset
                        const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0)
                        const percentage = Math.round((value / total) * 100)
                        return `${label}: ${value} (${percentage}%)`
                    }
                }
            }
        }
    }

    return (
        <div ref={ref} className="space-y-6 w-full">
            {showGenderChart && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Gender Distribution</h3>
                        <button
                            onClick={handleGenderChartDownload}
                            className="text-xs text-blue-600 hover:text-blue-500"
                        >
                            Download Chart
                        </button>
                    </div>
                    <div className={`w-full ${compact ? 'h-60' : 'h-80'}`}>
                        <Pie
                            ref={chartRefGender}
                            data={genderData}
                            options={pieOptions}
                        />
                    </div>
                </div>
            )}

            {showCivilStatusChart && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Civil Status Distribution</h3>
                        <button
                            onClick={handleCivilStatusChartDownload}
                            className="text-xs text-blue-600 hover:text-blue-500"
                        >
                            Download Chart
                        </button>
                    </div>
                    <div className={`w-full ${compact ? 'h-60' : 'h-80'}`}>
                        <Pie
                            ref={chartRefCivilStatus}
                            data={civilStatusData}
                            options={pieOptions}
                        />
                    </div>
                </div>
            )}

            {!showGenderChart && !showCivilStatusChart && (
                <div className="text-center py-8 text-gray-500">
                    No demographic data available to display
                </div>
            )}
        </div>
    )
}) 