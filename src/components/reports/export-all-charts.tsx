"use client"

import { useState } from "react"

interface ExportAllChartsProps {
    chartRefs: {
        ref: React.RefObject<HTMLDivElement>
        name: string
    }[]
}

export function ExportAllCharts({ chartRefs }: ExportAllChartsProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            for (const { ref, name } of chartRefs) {
                const canvas = ref.current?.querySelector('canvas')
                if (!canvas) continue

                const dataUrl = canvas.toDataURL('image/png')
                const link = document.createElement('a')
                link.download = `${name}.png`
                link.href = dataUrl
                link.click()
            }
        } catch (error) {
            console.error("Export error:", error)
            alert("Failed to export charts")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
            {loading ? "Exporting..." : "Export All Charts"}
        </button>
    )
} 