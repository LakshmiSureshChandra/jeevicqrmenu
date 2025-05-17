import axios from 'axios'
import { tokenUtils } from '../utils/token'
import { IDish } from './types' 
import { IDineInOrders } from './types';

const BASE_URL = 'https://d3a2-103-90-211-86.ngrok-free.app'

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

interface CreateOrderData {
  table_id: string;
  booking_id: string;
  items: Array<{
    dish_id: string;
    quantity: number;
    instructions?: string;
  }>;
}

interface BannerItem {
  _type: string;
  created_at: string;
  id: string;
  image: string;
  updated_at: string;
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

  getDishes: async () => {
    const token = tokenUtils.getToken()
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    const { data } = await apiClient.get('/dish/dishes')
    return data
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
  },

  createBooking: async (bookingDetails: {
    table_id: string;
    booking_date: string;
    booking_time: string;
    from_time: string;
  }) => {
    try {
      const token = tokenUtils.getToken()
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      const { data } = await apiClient.post('/dine-in/bookings', bookingDetails)
      localStorage.setItem("currentBookingId",data.data.id)
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create booking')
      }
      throw error
    }
  },

  createOrder: async (orderData: CreateOrderData): Promise<{ success: boolean; data: any }> => {
    try {
      const currentOrderId = localStorage.getItem('currentOrderId');
      const url = currentOrderId
        ? `${BASE_URL}/dine-in/orders/${currentOrderId}`
        : `${BASE_URL}/dine-in/orders`;
      const method = currentOrderId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUtils.getToken()}`,
        },
        body: JSON.stringify(currentOrderId ? { items: orderData.items } : orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating/updating order:', error);
      return { success: false, data: null };
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await apiClient.patch(`/dine-in/orders/${orderId}`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, data: null };
    }
  },


  checkAuthAndBooking: async (): Promise<{
    isAuthenticated: boolean;
    shouldProceed: boolean;
    orders?: IDineInOrders[];
  }> => {
    const isAuthenticated = tokenUtils.isTokenValid()
    if (!isAuthenticated) {
      return { isAuthenticated: false, shouldProceed: true }
    }

    const bookingId = localStorage.getItem('bookingId')
    if (!bookingId) {
      return { isAuthenticated: true, shouldProceed: true }
    }

    try {
      const bookingResponse = await apiClient.get(`/dine-in/bookings/${bookingId}`)
      const bookingData = bookingResponse.data

      if (bookingData.is_cancelled || bookingData.is_completed) {
        return { isAuthenticated: true, shouldProceed: true }
      }

      const orderId = localStorage.getItem('currentOrderId')
      const ordersResponse = await apiClient.get(`/dine-in/orders/${orderId}`)
      const ordersData = ordersResponse.data

      return { isAuthenticated: true, shouldProceed: false, orders: ordersData }
    } catch (error) {
      console.error('Error checking booking status:', error)
      return { isAuthenticated: true, shouldProceed: true }
    }
  },

  getBookingById: async (): Promise<{ success: boolean; data: IDineInOrders[] }> => {
    try {
      const bookingId = localStorage.getItem('currentBookingId');
      const response = await apiClient.get(`/dine-in/bookings/${bookingId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching orders by booking:', error)
      return { success: false, data: [] }
    }
  },
  getOrdersByID: async (): Promise<{ success: boolean; data: IDineInOrders[] }> => {
    try {
      const orderId = localStorage.getItem('currentOrderId')
      const response = await apiClient.get(`/dine-in/orders/${orderId}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Error fetching orders by booking:', error)
      return { success: false, data: [] }
    }
  },
  submitRatings: async (ratings: { [dish_id: string]: number }) => {
    try {
      const formattedRatings = Object.entries(ratings).map(([dish_id, rating]) => ({
        dish_id,
        rating
      }));
      const response = await apiClient.post('/review/d', formattedRatings);
      return response.data;
    } catch (error) {
      console.error('Error submitting ratings:', error);
      throw error;
    }
  },
  getBanners: async (): Promise<BannerItem[]> => {
    try {
      const { data } = await apiClient.get('/banner')
      return data
    } catch (error) {
      console.error('Error fetching banners:', error)
      return []
    }
  },

  requestAssistance: async (tableNumber: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await apiClient.post('/dine-in/assistance', {
        table_number: tableNumber
      });
      console.log(response)
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error requesting assistance:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.data.message || 'Failed to request assistance';

        if (status === 400) {
          console.warn('Bad Request:', message);
        }

        throw new Error(message);
      }
      return { success: false, data: null };
    }
  },
  createCheckout: async (bookingId: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await apiClient.post('/dine-in/checkouts', {
        booking_id: bookingId
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating checkout:', error);
      return { success: false, data: null };
    }
  },
}

