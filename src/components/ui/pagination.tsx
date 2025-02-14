interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    const showEllipsis = totalPages > 7

    const getVisiblePages = () => {
        if (!showEllipsis) return pages

        if (currentPage <= 3) {
            return [...pages.slice(0, 5), '...', totalPages]
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', ...pages.slice(totalPages - 5)]
        }

        return [
            1,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages
        ]
    }

    return (
        <div className="flex items-center justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
                Previous
            </button>
            {getVisiblePages().map((page, i) => (
                <button
                    key={i}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === currentPage || page === '...'}
                    className={`rounded-md px-3 py-1 text-sm ${page === currentPage
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                                ? 'cursor-default'
                                : 'border hover:bg-gray-50'
                        }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
                Next
            </button>
        </div>
    )
} 