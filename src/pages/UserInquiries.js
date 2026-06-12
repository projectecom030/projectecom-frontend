"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Phone, Mail, Clock, ChevronDown, Search } from "lucide-react"
import api from "../services/api"
import { resolveImageUrl } from "../utils/imageUrl"

const UserInquiries = () => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchInquiries()
  }, [pagination.page, statusFilter, debouncedSearch])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page)
      params.set("limit", pagination.limit)
      if (statusFilter) params.set("status", statusFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)

      const response = await api.get(`/user/properties/inquiries?${params.toString()}`)
      setInquiries(response.data.data || [])
      setPagination((prev) => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error("Failed to fetch inquiries:", error)
    } finally {
      setLoading(false)
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

  const clearFilters = () => {
    setStatusFilter("")
    setSearchQuery("")
    setDebouncedSearch("")
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter)

  const statusColors = {
    new: { bg: "bg-blue-100", text: "text-blue-700" },
    contacted: { bg: "bg-amber-100", text: "text-amber-700" },
    closed: { bg: "bg-gray-100", text: "text-gray-600" },
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
        <p className="text-gray-600">View inquiries for your listed properties</p>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by property, name, or phone"
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
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
              <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : inquiries.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="transition-colors hover:bg-slate-50">
                <div className="cursor-pointer p-4" onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={resolveImageUrl(inquiry.property_image) || "/placeholder.svg?height=48&width=48&query=house"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{inquiry.user_name || "Guest User"}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[inquiry.status]?.bg || "bg-slate-100"} ${statusColors[inquiry.status]?.text || "text-slate-600"}`}
                        >
                          {inquiry.status}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            inquiry.inquiry_type === "call"
                              ? "bg-emerald-100 text-emerald-700"
                              : inquiry.inquiry_type === "message"
                                ? "bg-violet-100 text-violet-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {inquiry.inquiry_type === "callback_request" ? "Callback" : inquiry.inquiry_type}
                        </span>
                      </div>

                      <p className="truncate text-sm text-slate-600">{inquiry.property_title}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 md:text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inquiry.user_phone}
                        </div>
                        {inquiry.user_email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.user_email}
                          </div>
                        ) : null}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${inquiry.user_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Call
                      </a>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedId === inquiry.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>

                {expandedId === inquiry.id ? (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-0 rounded-lg bg-slate-50 p-4 md:ml-16">
                      {inquiry.message ? (
                        <div className="mb-4">
                          <p className="mb-1 text-sm font-medium text-slate-700">Message:</p>
                          <p className="text-sm text-slate-600 md:text-base">{inquiry.message}</p>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://wa.me/${inquiry.user_phone?.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No Inquiries Found</h3>
            <p className="text-slate-500">Try changing your search or filters</p>
          </div>
        )}

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
      </div>
    </div>
  )
}

export default UserInquiries
