import { Banner } from '../components/Banner'
import { SearchBar } from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import { AuthOverlay } from '../components/AuthOverlay'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStatus } from '../contexts/OrderContext'
import { authAPI } from '../libs/api/cafeAPI'


interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}


interface Category {
  _type: string
  id: string
  name: string
  picture: string
  created_at: string
  updated_at: string
}

// Add banner interface
interface BannerItem {
  id: string
  image: string
  title: string
  description: string
  price: string
}

export const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOrderStatus, setShowOrderStatus] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { orderStatus } = useOrderStatus()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await authAPI.getCategories()
        console.log('Categories data:', data)
        setCategories(data)
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Handle order status
  useEffect(() => {
    const currentOrder = localStorage.getItem('currentOrder')
    setHasActiveOrder(!!currentOrder)
    if (currentOrder) {
      const parsedOrder = JSON.parse(currentOrder)
      setOrderItems(parsedOrder)
    } else {
      setOrderItems([])
      setHasActiveOrder(false)
    }
  }, [orderStatus])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  // Add banners data
  const banners: BannerItem[] = [
    {
      id: '1',
      image: '/banner1.jpg',
      title: 'Special Offers',
      description: 'Discover our latest deals',
      price: '₹199'
    }
    // Add more banners as needed
  ]

  // Update the navigation to use category ID instead of name
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pb-24"
    >
      <div className="m-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Banner banners={banners} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4"
        >
          <SearchBar showFilter={false} onSearch={setSearchQuery} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <CategoryGrid 
            categories={filteredCategories.map(cat => ({
              id: cat.id,
              name: cat.name,
              image: cat.picture // Make sure to use picture instead of image
            }))}
            onCategoryClick={(id) => handleCategoryClick(id)}
          />
        </motion.div>
      </div>

      {/* Order Status Drawer */}
      {hasActiveOrder && (
        <>
          {/* Semi-transparent overlay when drawer is open */}
          {showOrderStatus && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowOrderStatus(false)}
            />
          )}

          {/* Side Button */}
          <div className="fixed right-0 top-[35%] -translate-y-1/2 flex items-center z-50">
            <button
              onClick={() => setShowOrderStatus(true)}
              className="flex items-center bg-white rounded-l-full py-2 pl-3 pr-4 shadow-lg" // Increased padding
            >
              <div className="flex items-center gap-3"> {/* Increased gap */}
                {/* Left Arrow Icon */}
                <svg
                  className="w-5 h-5" // Increased icon size
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#FF6B00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Custom Image Placeholder */}
                <img
                  src="/orderstatus.png"
                  alt="Order Status"
                  className="w-10 h-10 object-contain" // Increased image size
                />
              </div>
            </button>
          </div>

          {/* Order Status Drawer */}
          <div
            className={`fixed right-0 top-[20%] w-[90%] max-w-sm bg-white shadow-lg rounded-l-2xl z-50 transform transition-transform duration-300 ease-in-out h-[70vh] ${showOrderStatus ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-center mb-4">
                <div className="flex flex-col items-center">
                  {orderStatus === 'received' ? (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                      <img
                        src="/orderpreparing.png"
                        alt="Preparing Order"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-orange-500">
                    {orderStatus === 'received' ? 'Order Received' : 'Preparing'}
                  </h3>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    {orderStatus === 'received'
                      ? 'Your order has been received and will be delivered soon!'
                      : 'Your order has been received and our chefs will start preparing your order soon!'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Order Items */}
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-orange-500">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="text-gray-600">
                          Qty. {item.quantity}
                        </div>
                      </div>
                      {item.instructions && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Instructions</p>
                          <p>{item.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Finish Order Button */}
              <button
                onClick={() => {
                  navigate('/checkout', {
                    state: {
                      items: orderItems, // Use orderItems from state instead of re-fetching
                      directConfirm: true,
                      showRating: true
                    }
                  })
                }}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium mt-4"
              >
                Finish Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* Assistance Button */}
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={() => {
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
          }}
          className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          >
            Your assistance is on the way!
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && (
        <AuthOverlay
          onPhoneSignIn={() => setIsAuthenticated(true)}
        />
      )}
    </motion.div>
  )
}
