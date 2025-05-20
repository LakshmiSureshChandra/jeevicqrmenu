import { Banner } from '../components/Banner'
import { SearchBar } from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import { AuthOverlay } from '../components/AuthOverlay'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStatus } from '../contexts/OrderContext'
import { useCategories } from '../contexts/CategoryContext'
import { cafeAPI } from '../libs/api/cafeAPI'
import { IDishCategory } from '../libs/api/types'
import { IDish } from '../libs/api/types'


interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}

// Add banner interface
interface BannerItem {
  id: string
  image: string
}

// Remove the Category interface and use IDishCategory instead

export const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOrderStatus, setShowOrderStatus] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const [dishes, setDishes] = useState<IDish[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const navigate = useNavigate()
  const { categories, setCategories, setCurrentCategory } = useCategories();
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [notificationMessage, setNotificationMessage] = useState('Your assistance is on the way!');
  const { orderStatus, setOrderStatus } = useOrderStatus();
  const [tableNumber, setTableNumber] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedTableId = localStorage.getItem('currentTableId')
    if (storedTableId) {
      setTableNumber(storedTableId)
    }
  }, [])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await cafeAPI.getBanners();
        setBanners(data);
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    fetchBanners();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await cafeAPI.getCategories();
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

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const pollOrderStatus = async () => {
      const storedOrderId = localStorage.getItem('currentOrderId');
      if (storedOrderId && hasActiveOrder) {
        try {
          const orderDetails = await cafeAPI.getOrdersByID();
          const orderData = orderDetails.data;

          let currentOrder = null;
          if (Array.isArray(orderData)) {
            currentOrder = orderData.find(order => order.id === storedOrderId);
          } else {
            currentOrder = orderData;
          }

          if (currentOrder && currentOrder.order_status) {
            setOrderStatus(currentOrder.order_status);
          }
        } catch (error) {
          console.error('Error polling order status:', error);
        }
      }
    };

    if (hasActiveOrder) {
      intervalId = setInterval(pollOrderStatus, 5000);
      // Initial poll
      pollOrderStatus();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasActiveOrder, setOrderStatus]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await cafeAPI.getDishes();
        setDishes(data);
      } catch (err) {
        console.error('Error fetching dishes:', err);
      }
    };
    fetchDishes();
  }, []);
  // Update the navigation to use category ID
  const handleCategoryClick = (categoryId: string) => {
    setCurrentCategory(categoryId);
    navigate(`/category/${categoryId}`);
  };

  // Check for active order
  useEffect(() => {
    // Only run if dishes are loaded
    if (dishes.length === 0) return;

    const checkAuthAndBooking = async () => {
      const result = await cafeAPI.checkAuthAndBooking();
      setIsAuthenticated(result.isAuthenticated);

      const storedBookingId = localStorage.getItem('currentBookingId');
      const storedOrderId = localStorage.getItem('currentOrderId');

      if (storedBookingId) {
        try {
          // Check if the booking is active
          const bookingStatusResponse = await cafeAPI.checkBookingStatus(storedBookingId);
          if (bookingStatusResponse.success && bookingStatusResponse.active_booking) {
            // Proceed with fetching order details if booking is active
            if (storedOrderId) {
              const orderDetails = await cafeAPI.getOrdersByID();
              const orderData = orderDetails.data;

              let currentOrder = null;
              if (Array.isArray(orderData)) {
                currentOrder = orderData.find((order: any) => order.id === storedOrderId);
              } else {
                currentOrder = orderData;
              }
              if (orderDetails.success && currentOrder && currentOrder.id === storedOrderId) {
                setHasActiveOrder(true);
                setOrderStatus(currentOrder.order_status);

                setOrderItems(
                  (currentOrder.items || []).map((item: any) => {
                    const dish = dishes.find(d => d.id === item.dish_id);

                    return {
                      id: item.dish_id,
                      name: dish ? dish.name : item.dish_id,
                      price: dish ? dish.price : 0,
                      quantity: item.quantity,
                      image: dish ? dish.picture : '',
                      instructions: item.instructions || ''
                    };
                  })
                );

                return;
              }
            }
          } else {
            // Remove booking ID if not active
            localStorage.removeItem('currentBookingId');
          }
        } catch (error) {
          console.error('Error checking booking status:', error);
        }
      }

      // Fallback to checkAuthAndBooking result (for new/other orders)
      if (result.orders && result.orders.length > 0) {
        setHasActiveOrder(true);
        const allOrderItems = result.orders.flatMap((order: any) =>
          (order.items || []).map((item: any) => {
            const dish = dishes.find(d => d.id === item.dish_id);
            return {
              id: item.dish_id,
              name: dish ? dish.name : item.dish_id,
              price: dish ? dish.price : 0,
              quantity: item.quantity,
              image: dish ? dish.picture : '',
              instructions: item.instructions || ''
            };
          })
        );
        setOrderItems(allOrderItems);
      } else {
        // Check for active order in local storage
        const currentOrder = localStorage.getItem('currentOrder');
        if (currentOrder) {
          const parsedOrder = JSON.parse(currentOrder);
          setOrderItems(parsedOrder);
          setHasActiveOrder(true);
        } else {
          // No current order found, create a new booking
          const now = new Date();
          const bookingDetails = {
            table_id: tableNumber, // Replace with actual table id if needed
            booking_date: now.toISOString(),
            booking_time: now.toISOString(),
            from_time: now.toISOString()
          };
          try {
            const newBookingResp = await cafeAPI.createBooking(bookingDetails);
            if (newBookingResp.success && newBookingResp.data && newBookingResp.data.id) {
              localStorage.setItem('currentBookingId', newBookingResp.data.id);
            } else {
              console.error('Failed to create booking:', newBookingResp.message || 'Unknown error');
            }
          } catch (err) {
            console.error('Error creating new booking:', err);
          }
          setHasActiveOrder(false);
        }
      }
    };

    checkAuthAndBooking();
  }, [dishes]); // <-- run when dishes are loaded

  const handleFinishOrder = () => {
    navigate('order-confirmation')
    setShowOrderStatus(false);
  };

  const fetchData = useCallback(async () => {
    try {
      // Check authentication first
      const checkAuthAndBookingResult = await cafeAPI.checkAuthAndBooking();
      setIsAuthenticated(checkAuthAndBookingResult.isAuthenticated);

      if (checkAuthAndBookingResult.isAuthenticated) {
        // If authenticated, fetch all data in parallel
        const [categoriesData, dishesData, bannerData] = await Promise.all([
          cafeAPI.getCategories(),
          cafeAPI.getDishes(),
          cafeAPI.getBanners()
        ]);

        // Set banners
        setBanners(bannerData);

        // Set categories
        const formattedCategories = categoriesData.map((cat: any) => ({
          ...cat,
          created_at: new Date(cat.created_at),
          updated_at: new Date(cat.updated_at)
        }));
        setCategories(formattedCategories);

        // Set dishes
        setDishes(dishesData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [setCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const storedBookingId = localStorage.getItem('currentBookingId')
      const storedOrderId = localStorage.getItem('currentOrderId')

      if (storedBookingId && storedOrderId) {
        try {
          const orderDetails = await cafeAPI.getOrdersByID()
          // If orderDetails.data is an array, find the order by ID
          let currentOrder = null;
          if (Array.isArray(orderDetails.data)) {
            currentOrder = orderDetails.data.find((order: any) => order.id === storedOrderId);
          } else {
            // If it's a single object, use it directly
            currentOrder = orderDetails.data;
          }
          if (orderDetails.success && currentOrder && currentOrder.id === storedOrderId) {
            setHasActiveOrder(true);
            setOrderItems(
              (currentOrder.items || []).map((item: any) => ({
                id: item.dish_id,
                name: 'Sample Dish', // Placeholder
                price: 100,          // Placeholder
                quantity: item.quantity,
                image: '/placeholder-dish.jpg', // Placeholder image path
                instructions: item.instructions || ''
              }))
            );
            return;
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white pb-24"
    >
      {/* Add logo and header */}
      <header className="bg-white p-4 mb-4">
        <div className="flex items-center justify-center">
          <img src="/jeeviclogo.png" alt="Jeevic Logo" className="h-12 w-auto" />
        </div>
      </header>

      <div className="mx-4">
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
          className="mt-6"
        >
          <SearchBar
            onSearch={(query) => setSearchQuery(query)}
            showFilter={false}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Our Categories</h2>
          <CategoryGrid
            categories={filteredCategories.map((cat: IDishCategory) => ({
              id: cat.id,
              name: cat.name,
              image: cat.picture,
              is_available: true
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
            className={`fixed right-0 top-[20%] w-[90%] max-w-sm bg-white shadow-lg rounded-l-2xl z-50 transform transition-transform duration-300 ease-in-out h-[70vh] ${showOrderStatus ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-center mb-4">
                {/* Order Status Drawer content */}
                <div className="flex flex-col items-center">
                  {orderStatus === 'cancelled' ? (
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center mb-2">
                      <img
                        src={`/${orderStatus}.gif`}
                        alt={`${orderStatus} status`}
                        className="w-18 h-18 object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-orange-500">
                    {orderStatus === 'pending' ? 'Order Received' :
                      orderStatus === 'received' ? 'Order Received' :
                        orderStatus === 'preparing' ? 'Preparing Your Order' :
                          orderStatus === 'served' ? 'Order Served' :
                            orderStatus === 'ready' ? 'Ready to Bill' :
                              orderStatus === 'cancelled' ? 'Order Cancelled' :
                                'Processing Order'}
                  </h3>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    {orderStatus === 'pending' ? 'We have received your order!' :
                      orderStatus === 'received' ? 'We have received your order!' :
                        orderStatus === 'preparing' ? 'Our chefs are preparing your delicious meal!' :
                          orderStatus === 'served' ? 'Enjoy your meal!' :
                            orderStatus === 'ready' ? 'Your bill is ready' :
                              orderStatus === 'cancelled' ? 'Your order has been cancelled.' :
                                'Processing your order...'}
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
          onClick={async () => {
            try {
              const tableId = localStorage.getItem('currentTableId') || '';
              const response = await cafeAPI.requestAssistance(tableId);
              if (response.data.success === false) {
                setNotificationMessage(response.data.message); // Use the message from response
              } else {
                setNotificationMessage('Your assistance is on the way!');
              }

              setShowNotification(true);
              setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage('Your assistance is on the way!'); // Reset message
              }, 3000);
            } catch (error) {
              console.error('Error requesting assistance:', error);
              setNotificationMessage('Failed to request assistance');
              setShowNotification(true);
              setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage('Your assistance is on the way!'); // Reset message
              }, 3000);
            }
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

      {/* Update the Notification Toast to use dynamic message */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && (
        <AuthOverlay
          onPhoneSignIn={async () => {
            setIsAuthenticated(true);
            try {
              // Fetch all data in parallel
              const [bannersData, categoriesData, dishesData] = await Promise.all([
                cafeAPI.getBanners(),
                cafeAPI.getCategories(),
                cafeAPI.getDishes()
              ]);

              // Update all states
              setBanners(bannersData);
              setDishes(dishesData);

              const formattedCategories = categoriesData.map((cat: any) => ({
                ...cat,
                created_at: new Date(cat.created_at),
                updated_at: new Date(cat.updated_at)
              }));
              setCategories(formattedCategories);
            } catch (error) {
              console.error('Error fetching data after auth:', error);
            }
          }}
        />
      )}
    </motion.div>
  )
}
