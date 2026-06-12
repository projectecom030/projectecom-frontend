"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Building2, Phone, ArrowRight } from "lucide-react"

const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const [phone, setPhone] = useState(searchParams.get("phone") || "")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendSeconds, setResendSeconds] = useState(0)

  const { loginWithOtp, sendOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"
  const RESEND_COOLDOWN = 30

  // ✅ Normalize phone before API
  const cleanPhone = (value) => value.replace(/\D/g, "")

  useEffect(() => {
    if (resendSeconds <= 0) return

    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendSeconds])

  const handleSendOtp = async () => {
    const normalizedPhone = cleanPhone(phone)

    if (normalizedPhone.length < 10) {
      setError("Enter valid phone number")
      return
    }
 
    setLoading(true)
    setError("")

    try {
      await sendOtp(normalizedPhone, "login")   // ✅ send clean phone
      setOtpSent(true)
      setResendSeconds(RESEND_COOLDOWN)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

 const handlePhoneLogin = async (e) => {
  e.preventDefault()

  if (!otpSent) return   // ✅ STOP EARLY

  if (!otp || otp.length !== 6) {
    setError("Enter valid OTP")
    return
  }

  setLoading(true)
  setError("")

  try {
    await loginWithOtp(phone, otp)
    navigate(from, { replace: true })
  } catch (err) {
    setError(err.response?.data?.message || "OTP verification failed")
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_10px_24px_rgba(37,99,235,0.35)] ring-1 ring-blue-400/30 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BudgetProperty</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Login with Phone
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter your phone number to continue
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              {error.toLowerCase().includes("register first") ? (
                <Link to="/register" className="mt-1 inline-block font-medium text-blue-600 hover:underline">
                  Go to Register
                </Link>
              ) : null}
            </div>
          )}

          <form onSubmit={handlePhoneLogin} className="space-y-4">
            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Your Phone Number"
                  disabled={otpSent}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* OTP */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {resendSeconds > 0
                      ? `Resend available in 00:${String(resendSeconds).padStart(2, "0")}`
                      : "Didn't receive the OTP?"}
                  </span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || resendSeconds > 0}
                    className="font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* BUTTONS */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || cleanPhone(phone).length < 10}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify & Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp("")
                  }}
                  className="w-full text-gray-600 text-sm hover:text-blue-600"
                >
                  Change phone number
                </button>
              </>
            )}
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
