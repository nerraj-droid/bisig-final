// import { useState, useCallback } from "react"
// import { FilterOptions } from "@/components/search/advanced-search"

// interface SearchResults {
//     residents: any[]
//     households: any[]
//     pagination?: {
//         totalResidents: number
//         totalHouseholds: number
//         pageSize: number
//         currentPage: number
//         totalPages: number
//     }
//     loading: boolean
//     error: string | null
// }

// interface CurrentSearch {
//     query: string
//     filters: FilterOptions
// }

// export function useSearch() {
//     const [results, setResults] = useState<SearchResults>({
//         residents: [],
//         households: [],
//         loading: false,
//         error: null,
//     })
//     const [currentSearch, setCurrentSearch] = useState<CurrentSearch>({
//         query: "",
//         filters: {},
//     })

//     const search = useCallback(async (query: string, filters: FilterOptions, page: number = 1) => {
//         setResults(prev => ({ ...prev, loading: true, error: null }))
//         setCurrentSearch({ query, filters })

//         try {
//             const params = new URLSearchParams({
//                 query,
//                 page: page.toString(),
//                 ...(filters.barangay && { barangay: filters.barangay }),
//                 ...(filters.gender && { gender: filters.gender }),
//                 ...(filters.civilStatus && { civilStatus: filters.civilStatus }),
//                 ...(filters.ageRange && { ageRange: filters.ageRange }),
//                 ...(filters.householdSize && { householdSize: filters.householdSize }),
//             })

//             const response = await fetch(`/api/search?${params}`)
//             if (!response.ok) {
//                 throw new Error("Search failed")
//             }

//             const data = await response.json()
//             setResults({
//                 residents: data.residents || [],
//                 households: data.households || [],
//                 pagination: data.pagination,
//                 loading: false,
//                 error: null,
//             })
//         } catch (error) {
//             console.error("Search error:", error)
//             setResults(prev => ({
//                 ...prev,
//                 loading: false,
//                 error: error instanceof Error ? error.message : "Failed to perform search",
//             }))
//         }
//     }, [])

//     return {
//         ...results,
//         search,
//         currentSearch,
//     }
// }