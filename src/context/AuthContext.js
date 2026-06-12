"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext(null)
const ACCESS_TOKEN_KEY = "accessToken"
const LEGACY_TOKEN_KEY = "token"

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)
}

const setAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Attach token to axios automatically
  useEffect(() => {
    const token = getAccessToken()

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    const tokenAtStart = getAccessToken()
    try {
      const response = await api.get("/auth/me")
      if (tokenAtStart && tokenAtStart === getAccessToken()) {
        setUser(response.data.user)
      }
    } catch (error) {
      clearAuthTokens()
      setUser(null)
      delete api.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  // ✅ OTP LOGIN (UPDATED)
  const loginWithOtp = async (phone, otp) => {
    phone = phone.replace(/\D/g, "")

    const response = await api.post("/auth/verify-otp", {
      phone,
      otp,
    })

    const accessToken = response.data.accessToken || response.data.token
    setAccessToken(accessToken)
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`

    setUser(response.data.user)
    return response.data
  }

  // SEND OTP
  const sendOtp = async (phone, purpose = "login") => {
    phone = phone.replace(/\D/g, "")

    const response = await api.post("/auth/send-otp", {
      phone,
      purpose,
    })

    return response.data
  }

  // REGISTER
  const register = async (userData) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  }

  // UPDATE PROFILE
  const updateProfile = async (profileData) => {
    const response = await api.put("/auth/me", profileData)
    if (response.data?.user) {
      setUser(response.data.user)
    }
    return response.data
  }

  const updateVisitPurpose = async (purpose) => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      return { success: false, message: "No token" }
    }

    try {
      const response = await api.put("/auth/purpose", { purpose })
      if (response.data?.purpose) {
        setUser((prev) => ({
          ...prev,
          visitPurpose: response.data.purpose,
        }))
      }
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
      }
      throw error
    }
  }

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {}

    clearAuthTokens()
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    loading,
    loginWithOtp,
    sendOtp,
    register,
    updateProfile,
    updateVisitPurpose,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
