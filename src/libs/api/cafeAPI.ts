import axios from 'axios'
import { tokenUtils } from '../utils/token'
import { IDish } from './types' 

const BASE_URL = 'https://41a5-103-90-211-86.ngrok-free.app'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 10000
})

// Update request interceptor
apiClient.interceptors.request.use(config => {
  const token = tokenUtils.getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // Ensure headers match server's allowHeaders
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  return config
})

// Update response interceptor with better error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      config: error.config
    })
    if (error.response?.status === 401) {
      tokenUtils.removeToken()
    }
    return Promise.reject(error)
  }
)

interface Category {
  _type: string
  created_at: string
  id: string
  name: string
  picture: string
  updated_at: string
}

interface LoginRequestResponse {
  message: string
}

interface VerifyOTPResponse {
  message: string
  access_token: string
}

export const cafeAPI = {
  loginRequest: async (phoneNumber: string): Promise<LoginRequestResponse> => {
    try {
      const { data } = await apiClient.post('/cafe/auth/login-request', {
        country_code: '+91',
        phone_number: phoneNumber,
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login request failed')
      }
      throw error
    }
  },

  verifyOTP: async (phoneNumber: string, otp: string): Promise<VerifyOTPResponse> => {
    try {
      const { data } = await apiClient.post('/cafe/auth/verify-account-access', {
        country_code: '+91',
        phone_number: phoneNumber,
        otp,
      })
      if (data.access_token) {
        tokenUtils.storeToken(data.access_token)
      }
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'OTP verification failed')
      }
      throw error
    }
  },

  checkAuth: () => {
    return tokenUtils.isTokenValid()
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const token = tokenUtils.getToken()
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      
      const response = await apiClient.get('/dish/categories', {
      })
      
      console.log('Raw response:', response)
      
      if (response.data) {
        // Assuming the API returns { success: boolean, data: Category[] }
        return response.data || []
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch categories')
      }
      throw error
    }
  },

  getCategoryItemCounts: async (): Promise<Record<string, number>> => {
    try {
      const { data } = await apiClient.get('/dish/dishes')
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch category item counts')
      }
      throw error
    }
  },

  getDishesByCategoryId: async (categoryId: string): Promise<IDish[]> => {
    try {
      const token = tokenUtils.getToken()
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      const response = await apiClient.get(`/dish/dishes/${categoryId}`)

      console.log('Dishes response:', response)

      if (response.data && Array.isArray(response.data)) {
        return response.data
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Error fetching dishes:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch dishes')
      }
      throw error
    }
  }
}

