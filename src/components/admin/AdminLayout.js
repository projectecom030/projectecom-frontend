"use client"

import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Building2, LayoutDashboard, Home, MessageSquare, Menu, X, ChevronRight, LogOut, User, Settings, CreditCard } from "lucide-react"
import { resolveImageUrl } from "../../utils/imageUrl"

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Home, label: "Properties", path: "/admin/properties" },
    { icon: MessageSquare, label: "Inquiries", path: "/admin/inquiries" },
    { icon: User, label: "User Management", path: "/admin/users" },
    { icon: CreditCard, label: "Payments", path: "/admin/payments" },
    { icon: Settings, label: "Profile", path: "/admin/profile" },
  ]

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin"
    }
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateFromMedia = () => {
      setSidebarOpen(mediaQuery.matches)
    }

    updateFromMedia()
    mediaQuery.addEventListener("change", updateFromMedia)

    return () => mediaQuery.removeEventListener("change", updateFromMedia)
  }, [])

  const handleNavClick = () => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(min-width: 1024px)").matches) return
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform ${sidebarOpen ? "translate-x-0 lg:translate-x-0" : "-translate-x-full lg:-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_6px_14px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">BudgetProperty</span>
            </Link>
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                onClick={handleNavClick}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/admin/profile"
              onClick={handleNavClick}
              className="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-blue-50"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={resolveImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">Super Admin</p>
                <p className="text-sm text-gray-500 truncate">{user?.fullName || user?.email || "Admin"}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-h-screen ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg mr-4"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find((item) => isActive(item.path))?.label || "Admin"}
          </h1>
          <div className="ml-auto">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              View Site <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
