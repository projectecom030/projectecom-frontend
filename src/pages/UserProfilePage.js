"use client"

import { useEffect, useState } from "react"
import { Save, Upload, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { resolveImageUrl } from "../utils/imageUrl"

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    profileImage: user?.profileImage || "",
  })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setSuccess("")
    setUploadingImage(true)

    try {
      const uploadData = new FormData()
      uploadData.append("images", file)
      const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("token")
      const headers = { "Content-Type": "multipart/form-data" }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
      const response = await api.post("/upload/images", uploadData, { headers })

      const imageUrl = response.data?.imageUrls?.[0]
      if (!imageUrl) {
        throw new Error("Image upload failed")
      }

      setFormData((prev) => ({ ...prev, profileImage: imageUrl }))
      setSuccess("Profile image uploaded. Click Save Changes to update profile.")
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        profileImage: formData.profileImage || null,
      })
      setSuccess("Profile updated successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and edit your account details</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100">
              {formData.profileImage ? (
                <img
                  src={resolveImageUrl(formData.profileImage)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.fullName || "User"}</p>
              <p className="text-sm text-gray-500">Role: {user?.role || "customer"}</p>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profile Image</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                {formData.profileImage ? <span className="text-xs text-gray-500">Image selected</span> : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={user?.phone || ""}
                disabled
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 text-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
