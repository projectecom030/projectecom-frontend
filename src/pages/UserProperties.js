"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Building,
  MapPin,
  MessageSquare,
} from "lucide-react"
import api from "../services/api"
import { resolveImageUrl } from "../utils/imageUrl"

const UserProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [openMenu, setOpenMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchProperties()
  }, [pagination.page, statusFilter, debouncedSearch])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page)
      params.set("limit", pagination.limit)
      if (statusFilter) params.set("status", statusFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)

      const response = await api.get(`/user/properties?${params.toString()}`)
      setProperties(response.data.data || [])
      setPagination((prev) => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error("Failed to fetch properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      await api.patch(`/user/properties/${id}/visibility`, { isVisible: !currentVisibility })
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_visible: !currentVisibility } : p)))
    } catch (error) {
      console.error("Failed to toggle visibility:", error)
    }
    setOpenMenu(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return

    try {
      await api.delete(`/user/properties/${id}`)
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete property:", error)
    }
    setOpenMenu(null)
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `Rs ${(price / 10000000).toFixed(2)} Cr`
    if (price >= 100000) return `Rs ${(price / 100000).toFixed(2)} L`
    return `Rs ${price?.toLocaleString()}`
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDebouncedSearch("")
    setStatusFilter("")
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter)

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <Link
            to="/user/properties/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, city, or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-56"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="under_construction">Under Construction</option>
            </select>
          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters} className="whitespace-nowrap text-sm font-medium text-blue-600">
              Clear All
            </button>
          ) : null}
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="divide-y divide-slate-200 md:hidden">
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={resolveImageUrl(property.primary_image) || "/placeholder.svg?height=64&width=96&query=house"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{property.title}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {property.city}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                          {formatPrice(property.price)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 font-medium capitalize ${
                            property.status === "available"
                              ? "bg-emerald-100 text-emerald-700"
                              : property.status === "sold"
                                ? "bg-blue-100 text-blue-700"
                                : property.status === "rented"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {property.status?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <div className="flex flex-wrap items-center gap-3 text-slate-600">
                      <span>Inquiries: {property.inquiry_count || 0}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {property.view_count || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {property.contact_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/user/properties/${property.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleVisibility(property.id, property.is_visible)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                      >
                        {property.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {property.is_visible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Property</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Inquiries</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Contacts</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500">Visibility</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <img
                              src={resolveImageUrl(property.primary_image) || "/placeholder.svg?height=48&width=64&query=house"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="max-w-xs truncate font-medium text-slate-900">{property.title}</p>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
                            property.status === "available"
                              ? "bg-emerald-100 text-emerald-700"
                              : property.status === "sold"
                                ? "bg-blue-100 text-blue-700"
                                : property.status === "rented"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {property.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MessageSquare className="h-4 w-4" />
                          {property.inquiry_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Eye className="h-4 w-4" />
                          {property.view_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="h-4 w-4" />
                          {property.contact_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            property.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {property.is_visible ? (
                            <>
                              <Eye className="h-3 w-3" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" /> Hidden
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuPosition({ top: rect.bottom, left: rect.right })
                              setOpenMenu(openMenu === property.id ? null : property.id)
                            }}
                            className="rounded-lg p-2 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-5 w-5 text-slate-500" />
                          </button>

                          {openMenu === property.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                              <div
                                className="fixed z-50 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                                style={{ top: menuPosition.top + 4, left: menuPosition.left - 192 }}
                              >
                                <Link
                                  to={`/user/properties/${property.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleVisibility(property.id, property.is_visible)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-100"
                                >
                                  {property.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {property.is_visible ? "Hide" : "Show"}
                                </button>
                                <button
                                  onClick={() => handleDelete(property.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <p className="text-sm text-slate-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Building className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No Properties Found</h3>
            <p className="mb-6 text-slate-500">Try changing your search or filters</p>
            <Link
              to="/user/properties/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Property
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProperties
