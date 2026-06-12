"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Building,
  Home,
  MapPin,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  Building2,
  Briefcase,
  Crown,
} from "lucide-react"
import PropertyCard from "../components/property/PropertyCard"
import api from "../services/api"
import GooglePlacesInput from "../components/common/GooglePlacesInput"
import { parseSearchKeywords, TAMIL_NADU_DISTRICTS } from "../utils/searchKeywords"
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo"

const cityBuildingImageByCity = {
  chennai: "https://commons.wikimedia.org/wiki/Special:FilePath/Chennai_Central_station.jpg",
  madurai: "https://commons.wikimedia.org/wiki/Special:FilePath/Meenakshi_Amman_Temple_gopuram.jpg",
  thanjavur: "https://commons.wikimedia.org/wiki/Special:FilePath/Thanjavur_Brihadisvara_Temple.jpg",
  tiruchirappalli: "https://commons.wikimedia.org/wiki/Special:FilePath/Tiruchirappalli_Rockfort.jpg",
  coimbatore: "https://commons.wikimedia.org/wiki/Special:FilePath/Marudhamalai_Temple_Coimbatore.jpg",
  kanyakumari: "https://commons.wikimedia.org/wiki/Special:FilePath/Vivekananda_Rock_Memorial_Kanyakumari.jpg",
}

const getCityImageUrl = (cityName) => {
  const normalized = String(cityName || "").trim().toLowerCase()
  if (cityBuildingImageByCity[normalized]) {
    return cityBuildingImageByCity[normalized]
  }
  if (TAMIL_NADU_DISTRICTS.has(normalized)) {
    return `https://source.unsplash.com/900x900/?${encodeURIComponent(
      `${cityName} Tamil Nadu landmark temple fort palace`
    )}`
  }
  return `https://picsum.photos/seed/${encodeURIComponent(normalized || "city")}/900/900`
}

const getCitySecondFallbackImage = (cityName) =>
  `https://picsum.photos/seed/${encodeURIComponent(
    `${String(cityName || "city").toLowerCase()}-skyline`
  )}/900/900`

const getCityFallbackImage = (cityName) => {
  const city = String(cityName || "City")
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>
    <rect width="640" height="640" fill="url(#g)" />
    <circle cx="520" cy="120" r="70" fill="rgba(255,255,255,0.15)" />
    <rect x="70" y="290" width="90" height="210" fill="rgba(255,255,255,0.22)" />
    <rect x="185" y="250" width="70" height="250" fill="rgba(255,255,255,0.18)" />
    <rect x="275" y="220" width="110" height="280" fill="rgba(255,255,255,0.24)" />
    <rect x="410" y="265" width="80" height="235" fill="rgba(255,255,255,0.2)" />
    <rect x="510" y="305" width="60" height="195" fill="rgba(255,255,255,0.16)" />
    <text x="48" y="560" fill="rgba(255,255,255,0.95)" font-size="42" font-family="Arial, sans-serif" font-weight="700">${city}</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const getPropertyTypeIcon = (type) => {
  const name = String(type?.name || "").trim().toLowerCase()
  const iconName = String(type?.icon || "").trim().toLowerCase()

  if (name.includes("apartment") || iconName === "building") return Building2
  if (name.includes("villa") || name.includes("house") || iconName === "home" || iconName === "house") return Home
  if (name.includes("plot") || iconName === "map") return MapPin
  if (name.includes("penthouse") || iconName === "crown") return Crown
  if (name.includes("office") || name.includes("commercial") || iconName === "briefcase") return Briefcase

  return Building
}


const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [cities, setCities] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [listingTab, setListingTab] = useState("rent")
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate();

  

const location = useLocation();
const params = new URLSearchParams(location.search);

const selectedCityFromUrl = params.get("city");

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleEngagementUpdate = (event) => {
      const propertyId = Number(event.detail?.propertyId)
      if (!propertyId) return

      setFeaturedProperties((prev) =>
        prev.map((property) =>
          Number(property.id) === propertyId
            ? {
                ...property,
                view_count: Number(event.detail?.view_count ?? property.view_count ?? 0),
                contact_count: Number(event.detail?.contact_count ?? property.contact_count ?? 0),
              }
            : property,
        ),
      )
    }

    window.addEventListener("property-engagement-updated", handleEngagementUpdate)
    return () => window.removeEventListener("property-engagement-updated", handleEngagementUpdate)
  }, [])

  const fetchData = async () => {
    try {
      const [propertiesRes, typesRes, citiesRes] = await Promise.all([
        api.get("/properties/featured"),
        api.get("/properties/meta/types"),
        api.get("/properties/meta/cities"),
      ])
      setFeaturedProperties(propertiesRes.data.data || [])
      setPropertyTypes(typesRes.data.data || [])
      setCities(citiesRes.data.data?.slice(0, 6) || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

 const handleSearch = (e) => {
  e.preventDefault();
  const parsed = parseSearchKeywords(searchQuery)
  const params = new URLSearchParams()
  if (listingTab === "buy") params.set("listingType", "sale")
  if (listingTab === "rent") params.set("listingType", "rent")
  if (listingTab === "commercial") params.set("type", "Commercial")
  if (parsed.search) params.set("search", parsed.search)
  if (selectedPlace?.city) {
    params.set("city", selectedPlace.city)
  } else if (parsed.city) {
    params.set("city", parsed.city)
  }
  if (!params.get("type") && parsed.type) params.set("type", parsed.type)
  if (parsed.bedrooms) params.set("bedrooms", parsed.bedrooms)
  navigate(`/properties?${params.toString()}`);
};


  const stats = [
    { icon: Building, value: "500+", label: "Properties Listed" },
    { icon: Users, value: "1000+", label: "Happy Customers" },
    { icon: MapPin, value: "50+", label: "Cities Covered" },
    { icon: TrendingUp, value: "98%", label: "Success Rate" },
  ]

  const features = [
    {
      icon: Shield,
      title: "Verified",
      description: "Team-checked listings.",
    },
    {
      icon: Users,
      title: "Direct",
      description: "Talk to builders only.",
    },
    {
      icon: TrendingUp,
      title: "Best Deals",
      description: "Clear price. No intermediary fees.",
    },
  ]

  const openWhatsApp = (serviceName) => {
    const phone = "916374777455"
    const text = encodeURIComponent(`Hi, I want to book ${serviceName}.`)
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div>
      <Seo
        title="Buy, Rent and Discover Property"
        description="Explore verified properties for sale and rent across top cities with BudgetProperty."
        canonicalPath="/"
      />
      <style>{`
        @keyframes property-type-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .property-type-marquee {
          overflow: hidden;
          position: relative;
        }

        .property-type-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: property-type-scroll 12s linear infinite;
        }

        .property-type-card {
          min-width: 180px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .property-type-card:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .property-type-icon {
          width: 48px;
          height: 48px;
          background: #dbeafe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          transition: background-color 0.2s;
        }

        .property-type-card:hover .property-type-icon {
          background: #bfdbfe;
        }

        @media (max-width: 768px) {
          .property-type-track {
            animation-duration: 12s;
          }
          .property-type-card {
            min-width: 150px;
            padding: 18px;
          }
        }
      `}</style>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20 lg:py-28">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop)"
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Dream Property Today
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Budget Property is a property listing platform where users can list, discover, and promote properties. We
              provide subscription-based listing and advertising services to enhance property visibility.
            </p>

            {/* Search Panel */}
            <form onSubmit={handleSearch} className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-xl md:p-5">
              <div className="mb-4 grid grid-cols-3 border-b border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => setListingTab("buy")}
                  className={`pb-2.5 text-sm font-semibold transition-colors ${
                    listingTab === "buy" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500"
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setListingTab("rent")}
                  className={`pb-2.5 text-sm font-semibold transition-colors ${
                    listingTab === "rent" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500"
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setListingTab("commercial")}
                  className={`pb-2.5 text-sm font-semibold transition-colors ${
                    listingTab === "commercial" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500"
                  }`}
                >
                  Commercial
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <GooglePlacesInput
                  value={searchQuery}
                  onChange={(value) => {
                    setSearchQuery(value)
                    if (!value) setSelectedPlace(null)
                  }}
                  onPlaceSelect={(place) => setSelectedPlace(place)}
                    placeholder="Search by city, district, locality, 1/2/3 BHK, house or apartment"
                  inputClassName="h-12 w-full rounded-xl border border-gray-300 pl-12 pr-16 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link
                to="/properties?listingType=sale"
                className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
              >
                Buy Property
              </Link>
              <Link
                to="/properties?listingType=rent"
                className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
              >
                Rent Property
              </Link>
              <Link
                to="/properties?type=Apartment"
                className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
              >
                Apartments
              </Link>
              <Link
                to="/properties?type=Villa"
                className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
              >
                Villas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Hand-picked properties just for you</p>
            </div>
            <Link
              to="/properties"
              className="hidden md:flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No featured properties available</p>
            </div>
          )}

          <div className="md:hidden text-center mt-6">
            <Link to="/properties" className="inline-flex items-center gap-2 text-blue-600 font-medium">
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Browse by Property Type</h2>
            <p className="text-gray-600">Find the perfect property that suits your needs</p>
          </div>

          <div className="property-type-marquee">
            <div className="property-type-track">
              {[...propertyTypes, ...propertyTypes].map((type, index) => {
                const TypeIcon = getPropertyTypeIcon(type)
                return (
                  <Link
                    key={`${type.id}-${index}`}
                    to={`/properties?type=${type.name}`}
                    className="property-type-card"
                  >
                    <div className="property-type-icon">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      {cities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Popular Cities</h2>
              <p className="text-gray-600">Explore properties in top cities</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cities.map((city, index) => (
                <Link
  key={city.city}
 to={`/properties?city=${encodeURIComponent(city.city)}`}
  className={`relative group overflow-hidden rounded-xl aspect-square border-4 transition-all
    ${
      selectedCityFromUrl?.toLowerCase() === city.city.toLowerCase()
        ? "border-blue-600 scale-105 shadow-xl"
        : "border-transparent"
    }`}
>

                  <img
  src={getCityImageUrl(city.city)}
  alt={`${city.city} famous place`}
  onError={(e) => {
    const currentSrc = e.target.currentSrc || e.target.src || ""
    const secondFallback = getCitySecondFallbackImage(city.city)
    if (!currentSrc.includes("picsum.photos")) {
      e.target.src = secondFallback
      return
    }
    e.target.onerror = null
    e.target.src = getCityFallbackImage(city.city)
  }}
  loading="lazy"
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
/>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{city.city}</h3>
                    <p className="text-sm text-white/80">{city.count} Properties</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
            <p className="text-gray-600">We make property buying simple and hassle-free</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-white p-4 md:p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:border-blue-200"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
                <span className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-blue-300/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="pointer-events-none absolute left-4 bottom-4 h-1.5 w-1.5 rounded-full bg-cyan-300/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-200 transition-colors group-hover:bg-blue-200">
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
            <div className="group md:hidden relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:border-blue-200">
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
              <span className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-blue-300/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute left-4 bottom-4 h-1.5 w-1.5 rounded-full bg-cyan-300/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-200">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">About Us</h3>
              <p className="text-sm leading-relaxed text-gray-600">Buy, rent, post. Fast and simple.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banners (stacked) */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="space-y-6">
            {/* Banner 1 - Painting */}
            <Link to="#" className="block bg-white rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Professional
                    Painting Services</h3>
                  <p className="text-gray-600 mb-4">High-quality painting for interiors and exteriors.</p>
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        openWhatsApp("Professional Painting Services")
                      }}
                      className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="relative h-40 md:h-32">
                  <img src="/painImg1.png" alt="Painting" className="w-full h-full object-cover object-right" />
                  <img src="/Logo1.png" alt="Logo" className="absolute top-4 right-4 w-20 opacity-90" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      openWhatsApp("Professional Painting Services")
                    }}
                    className="md:hidden absolute bottom-3 left-3 px-4 py-2 bg-blue-600 text-white rounded-md shadow"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </Link>

            {/* Banner 2 - Room Cleaning / Toilet Cleaning */}
            <Link to="#" className="block bg-white rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Expert Room
                    Cleaning</h3>
                  <p className="text-gray-600 mb-4">Deep cleaning services including toilet cleaning.</p>
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        openWhatsApp("Expert Room Cleaning")
                      }}
                      className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="relative h-40 md:h-32">
                  <img src="/roomimg.png" alt="Room cleaning" className="w-full h-full object-cover object-right" />
                  <img src="/Logo1.png" alt="Logo" className="absolute top-4 right-4 w-20 opacity-90" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      openWhatsApp("Expert Room Cleaning")
                    }}
                    className="md:hidden absolute bottom-3 left-3 px-4 py-2 bg-blue-600 text-white rounded-md shadow"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </Link>

            {/* Banner 3 - Gas & Stove Services */}
            <Link to="#" className="block bg-white rounded-xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Gas and Stove
                    Services</h3>
                  <p className="text-gray-600 mb-4">Safe gas and stove installation & repair.</p>
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        openWhatsApp("Gas and Stove Services")
                      }}
                      className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                <div className="relative h-40 md:h-32">
                  <img src="/GasImg1.png" alt="Gas services" className="w-full h-full object-cover object-right" />
                  <img src="/Logo1.png" alt="Logo" className="absolute top-4 right-4 w-20 opacity-90" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      openWhatsApp("Gas and Stove Services")
                    }}
                    className="md:hidden absolute bottom-3 left-3 px-4 py-2 bg-blue-600 text-white rounded-md shadow"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Are You a Builder?</h2>
            <p className="text-blue-100 mb-8">
              List your properties and reach thousands of potential buyers. Get started for free today.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
