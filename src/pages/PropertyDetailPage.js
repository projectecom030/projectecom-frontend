"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Calendar,
  Compass,
  Building,
  ChevronLeft,
  ChevronRight,
  Check,
  Share2,
  Heart,
  MoveLeft,
  Download,
  Eye,
  Phone,
} from "lucide-react"
import InquiryForm from "../components/property/InquiryForm"
import api from "../services/api"
import { resolveImageUrl } from "../utils/imageUrl"
import { useAuth } from "../context/AuthContext"
import Seo from "../components/Seo"

const PropertyDetailPage = () => {
  const imageFallback =
    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='28'%3ENo Image Available%3C/text%3E%3C/svg%3E"
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  useEffect(() => {
    if (user?.role === "customer") {
      fetchSubscription()
    }
  }, [user])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsWishlisted(saved.some((item) => Number(item.id) === Number(id)))
  }, [id])

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`)
      const nextProperty = response.data.data
      setProperty(nextProperty)
      window.dispatchEvent(
        new CustomEvent("property-engagement-updated", {
          detail: {
            propertyId: Number(nextProperty?.id),
            view_count: Number(nextProperty?.view_count || 0),
            contact_count: Number(nextProperty?.contact_count || 0),
          },
        }),
      )
    } catch (error) {
      console.error("Failed to fetch property:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscription = async () => {
    try {
      setLoadingSubscription(true)
      const response = await api.get("/subscription/active")
      setSubscription(response.data?.data || null)
    } catch (error) {
      setSubscription(null)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`
    }
    return `₹${price?.toLocaleString()}`
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const getFileNameFromUrl = (url, index = 1) => {
    try {
      const parsed = new URL(url, window.location.origin)
      const raw = parsed.pathname.split("/").pop() || `property-image-${index}.jpg`
      const clean = raw.split("?")[0].split("#")[0]
      return clean || `property-image-${index}.jpg`
    } catch {
      return `property-image-${index}.jpg`
    }
  }

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url, { credentials: "omit" })
      if (!response.ok) throw new Error("Failed to fetch file")
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }

  const handleDownloadCurrentImage = async () => {
    const url = images[currentImageIndex]
    if (!url) return
    await downloadImage(url, getFileNameFromUrl(url, currentImageIndex + 1))
  }


  const handleWishlistToggle = () => {
    if (!property) return

    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const exists = saved.some((item) => Number(item.id) === Number(property.id))

    let updated
    if (exists) {
      updated = saved.filter((item) => Number(item.id) !== Number(property.id))
      setIsWishlisted(false)
    } else {
      const firstImage = images[0] || "/placeholder.svg"
      const wishlistItem = {
        id: property.id,
        title: property.title,
        city: property.city,
        state: property.state,
        image: firstImage,
      }
      updated = [wishlistItem, ...saved]
      setIsWishlisted(true)
    }

    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Building className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
        <Link to="/properties" className="text-blue-600 hover:underline">
          Browse All Properties
        </Link>
      </div>
    )
  }

  const images =
    property.images?.length > 0
      ? property.images.map((img) => resolveImageUrl(img.image_url))
      : ["/modern-house-interior.png"]

  const details = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Square, label: "Area", value: property.area_sqft ? `${property.area_sqft} sqft` : null },
    { icon: Car, label: "Parking", value: property.parking_spaces },
    {
      icon: Building,
      label: "Floor",
      value: property.floor_number ? `${property.floor_number}/${property.total_floors}` : null,
    },
    { icon: Compass, label: "Facing", value: property.facing },
    { icon: Calendar, label: "Age", value: property.age_of_property },
  ].filter((d) => d.value)

  const isOwner = user?.role === "owner"
  const isCustomer = user?.role === "customer"
  const isDealer = user?.role === "dealer"
  const hasActiveSubscription = Boolean(subscription)
  const isPremiumPlan = Number(subscription?.is_premium) === 1
  const canViewDetails = Boolean(property?.details_locked) ? false : isOwner || (isCustomer && hasActiveSubscription)
  const canDirectDeal =
    isCustomer && hasActiveSubscription && !isPremiumPlan && property?.listing_type === "sale"
  const primaryImage = images[0] || "/modern-house-interior.png"
  const seoTitle = property?.title || "Property Details"
  const seoDescription = property
    ? `${property.property_type || "Property"} in ${property.city || "Tamil Nadu"}${property.state ? `, ${property.state}` : ""}. ${property.bedrooms ? `${property.bedrooms} BHK. ` : ""}${property.area_sqft ? `${property.area_sqft} sqft. ` : ""}${property.price ? `Price ${formatPrice(property.price)}.` : ""}`
    : "Browse property details, images, and location information on BudgetProperty."
  const seoJsonLd = property
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: property.description || seoDescription,
        url: `${window.location.origin}/properties/${property.id}`,
        image: images,
        datePosted: property.created_at || undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.city || undefined,
          addressRegion: property.state || undefined,
          postalCode: property.pincode || undefined,
          streetAddress: property.details_locked ? undefined : property.address_line1 || undefined,
        },
        offers: {
          "@type": "Offer",
          price: property.price || undefined,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      }
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/properties/${id}`}
        image={primaryImage}
        type="article"
        jsonLd={seoJsonLd}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <Link
            to="/properties"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all"
            aria-label="Back to Properties"
            title="Back to Properties"
          >
            <MoveLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10]">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={property.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = imageFallback
                  }}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.listing_type === "sale" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                    }`}
                  >
                    For {property.listing_type === "sale" ? "Sale" : "Rent"}
                  </span>
                  {property.is_featured && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500 text-white">Featured</span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleDownloadCurrentImage}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    title="Download Image"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-700"}`} />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? "border-blue-600" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = imageFallback
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {canViewDetails ? (
                      <span>
                        {property.address_line1}, {property.city}, {property.state} - {property.pincode}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Subscribe to view full address details
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</div>
                  {property.listing_type === "rent" && <span className="text-gray-500">/month</span>}
                  {property.area_sqft && property.price && (
                    <div className="text-sm text-gray-500">
                      ₹{Math.round(property.price / property.area_sqft).toLocaleString()}/sqft
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <detail.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{detail.label}</div>
                      <div className="font-semibold text-gray-900">{detail.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Eye className="h-4 w-4 text-slate-500" />
                  {property.view_count || 0} views
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {property.contact_count || 0} contacts
                </div>
              </div>

              {/* Furnishing */}
              {property.furnishing && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-gray-600">Furnishing:</span>
                  <span className="font-medium text-gray-900 capitalize">{property.furnishing.replace("-", " ")}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(showAllAmenities ? property.amenities : property.amenities.slice(0, 9)).map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
                {property.amenities.length > 9 && !showAllAmenities && (
                  <button
                    onClick={() => setShowAllAmenities(true)}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                  >
                    Show All {property.amenities.length} Amenities
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Builder Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {canViewDetails ? property.builder_name : "Owner Details Hidden"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {canViewDetails ? "Property Builder" : "Unlock by subscription"}
                    </p>
                  </div>
                </div>
                {!canViewDetails && (
                  <button
                    type="button"
                    onClick={() => navigate(`/subscription?redirectTo=${encodeURIComponent(`/properties/${property.id}`)}`)}
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    disabled={loadingSubscription}
                  >
                    View Plans
                  </button>
                )}
              </div>

              {/* Inquiry Form */}
              <InquiryForm
                propertyId={property.id}
                builderPhone={canViewDetails ? property.builder_phone : ""}
                builderName={canViewDetails ? property.builder_name : ""}
                allowDirectDeal={canDirectDeal && !isDealer}
                isPremiumPlan={isPremiumPlan}
                onContactUnlocked={(data) => {
                  const nextContactCount = Number(data?.contactCount || 0)
                  setProperty((prev) =>
                    prev
                      ? {
                          ...prev,
                          contact_count: nextContactCount,
                        }
                      : prev,
                  )
                  window.dispatchEvent(
                    new CustomEvent("property-engagement-updated", {
                      detail: {
                        propertyId: Number(property.id),
                        view_count: Number(property.view_count || 0),
                        contact_count: nextContactCount,
                      },
                    }),
                  )
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailPage
