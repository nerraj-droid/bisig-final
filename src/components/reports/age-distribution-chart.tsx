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
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Age Distribution",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Number of Residents",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Age Groups",
                },
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
        <div ref={ref} className="mb-4 flex justify-end">
            <button
                onClick={() => downloadChartAsImage(chartRef, "age-distribution")}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
            >
                Export Chart
            </button>
            <Bar ref={chartRef} options={options} data={data} />
        </div>
    )
}) 