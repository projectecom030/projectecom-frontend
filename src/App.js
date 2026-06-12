import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import HomePage from "./pages/HomePage"
import PropertiesPage from "./pages/PropertiesPage"
import PropertyDetailPage from "./pages/PropertyDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProperties from "./pages/admin/AdminProperties"
import AdminPropertyForm from "./pages/admin/AdminPropertyForm"
import AdminInquiries from "./pages/admin/AdminInquiries"
import AdminProfilePage from "./pages/admin/AdminProfilePage"
import AdminPayments from "./pages/admin/AdminPayments"
import UserProperties from "./pages/UserProperties"
import UserPropertyForm from "./pages/UserPropertyForm"
import UserInquiries from "./pages/UserInquiries"
import UserProfilePage from "./pages/UserProfilePage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import SubscriptionPage from "./pages/SubscriptionPage"
import { useLocation } from "react-router-dom"
import AdminUsermanagement from "./pages/admin/AdminUsermanagement"
import WishlistPage from "./pages/Wishlistpage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"
import TermsPage from "./pages/TermsPage"
import RefundPolicyPage from "./pages/RefundPolicyPage"
import ChatWidget from "./components/ChatWidget"
import PurposePrompt from "./components/common/PurposePrompt"
import Seo from "./components/Seo"

const seoByPath = {
  "/login": {
    title: "Login",
    description: "Sign in to BudgetProperty to manage listings and property inquiries.",
    robots: "noindex,nofollow",
  },
  "/register": {
    title: "Register",
    description: "Create your BudgetProperty account to list and manage properties online.",
    robots: "noindex,nofollow",
  },
  "/subscription": {
    title: "Subscription Plans",
    description: "Compare BudgetProperty subscription plans for buyers and property promotion.",
    robots: "noindex,nofollow",
  },
  "/wishlist": {
    title: "Wishlist",
    description: "Your saved properties on BudgetProperty.",
    robots: "noindex,nofollow",
  },
  "/about": {
    title: "About Us",
    description: "Learn about BudgetProperty and how we help people discover properties with confidence.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Contact BudgetProperty for support, listing help, and property-related questions.",
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description: "Read the BudgetProperty privacy policy and data handling practices.",
  },
  "/terms": {
    title: "Terms and Conditions",
    description: "Read the BudgetProperty terms and conditions for using the platform.",
  },
  "/refund-policy": {
    title: "Refund Policy",
    description: "Review the BudgetProperty refund policy for subscriptions and services.",
  },
}

function App() {
  const location = useLocation()

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith("/admin")
  const isUserRoute =
    location.pathname.startsWith("/user") ||
    location.pathname === "/profile"
  const routeSeo = seoByPath[location.pathname]
  const shouldNoIndex = isAdminRoute || isUserRoute

  return (
    <div className="flex flex-col min-h-screen">
      {shouldNoIndex ? (
        <Seo
          title="Dashboard"
          description="Private BudgetProperty area."
          canonicalPath={location.pathname}
          robots="noindex,nofollow"
        />
      ) : routeSeo ? (
        <Seo
          title={routeSeo.title}
          description={routeSeo.description}
          canonicalPath={location.pathname}
          robots={routeSeo.robots || "index,follow"}
        />
      ) : null}

      {/* Show Navbar only if NOT admin */}
      {!isAdminRoute && <Navbar />}

      <main className={`flex-1 ${isAdminRoute ? "" : "pb-20 md:pb-0"}`}>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route
            path="/user/properties"
            element={
              <ProtectedRoute>
                <UserProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/properties/new"
            element={
              <ProtectedRoute>
                <UserPropertyForm />
              </ProtectedRoute>
            }
            
          />
          <Route
            path="/user/properties/:id/edit"
            element={
              <ProtectedRoute>
                <UserPropertyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/inquiries"
            element={
              <ProtectedRoute>
                <UserInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute adminOnly>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties/new"
            element={
              <ProtectedRoute adminOnly>
                <AdminPropertyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <AdminPropertyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute adminOnly>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsermanagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute adminOnly>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute adminOnly>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
        </Routes>
      </main>

      {/* Show Footer only if NOT admin */}
      {!isAdminRoute && <Footer />}

      <ChatWidget isAdminRoute={isAdminRoute} />
      {!isAdminRoute && <PurposePrompt />}

    </div>
  )
}

export default App
