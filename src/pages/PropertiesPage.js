"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Building, ChevronLeft, ChevronRight } from "lucide-react"
import PropertyCard from "../components/property/PropertyCard"
import PropertyFilter from "../components/property/PropertyFilter"
import api from "../services/api"
import { parseSearchKeywords } from "../utils/searchKeywords"
import Seo from "../components/Seo"

const buildPropertiesSeo = (filters, total) => {
  const labels = []

  if (filters.listingType === "sale") labels.push("Properties for Sale")
  else if (filters.listingType === "rent") labels.push("Properties for Rent")
  else labels.push("Properties")

  if (filters.type) labels.push(filters.type)
  if (filters.city) labels.push(`in ${filters.city}`)

  const title = labels.join(" ")
  const descriptionParts = [
    total ? `${total} listings available` : "Browse verified real estate listings",
    filters.city ? `in ${filters.city}` : "across top cities",
    filters.type ? `including ${filters.type}` : "",
  ].filter(Boolean)

  const canonicalParams = new URLSearchParams()
  ;["listingType", "type", "city", "bedrooms", "minPrice", "maxPrice", "pincode", "search"].forEach((key) => {
    if (filters[key]) canonicalParams.set(key, filters[key])
  })

  const canonicalPath = canonicalParams.toString()
    ? `/properties?${canonicalParams.toString()}`
    : "/properties"

  return {
    title,
    description: `${descriptionParts.join(" ")} on BudgetProperty.`,
    canonicalPath,
  }
}

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    listingType: searchParams.get("listingType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    pincode: searchParams.get("pincode") || "",
  })

  useEffect(() => {
    fetchProperties()
  }, [filters, pagination.page])

  useEffect(() => {
    const handleEngagementUpdate = (event) => {
      const propertyId = Number(event.detail?.propertyId)
      if (!propertyId) return

      setProperties((prev) =>
        prev.map((property) =>
          Number(property.id) === propertyId
            ? {
                ...property,
                view_count: Number(event.detail?.view_count ?? property.view_count ?? 0),
                contact_count: Number(event.detail?.contact_count ?? property.contact_count ?? 0),
              }
            : property,
        ),
      )
    }

    window.addEventListener("property-engagement-updated", handleEngagementUpdate)
    return () => window.removeEventListener("property-engagement-updated", handleEngagementUpdate)
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await api.get(`/properties?${params.toString()}`)
      setProperties(response.data.data || [])
      setPagination((prev) => ({
        ...prev,
        ...response.data.pagination,
      }))
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    const parsed = parseSearchKeywords(newFilters.search || "")
    const updatedFilters = {
      ...newFilters,
      search: parsed.search,
      city: newFilters.city || parsed.city || "",
      type: newFilters.type || parsed.type || "",
      bedrooms: newFilters.bedrooms || parsed.bedrooms || "",
    }

    setFilters(updatedFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const seo = buildPropertiesSeo(filters, pagination.total)

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seo.title}
        description={seo.description}
        canonicalPath={seo.canonicalPath}
        type="website"
      />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {filters.listingType === "sale"
              ? "Properties for Sale"
              : filters.listingType === "rent"
                ? "Properties for Rent"
                : "All Properties"}
          </h1>
          <p className="text-gray-600">{pagination.total} properties found</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="mb-8">
          <PropertyFilter filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = pagination.page
                    return page === 1 || page === pagination.totalPages || (page >= current - 1 && page <= current + 1)
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          page === pagination.page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={() =>
                handleFilterChange({
                  search: "",
                  city: "",
                  type: "",
                  listingType: "",
                  minPrice: "",
                  maxPrice: "",
                  bedrooms: "",
                  pincode: "",
                })
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertiesPage
