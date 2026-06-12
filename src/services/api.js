import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

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

// Add token to requests
api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {}
  }
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthTokens()
    }
    return Promise.reject(error)
  },
)

export default api
