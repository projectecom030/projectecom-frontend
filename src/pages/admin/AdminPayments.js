"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatAmount = (value) => {
  const amount = toNumber(value)
  if (!amount) return "0"
  return amount.toLocaleString("en-IN")
}

const formatDate = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
}

const normalizePayments = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.payments)) return payload.payments
  return []
}

const getPaymentField = (payment, keys) => {
  for (const key of keys) {
    if (payment?.[key] !== undefined && payment?.[key] !== null) return payment[key]
  }
  return undefined
}

const getUserLabel = (payment) => {
  const user = payment?.user || payment?.customer || payment?.owner || {}
  return (
    getPaymentField(payment, ["user_name", "customer_name", "name", "full_name", "email"]) ||
    user?.name ||
    user?.full_name ||
    user?.email ||
    "—"
  )
}

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({ total: 0, thisMonth: 0, pending: 0 })
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    planId: "",
    role: "",
    userId: "",
    q: "",
  })

  const fetchPayments = useCallback(async (overrides = {}) => {
    try {
      setLoading(true)
      setError("")
      const params = {
        page: overrides.page ?? page,
        limit: overrides.limit ?? limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        planId: filters.planId || undefined,
        role: filters.role || undefined,
        userId: filters.userId || undefined,
        q: filters.q || undefined,
      }
      const response = await api.get("/admin/payments", { params })
      setPayments(normalizePayments(response.data))
      setTotalPages(response.data?.pagination?.totalPages || 1)
      setSummary(response.data?.summary || { total: 0, thisMonth: 0, pending: 0 })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.")
      setPayments([])
      setTotalPages(1)
      setSummary({ total: 0, thisMonth: 0, pending: 0 })
    } finally {
      setLoading(false)
    }
  }, [filters, limit, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = (event) => {
    event.preventDefault()
    setPage(1)
    fetchPayments({ page: 1 })
  }

  const resetFilters = () => {
    setFilters({ startDate: "", endDate: "", planId: "", role: "", userId: "", q: "" })
    setPage(1)
    fetchPayments({ page: 1 })
  }

  const handleExport = async () => {
    try {
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        planId: filters.planId || undefined,
        role: filters.role || undefined,
        userId: filters.userId || undefined,
        q: filters.q || undefined,
      }
      const response = await api.get("/admin/payments/export", {
        params,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = "payments.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export payments.")
    }
  }

  const stats = useMemo(() => {
    return {
      total: summary.total,
      pending: summary.pending,
      thisMonth: summary.thisMonth,
    }
  }, [summary])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">
            Review subscription and promotional service payments made on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Pending Reviews</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
          </div>
        </div>

        <form onSubmit={applyFilters} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Search</label>
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Payment ID, name, phone, plan..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Plan ID</label>
              <input
                type="number"
                name="planId"
                value={filters.planId}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="customer">Customer</option>
                <option value="dealer">Dealer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">User ID</label>
              <input
                type="number"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
            <div className="flex items-end ml-auto">
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Activity</h2>

          {loading && <p className="text-gray-600">Loading payments...</p>}
          {!loading && error && <p className="text-red-600">{error}</p>}

          {!loading && !error && payments.length === 0 && (
            <p className="text-gray-600">
              No payment records yet. Once payments are made, they will appear here for tracking and reconciliation.
            </p>
          )}

          {!loading && !error && payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3 pr-4">Payment ID</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Plan</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const id = getPaymentField(payment, ["payment_id", "id", "txn_id", "transaction_id"]) || index + 1
                    const plan =
                      getPaymentField(payment, ["plan_name", "plan", "subscription_plan", "service"]) || "—"
                    const amountRaw = getPaymentField(payment, [
                      "amount_rupees",
                      "amount",
                      "price",
                      "total",
                      "total_amount",
                      "amount_paise",
                    ])
                    const amount =
                      getPaymentField(payment, ["amount_rupees", "amount", "price", "total", "total_amount"]) ??
                      (getPaymentField(payment, ["amount_paise"]) ? toNumber(amountRaw) / 100 : 0)
                    const status =
                      getPaymentField(payment, ["status", "payment_status"]) || "paid"
                    const dateValue =
                      getPaymentField(payment, ["created_at", "createdAt", "date", "payment_date"]) || ""

                    return (
                      <tr key={id} className="border-b border-gray-100 text-gray-700">
                        <td className="py-3 pr-4 font-medium text-gray-900">{id}</td>
                        <td className="py-3 pr-4">
                          <div className="text-gray-900 font-medium">{getUserLabel(payment)}</div>
                          <div className="text-xs text-gray-500">
                            {getPaymentField(payment, ["user_phone", "phone"]) || "—"}
                          </div>
                        </td>
                        <td className="py-3 pr-4">{plan}</td>
                        <td className="py-3 pr-4">INR {formatAmount(amount)}</td>
                        <td className="py-3 pr-4 capitalize">{String(status).toLowerCase()}</td>
                        <td className="py-3 pr-4">{formatDate(dateValue)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && payments.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm text-gray-600">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value))
                    setPage(1)
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPayments
