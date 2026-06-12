"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  Crown,
  Building2,
  Menu,
  X,
  User,
  LogOut,
  Lock,
  LayoutDashboard,
  Info,
  Phone,
  ShieldCheck,
  FileText,
  RotateCcw,
  Home,
  Search,
  Tag,
  KeyRound,
  Heart,
} from "lucide-react"
import { resolveImageUrl } from "../../utils/imageUrl"

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToTopInstant = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const handlePostProperty = () => {
    if (isAuthenticated) {
      navigate("/user/properties")
    } else {
      navigate("/login")
    }
    scrollToTopInstant()
  }

  const handleMobileAuthNav = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
    scrollToTopInstant()
  }

  const handleMobileMenuLink = (item) => {
    setMobileMenuOpen(false)
    if (item.action) {
      item.action()
    } else if (item.to) {
      navigate(item.to)
      scrollToTopInstant()
    }
  }

  const handleMobileBottomNav = (path) => {
    navigate(path)
    scrollToTopInstant()
  }

  const profilePath = isAdmin ? "/admin/profile" : "/profile"
  const displayName = user?.full_name || user?.fullName || user?.name || user?.email || "Account"

  const mobileBottomLinks = [
    { to: "/", label: "Home", Icon: Home, active: location.pathname === "/" },
    {
      to: "/properties",
      label: "Properties",
      Icon: Search,
      active: location.pathname.startsWith("/properties") && !location.search,
    },
    {
      to: "/properties?listingType=sale",
      label: "Buy",
      Icon: Tag,
      active: location.pathname.startsWith("/properties") && location.search.includes("listingType=sale"),
    },
    {
      to: "/properties?listingType=rent",
      label: "Rent",
      Icon: KeyRound,
      active: location.pathname.startsWith("/properties") && location.search.includes("listingType=rent"),
    },
  ]

  const mobileMenuLinks = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/properties", label: "Properties", Icon: Search },
    { to: "/properties?listingType=sale", label: "Buy", Icon: Tag },
    { to: "/properties?listingType=rent", label: "Rent", Icon: KeyRound },
    { to: "/user/properties", label: "Post your property", Icon: Building2, action: handlePostProperty },
    { to: "/wishlist", label: "Wishlist", Icon: Heart },
    { to: "/about", label: "About Us", Icon: Info },
    { to: "/contact", label: "Contact Us", Icon: Phone },
    { to: "/privacy-policy", label: "Privacy Policy", Icon: ShieldCheck },
    { to: "/terms", label: "Terms & Conditions", Icon: FileText },
    { to: "/refund-policy", label: "Refund Policy", Icon: RotateCcw },
  ]
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Desktop Top Navbar */}
      <div className="hidden md:block">
        <div className="container h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_8px_18px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">BudgetProperty</span>
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link
              to="/"
              className={`transition-colors hover:text-blue-600 ${location.pathname === "/" ? "text-blue-600" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`transition-colors hover:text-blue-600 ${
                location.pathname.startsWith("/properties") && !location.search ? "text-blue-600" : ""
              }`}
            >
              Properties
            </Link>
            <Link
              to="/properties?listingType=sale"
              className={`transition-colors hover:text-blue-600 ${
                location.pathname.startsWith("/properties") && location.search.includes("listingType=sale")
                  ? "text-blue-600"
                  : ""
              }`}
            >
              Buy
            </Link>
            <Link
              to="/properties?listingType=rent"
              className={`transition-colors hover:text-blue-600 ${
                location.pathname.startsWith("/properties") && location.search.includes("listingType=rent")
                  ? "text-blue-600"
                  : ""
              }`}
            >
              Rent
            </Link>
            <Link
              onClick={handlePostProperty}
              to="/user/properties"
              className="transition-colors hover:text-blue-600"
            >
              Post your property
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/subscription"
              className="relative group flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-black 
               bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 
               shadow-lg hover:shadow-xl transition-all duration-300 
               hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Premium
              </span>
              <span className="absolute top-0 left-[-100%] w-full h-full bg-white/30 skew-x-[-20deg] group-hover:left-[120%] transition-all duration-700" />
            </Link>

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setDesktopMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                aria-label="Open menu"
                aria-haspopup="menu"
                aria-expanded={desktopMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </button>

              {desktopMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-2"
                  onMouseLeave={() => setDesktopMenuOpen(false)}
                >
                  {isAuthenticated && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {user?.profileImage ? (
                            <img
                              src={resolveImageUrl(user.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    to="/wishlist"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <Info className="w-4 h-4" />
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <Phone className="w-4 h-4" />
                    Contact Us
                  </Link>
                  <Link
                    to="/privacy-policy"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    Terms & Conditions
                  </Link>
                  <Link
                    to="/refund-policy"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDesktopMenuOpen(false)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refund Policy
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <Link
                        to={profilePath}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDesktopMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setDesktopMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container md:hidden">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_8px_18px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BudgetProperty</span>
          </Link>

          {/* Mobile: Upgrade outside menu + menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/subscription"
              className="px-1.5 py-0.5 rounded-md text-[10px] leading-4 font-semibold text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 shadow inline-flex items-center gap-1 sm:px-2 sm:text-[11px]"
            >
              <Crown className="w-3 h-3" />
              Upgrade
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-[min(86vw,320px)] bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_8px_18px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">BudgetProperty</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-2 overflow-y-auto flex-1 pb-6">
                {mobileMenuLinks.map((item) => {
                  const Icon = item.Icon
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="group relative overflow-hidden flex items-center gap-3 px-4 py-2.5 text-gray-800 font-medium border border-gray-200 rounded-xl bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                      onClick={(event) => {
                        event.preventDefault()
                        handleMobileMenuLink(item)
                      }}
                    >
                      <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="px-4 pb-20 pt-4 space-y-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={profilePath}
                      className="group relative overflow-hidden flex items-center gap-2 px-4 py-2.5 text-gray-800 font-medium border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-blue-50/60 hover:text-blue-700"
                      onClick={(event) => {
                        event.preventDefault()
                        handleMobileAuthNav(profilePath)
                      }}
                    >
                      <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="group relative overflow-hidden flex items-center gap-2 px-4 py-2.5 text-gray-800 font-medium border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-blue-50/60 hover:text-blue-700"
                        onClick={(event) => {
                          event.preventDefault()
                          handleMobileAuthNav("/admin")
                        }}
                      >
                        <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="group relative overflow-hidden w-full flex items-center gap-2 px-4 py-2.5 text-gray-800 font-medium border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-blue-50/60 hover:text-blue-700 text-left"
                    >
                      <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                      <Lock className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-800 font-semibold border border-gray-200 rounded-xl bg-white shadow-sm hover:bg-blue-50/60 hover:text-blue-700"
                      onClick={(event) => {
                        event.preventDefault()
                        handleMobileAuthNav("/login")
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg"
                      onClick={(event) => {
                        event.preventDefault()
                        handleMobileAuthNav("/register")
                      }}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5">
          {mobileBottomLinks.slice(0, 2).map(({ to, label, Icon, active }) => (
            <Link
              key={label}
              to={to}
              onClick={(event) => {
                event.preventDefault()
                handleMobileBottomNav(to)
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}

          <button
            onClick={handlePostProperty}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              location.pathname.startsWith("/user/properties")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2F8EE5]">
              <span className="absolute h-1 w-4 rounded-full bg-white" />
              <span className="absolute h-4 w-1 rounded-full bg-white" />
            </span>
            <span>Post</span>
          </button>

          {mobileBottomLinks.slice(2).map(({ to, label, Icon, active }) => (
            <Link
              key={label}
              to={to}
              onClick={(event) => {
                event.preventDefault()
                handleMobileBottomNav(to)
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </nav>
  )
}

export default Navbar
