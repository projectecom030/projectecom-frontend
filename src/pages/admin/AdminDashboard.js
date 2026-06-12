"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import AdminLayout from "../../components/admin/AdminLayout"
import { Building, Home, MessageSquare, TrendingUp, Plus, ArrowRight, Clock } from "lucide-react"
import api from "../../services/api"
import { resolveImageUrl } from "../../utils/imageUrl"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalInquiries: 0,
    newInquiries: 0,
  })
  const [recentInquiries, setRecentInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, inquiriesRes] = await Promise.all([api.get("/admin/stats"), api.get("/admin/inquiries?limit=5")])
      setStats(statsRes.data.data)
      setRecentInquiries(inquiriesRes.data.data || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: Building,
      label: "Total Properties",
      value: stats.totalProperties,
      color: "blue",
      link: "/admin/properties",
    },
    {
      icon: Home,
      label: "Active Listings",
      value: stats.activeListings,
      color: "emerald",
      link: "/admin/properties",
    },
    {
      icon: MessageSquare,
      label: "Total Inquiries",
      value: stats.totalInquiries,
      color: "purple",
      link: "/admin/inquiries",
    },
    {
      icon: TrendingUp,
      label: "New Inquiries",
      value: stats.newInquiries,
      color: "amber",
      link: "/admin/inquiries?status=new",
    },
  ]

  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60))
        return `${diffMins} min ago`
      }
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    }
    return date.toLocaleDateString()
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your property overview.</p>
        </div>
        <Link
          to="/admin/properties/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4 lg:grid-cols-4 lg:gap-6 lg:mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group rounded-2xl border border-gray-200 bg-white p-3 transition-all hover:shadow-md sm:p-5 lg:p-6"
          >
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className={`h-10 w-10 rounded-xl ${colorClasses[stat.color].bg} flex items-center justify-center sm:h-12 sm:w-12`}>
                <stat.icon className={`h-5 w-5 ${colorClasses[stat.color].text} sm:h-6 sm:w-6`} />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
            </div>
            <div className="mb-1 text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
              {loading ? <div className="h-7 w-12 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-16" /> : stat.value}
            </div>
            <p className="text-sm font-medium text-gray-600 sm:text-base">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentInquiries.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={resolveImageUrl(inquiry.property_image) || "/placeholder.svg?height=40&width=40&query=house"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">{inquiry.user_name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inquiry.status === "new"
                            ? "bg-blue-100 text-blue-600"
                            : inquiry.status === "contacted"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{inquiry.property_title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(inquiry.created_at)}
                    </div>
                  </div>
                  <a
                    href={`tel:${inquiry.user_phone}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No inquiries yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
