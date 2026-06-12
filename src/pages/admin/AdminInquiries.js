"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/admin/AdminLayout"
import { MessageSquare, Phone, Mail, Clock, ChevronDown, Search } from "lucide-react"
import api from "../../services/api"
import { resolveImageUrl } from "../../utils/imageUrl"

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchInquiries()
  }, [pagination.page, statusFilter])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page)
      params.set("limit", pagination.limit)
      if (statusFilter) params.set("status", statusFilter)

      const response = await api.get(`/admin/inquiries?${params.toString()}`)
      setInquiries(response.data.data || [])
      setPagination((prev) => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await api.patch(`/admin/inquiries/${inquiryId}/status`, { status: newStatus })
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i)))
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredInquiries = inquiries.filter(
    (i) =>
      i.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.user_phone?.includes(searchQuery) ||
      i.property_title?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const statusColors = {
    new: { bg: "bg-blue-100", text: "text-blue-700" },
    contacted: { bg: "bg-amber-100", text: "text-amber-700" },
    closed: { bg: "bg-gray-100", text: "text-gray-600" },
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-600">Manage customer inquiries for your properties</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or property..."
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
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={resolveImageUrl(inquiry.property_image) || "/placeholder.svg?height=48&width=48&query=house"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {inquiry.user_name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {inquiry.builder_role}
                          </p>
                          <p className="text-sm text-gray-500">
                            {inquiry.builder_phone}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inquiry.status]?.bg} ${statusColors[inquiry.status]?.text}`}
                        >
                          {inquiry.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${inquiry.inquiry_type === "call"
                              ? "bg-emerald-100 text-emerald-700"
                              : inquiry.inquiry_type === "message"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {inquiry.inquiry_type === "callback_request" ? "Callback" : inquiry.inquiry_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{inquiry.property_title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {inquiry.user_phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${inquiry.user_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Call
                      </a>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === inquiry.id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === inquiry.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-gray-50 rounded-lg p-4 ml-16">
                      {inquiry.message && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-gray-600">{inquiry.message}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Update Status:</span>
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        <a
                          href={`https://wa.me/${inquiry.user_phone?.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Inquiries Found</h3>
            <p className="text-gray-500">
              {statusFilter
                ? "Try changing the filter to see more inquiries"
                : "You haven't received any inquiries yet"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} inquiries
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
      </div>
    </AdminLayout>
  )
}

export default AdminInquiries
