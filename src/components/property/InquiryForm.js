"use client"

import { useState } from "react"
import { Phone, MessageCircle, Send, CheckCircle, Lock } from "lucide-react"
import { CONTACT_INFO } from "../../constants/contactInfo"
import api from "../../services/api"

const InquiryForm = ({ propertyId, builderPhone, builderName, allowDirectDeal, isPremiumPlan, onContactUnlocked }) => {
  const [contactPhone, setContactPhone] = useState(builderPhone || "")
  const [contactUnlocked, setContactUnlocked] = useState(Boolean(builderPhone))
  const whatsappPhone = (() => {
    const digits = String(contactPhone || "").replace(/\D/g, "")
    if (digits.length === 10) return `91${digits}`
    return digits
  })()

  const [formData, setFormData] = useState({
    userName: "",
    userPhone: "",
    userEmail: "",
    message: "",
    inquiryType: "message",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [contactsRemaining, setContactsRemaining] = useState(null)

  const handleUnlockContact = async () => {
    if (!allowDirectDeal || unlocking) return
    setUnlocking(true)
    setError("")
    try {
      const { data } = await api.post("/contact/view-contact", { propertyId })
      if (data?.phone) {
        setContactPhone(data.phone)
        setContactUnlocked(true)
        setContactsRemaining(data.contactsRemaining ?? null)
        onContactUnlocked?.(data)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to unlock contact")
    } finally {
      setUnlocking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await api.post("/inquiries", {
        propertyId,
        ...formData,
      })
      setSuccess(true)
      setFormData({
        userName: "",
        userPhone: "",
        userEmail: "",
        message: "",
        inquiryType: "message",
      })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit inquiry")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Inquiry Sent!</h3>
        <p className="text-emerald-700 mb-4">The builder will contact you shortly.</p>
        <button onClick={() => setSuccess(false)} className="text-emerald-600 font-medium hover:underline">
          Send Another Inquiry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Builder</h3>

      {/* Quick Contact Buttons */}
      {allowDirectDeal ? (
        <div className="flex flex-col gap-3 mb-6">
          {!contactUnlocked ? (
            <button
              type="button"
              onClick={handleUnlockContact}
              disabled={unlocking}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {unlocking ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              Direct Deal
            </button>
          ) : (
            <div className="flex gap-3">
              <a
                href={`tel:${contactPhone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href={`https://wa.me/${whatsappPhone}?text=Hi, I'm interested in your property listing.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          )}
          {contactsRemaining !== null && (
            <p className="text-xs text-gray-500 text-center">
              Contacts remaining: {contactsRemaining}
            </p>
          )}
        </div>
      ) : isPremiumPlan ? (
        <div className="flex gap-3 mb-6">
          <a
            href={CONTACT_INFO.phoneHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Admin
          </a>
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsappNumber}?text=Hi, I'm interested in a premium plan.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      ) : null}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or send a message</span>
        </div>
      </div>

      {/* Inquiry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Name *"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone Number *"
            value={formData.userPhone}
            onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email (optional)"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Inquiry
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">By submitting, you agree to our Terms & Privacy Policy</p>
    </div>
  )
}

export default InquiryForm
