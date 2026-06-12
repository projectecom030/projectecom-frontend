"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import AdminLayout from "../../components/admin/AdminLayout"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, EyeOff, Building, MapPin, MessageSquare, Phone } from "lucide-react"
import api from "../../services/api"
import { resolveImageUrl } from "../../utils/imageUrl"

const AdminProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [pagination.page, statusFilter])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page)
      params.set("limit", pagination.limit)
      if (statusFilter) params.set("status", statusFilter)

      const response = await api.get(`/admin/properties?${params.toString()}`)
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
      await api.patch(`/admin/properties/${id}/visibility`, { isVisible: !currentVisibility })
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_visible: !currentVisibility } : p)))
    } catch (error) {
      console.error("Failed to toggle visibility:", error)
    }
    setOpenMenu(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return

    try {
      await api.delete(`/admin/properties/${id}`)
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete property:", error)
    }
    setOpenMenu(null)
  }

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`
    }
    return `₹${price?.toLocaleString()}`
  }

  const filteredProperties = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link
          to="/admin/properties/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="under_construction">Under Construction</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Property</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Inquiries</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Views</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contacts</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Visibility</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={resolveImageUrl(property.primary_image) || "/placeholder.svg?height=48&width=64&query=house"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{property.title}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <p className="font-semibold capitalize text-gray-900">
                            {property.builder_role || "-"}
                          </p>
                          <p className="text-gray-700">
                            {property.builder_name || ""}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {property.builder_phone || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(property.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${property.status === "available"
                            ? "bg-emerald-100 text-emerald-700"
                            : property.status === "sold"
                              ? "bg-blue-100 text-blue-700"
                              : property.status === "rented"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {property.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          {property.inquiry_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-4 h-4" />
                          {property.view_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {property.contact_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${property.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {property.is_visible ? (
                            <>
                              <Eye className="w-3 h-3" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Hidden
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === property.id ? null : property.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {openMenu === property.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <Link
                                  to={`/admin/properties/${property.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleVisibility(property.id, property.is_visible)}
                                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  {property.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  {property.is_visible ? "Hide" : "Show"}
                                </button>
                                <button
                                  onClick={() => handleDelete(property.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first property listing</p>
            <Link
              to="/admin/properties/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminProperties
