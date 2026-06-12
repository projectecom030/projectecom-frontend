"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, Save, Loader2 } from "lucide-react"
import api from "../services/api"
import GooglePlacesInput from "../components/common/GooglePlacesInput"
import LocationPickerMap from "../components/common/LocationPickerMap"

const UserPropertyForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [propertyTypes, setPropertyTypes] = useState([])
  const [amenitiesList, setAmenitiesList] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyTypeId: "",
    price: "",
    priceUnit: "total",
    areaSqft: "",
    bedrooms: "",
    bathrooms: "",
    parkingSpaces: "",
    furnishing: "",
    facing: "",
    floorNumber: "",
    totalFloors: "",
    ageOfProperty: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    mapAddress: "",
    googlePlaceId: "",
    latitude: "",
    longitude: "",
    listingType: "sale",
    status: "available",
    amenities: [],
    images: [],
  })
  const [error, setError] = useState("")
  const normalizePincode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6)

  useEffect(() => {
    fetchOptions()
    if (isEditing) {
      fetchProperty()
    }
  }, [id])

  const fetchOptions = async () => {
    try {
      const [typesRes, amenitiesRes] = await Promise.all([
        api.get("/properties/meta/types"),
        api.get("/properties/meta/amenities"),
      ])
      setPropertyTypes(typesRes.data.data || [])
      setAmenitiesList(amenitiesRes.data.data || [])
    } catch (error) {
      console.error("Failed to fetch options:", error)
    }
  }

  const fetchProperty = async () => {
    setLoading(true)
    try {
      // We can use the public endpoint to get property details since it returns all info needed for editing
      // or we can use the user endpoint if we want to ensure ownership check on fetch
      // For now, let's use public one, but ownership is enforced on PUT
      const response = await api.get(`/properties/${id}`)
      const property = response.data.data
      setFormData({
        title: property.title || "",
        description: property.description || "",
        propertyTypeId: property.property_type_id?.toString() || "",
        price: property.price?.toString() || "",
        priceUnit: property.price_unit || "total",
        areaSqft: property.area_sqft?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        parkingSpaces: property.parking_spaces?.toString() || "",
        furnishing: property.furnishing || "",
        facing: property.facing || "",
        floorNumber: property.floor_number?.toString() || "",
        totalFloors: property.total_floors?.toString() || "",
        ageOfProperty: property.age_of_property || "",
        addressLine1: property.address_line1 || "",
        addressLine2: property.address_line2 || "",
        city: property.city || "",
        state: property.state || "",
        pincode: property.pincode || "",
        mapAddress: property.map_address || "",
        googlePlaceId: property.google_place_id || "",
        latitude: property.latitude ?? "",
        longitude: property.longitude ?? "",
        listingType: property.listing_type || "sale",
        status: property.status || "available",
        amenities: property.amenities?.map((a) => a.id) || [],
        images: property.images?.map((i) => i.image_url) || [],
      })
    } catch (error) {
      console.error("Failed to fetch property:", error)
      setError("Failed to load property")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const formDataUpload = new FormData()
    files.forEach((file) => formDataUpload.append("images", file))

    try {
      const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("token")
      const headers = { "Content-Type": "multipart/form-data" }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
      const response = await api.post("/upload/images", formDataUpload, { headers })
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data.imageUrls],
      }))
    } catch (error) {
      console.error("Failed to upload images:", error)
      setError("Failed to upload images")
    }
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const normalizedPincode = normalizePincode(formData.pincode)
      if (normalizedPincode.length !== 6) {
        setError("Enter a valid 6-digit pincode")
        setSaving(false)
        return
      }

      const payload = {
        ...formData,
        pincode: normalizedPincode,
        propertyTypeId: formData.propertyTypeId ? Number.parseInt(formData.propertyTypeId) : null,
        price: Number.parseFloat(formData.price),
        areaSqft: formData.areaSqft ? Number.parseFloat(formData.areaSqft) : null,
        bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
        parkingSpaces: formData.parkingSpaces ? Number.parseInt(formData.parkingSpaces) : 0,
        floorNumber: formData.floorNumber ? Number.parseInt(formData.floorNumber) : null,
        totalFloors: formData.totalFloors ? Number.parseInt(formData.totalFloors) : null,
        latitude: formData.latitude === "" ? null : Number.parseFloat(formData.latitude),
        longitude: formData.longitude === "" ? null : Number.parseFloat(formData.longitude),
      }

      if (isEditing) {
        await api.put(`/user/properties/${id}`, payload)
      } else {
        await api.post("/user/properties", payload)
      }

      navigate("/user/properties")
    } catch (error) {
      console.error("Failed to save property:", error)
      const errorMessage =
        error.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        error.response?.data?.message ||
        "Failed to save property"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Property" : "Add New Property"}</h1>
          <p className="text-gray-600">{isEditing ? "Update property details" : "Fill in the property details"}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 3 BHK Apartment in City Center"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the property features and highlights..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  name="propertyTypeId"
                  value={formData.propertyTypeId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="under_construction">Under Construction</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                <input
                  type="number"
                  name="areaSqft"
                  value={formData.areaSqft}
                  onChange={handleChange}
                  placeholder="e.g., 1200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                <input
                  type="number"
                  name="parkingSpaces"
                  value={formData.parkingSpaces}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="number"
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <GooglePlacesInput
                  value={formData.addressLine1}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine1: value,
                    }))
                  }
                  onPlaceSelect={(place) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine1: place.addressLine1 || place.address || prev.addressLine1,
                      addressLine2: prev.addressLine2 || place.locality || "",
                      city: place.city || prev.city,
                      state: place.state || prev.state,
                      pincode: normalizePincode(place.pincode || prev.pincode),
                      mapAddress: place.address || prev.mapAddress,
                      googlePlaceId: place.placeId || prev.googlePlaceId,
                      latitude: place.lat ?? prev.latitude,
                      longitude: place.lng ?? prev.longitude,
                    }))
                  }
                  placeholder="Search full address, locality or landmark"
                  inputClassName="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Area, Landmark"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Mumbai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Maharashtra"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pincode: normalizePincode(e.target.value),
                    }))
                  }
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="e.g., 400001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Map Address</label>
                <input
                  type="text"
                  name="mapAddress"
                  value={formData.mapAddress}
                  onChange={handleChange}
                  placeholder="Auto-filled from Google map/address selection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 13.0827000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 80.2707000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <LocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  title="Select Property Location"
                  onChange={({ latitude, longitude }) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: String(latitude),
                      longitude: String(longitude),
                    }))
                  }
                  onAddressChange={(address) =>
                    setFormData((prev) => ({
                      ...prev,
                      mapAddress: address || prev.mapAddress,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                <label className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                First image will be the primary image. Drag and drop functionality coming soon.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Property"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserPropertyForm
