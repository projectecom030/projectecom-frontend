"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import api from "../../services/api"
import GooglePlacesInput from "../common/GooglePlacesInput"

const PropertyFilter = ({ filters, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [propertyTypes, setPropertyTypes] = useState([])
  const [cities, setCities] = useState([])
  const normalizePincode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const [typesRes, citiesRes] = await Promise.all([
        api.get("/properties/meta/types"),
        api.get("/properties/meta/cities"),
      ])
      setPropertyTypes(typesRes.data.data || [])
      setCities(citiesRes.data.data || [])
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: "",
      city: "",
      type: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      pincode: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== "")

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Main Search */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="button"
            onClick={() => handleChange("search", filters.search || "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-blue-600"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <GooglePlacesInput
            value={filters.search || ""}
            onChange={(value) => handleChange("search", value)}
            onPlaceSelect={(place) => {
              if (place?.city) {
                onFilterChange({ ...filters, search: place.address || place.name || "", city: place.city })
              }
            }}
            placeholder="Search by city, district, 1/2/3 BHK, house or apartment"
            inputClassName="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors ${
            showAdvanced ? "bg-blue-50 border-blue-300 text-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleChange("listingType", filters.listingType === "sale" ? "" : "sale")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.listingType === "sale" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => handleChange("listingType", filters.listingType === "rent" ? "" : "rent")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.listingType === "rent" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Rent
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={filters.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city} ({city.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={filters.type || ""}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <select
              value={filters.minPrice || ""}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Min</option>
              <option value="1000000">₹10 Lakh</option>
              <option value="2500000">₹25 Lakh</option>
              <option value="5000000">₹50 Lakh</option>
              <option value="10000000">₹1 Crore</option>
              <option value="25000000">₹2.5 Crore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <select
              value={filters.maxPrice || ""}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Max</option>
              <option value="2500000">₹25 Lakh</option>
              <option value="5000000">₹50 Lakh</option>
              <option value="10000000">₹1 Crore</option>
              <option value="25000000">₹2.5 Crore</option>
              <option value="50000000">₹5 Crore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <select
              value={filters.bedrooms || ""}
              onChange={(e) => handleChange("bedrooms", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              value={filters.pincode || ""}
              onChange={(e) => handleChange("pincode", normalizePincode(e.target.value))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="e.g., 400001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyFilter
