import { Banner } from '../components/Banner'
import { SearchBar } from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import { AuthOverlay } from '../components/AuthOverlay'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStatus } from '../contexts/OrderContext'
import { useCategories } from '../contexts/CategoryContext'
import { cafeAPI } from '../libs/api/cafeAPI'
import { IDishCategory } from '../libs/api/types'


interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}

interface APIOrder {
  id: string;
  dish: {
    name: string;
    price: number;
    picture: string;
  };
  quantity: number;
  instructions?: string;
}

// Add banner interface
interface BannerItem {
  id: string
  image: string
  title: string
  description: string
  price: string
}

// Remove the Category interface and use IDishCategory instead

export const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOrderStatus, setShowOrderStatus] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const { orderStatus } = useOrderStatus()
  const navigate = useNavigate()
  const { categories, setCategories, setCurrentCategory } = useCategories();
  // Remove unused state variables
  // const [bookingId, setBookingId] = useState<string | null>(null)
  // const [orderId, setOrderId] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await cafeAPI.getCategories();
        console.log('Categories data:', data);
        // Convert string dates to Date objects
        const formattedData = data.map((cat: any) => ({
          ...cat,
          created_at: new Date(cat.created_at),
          updated_at: new Date(cat.updated_at)
        }));
        setCategories(formattedData);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchCategories();
  }, [setCategories]);

  // Update the navigation to use category ID
  const handleCategoryClick = (categoryId: string) => {
    setCurrentCategory(categoryId);
    navigate(`/category/${categoryId}`);
  };

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

  // Check for active order
  useEffect(() => {
    const checkAuthAndBooking = async () => {
      const result = await cafeAPI.checkAuthAndBooking();
      setIsAuthenticated(result.isAuthenticated);
      
      if (result.orders && result.orders.length > 0) {
        setHasActiveOrder(true);
        setOrderItems(result.orders.map((order: APIOrder) => ({
          id: order.id,
          name: order.dish.name,
          price: order.dish.price,
          quantity: order.quantity,
          image: order.dish.picture,
          instructions: order.instructions
        })));
      } else {
        // Check for active order in local storage
        const currentOrder = localStorage.getItem('currentOrder')
        if (currentOrder) {
          const parsedOrder = JSON.parse(currentOrder)
          setOrderItems(parsedOrder)
          setHasActiveOrder(true)
        } else {
          setHasActiveOrder(false)
        }
      }
    };

    checkAuthAndBooking();
  }, []);

  const handleFinishOrder = () => {
    navigate('order-confirmation')
    setShowOrderStatus(false);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const storedBookingId = localStorage.getItem('currentBookingId')
      const storedOrderId = localStorage.getItem('currentOrderId')

      if (storedBookingId && storedOrderId) {
        try {
          const orderDetails = await cafeAPI.getOrdersByBooking()
          if (orderDetails.success && orderDetails.data.length > 0) {
            setHasActiveOrder(true)
            const currentOrder = orderDetails.data.find(order => order.id === storedOrderId)
            if (currentOrder) {
              setOrderItems([{
                id: currentOrder.id,
                name: currentOrder.dish.name, // Assuming the API returns the dish name
                price: currentOrder.dish.price, // Assuming the API returns the dish price
                quantity: currentOrder.quantity,
                image: currentOrder.dish.picture, // Assuming the API returns the dish picture
                instructions: currentOrder.instructions || ''
              }])
            }
          }
        } catch (error) {
          console.error('Error fetching order details:', error)
        }
      } else {
        setHasActiveOrder(false)
      }
    }

    fetchOrderDetails()
  }, [])

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
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <CategoryGrid 
            categories={categories.map((cat: IDishCategory) => ({
              id: cat.id,
              name: cat.name,
              image: cat.picture
            }))}
            onCategoryClick={handleCategoryClick}
          />
        </motion.div>
      </div>

      {/* Side Button and Order Status Drawer */}
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
              className="flex items-center bg-white rounded-l-full py-2 pl-3 pr-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
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
                <img
                  src="/orderstatus.png"
                  alt="Order Status"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </button>
          </div>

          {/* Order Status Drawer */}
          <div
            className={`fixed right-0 top-[20%] w-[90%] max-w-sm bg-white shadow-lg rounded-l-2xl z-50 transform transition-transform duration-300 ease-in-out h-[70vh] ${
              showOrderStatus ? 'translate-x-0' : 'translate-x-full'
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
                onClick={handleFinishOrder}
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
