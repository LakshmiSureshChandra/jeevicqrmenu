import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStatus } from '../contexts/OrderContext'
import { cafeAPI } from '../libs/api/cafeAPI'
import tableIcon from '../../public/table.png'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
  dish_id: string
}

export const OrderConfirmationPage = () => {
  const navigate = useNavigate()
  const { orderStatus, setOrderStatus } = useOrderStatus()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [, setDishes] = useState<any[]>([])
  const [orderStatusPolling, setOrderStatusPolling] = useState<ReturnType<typeof setInterval> | null>(null)
  const [notificationMessage, setNotificationMessage] = useState('Your assistance is on the way!')
  const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = localStorage.getItem('currentOrderId')
        const storedTableId = localStorage.getItem('currentTableId')
        if (!orderId) {
          throw new Error('No order ID found')
        }
        // Fetch orders and dishes concurrently
        const [orderResponse, dishesResponse] = await Promise.all([
          cafeAPI.getOrdersByID(),
          cafeAPI.getDishes()
        ])

        if (orderResponse.success && orderResponse.data) {
          const orderData = Array.isArray(orderResponse.data) ? orderResponse.data[0] : orderResponse.data;
          setDishes(dishesResponse);

          // Map order items with dish details
          const mappedOrderItems = (orderData.items || []).map((item: any) => {
            const dish = dishesResponse.find((d: any) => d.id === item.dish_id);
            return {
              id: item.dish_id,
              dish_id: item.dish_id,
              name: dish ? dish.name : item.dish_id,
              price: dish ? dish.price : 0,
              quantity: item.quantity,
              image: dish ? dish.picture : '',
              instructions: item.instructions || ''
            };
          });

          setOrderItems(mappedOrderItems);
          setTableNumber(storedTableId || ''); // Set the table number from localStorage
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    setOrderStatus('received');
  }, [setOrderStatus]);

  const totalBill = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Update the handleRequestAssistance function
  const handleRequestAssistance = async () => {
    try {
      const tableId = localStorage.getItem('currentTableId') || '';
      const response = await cafeAPI.requestAssistance(tableId);
      if (response.data.success === false) {
        setNotificationMessage(response.data.message);
      } else {
        setNotificationMessage('Your assistance is on the way!');
      }

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('Your assistance is on the way!');
      }, 3000);
    } catch (error) {
      console.error('Error requesting assistance:', error);
      setNotificationMessage('Failed to request assistance');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('Your assistance is on the way!');
      }, 3000);
    }
  };



  // Update the notification toast to use the message
  {
    showNotification && (
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
      >
        {notificationMessage}
      </motion.div>
    )
  }
  const [isFinished, setIsFinished] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})

  const handleFinishOrder = () => {
    setShowConfirmDialog(true)
  }

  const confirmFinishOrder = () => {
    setShowConfirmDialog(false)
    setShowRatingDialog(true)
  }

  // Add this new function
  const cancelFinishOrder = () => {
    setShowConfirmDialog(false)
  }

  const handleRating = (id: string, rating: number) => {
    setRatings(prev => ({ ...prev, [id]: rating }))
  }

  useEffect(() => {
    const pollOrderStatus = async () => {
      const orderId = localStorage.getItem('currentOrderId');
      if (orderId) {
        try {
          const orderDetails = await cafeAPI.getOrdersByID();
          const orderData = orderDetails.data;

          let currentOrder = null;
          if (Array.isArray(orderData)) {
            currentOrder = orderData.find(order => order.id === orderId);
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

    // Start polling when component mounts
    const intervalId = setInterval(pollOrderStatus, 10000);
    setOrderStatusPolling(intervalId);
    // Initial poll
    pollOrderStatus();

    return () => {
      if (orderStatusPolling) {
        clearInterval(orderStatusPolling);
      }
    };
  }, [setOrderStatus]);

  // Add this near other useEffect hooks
  useEffect(() => {
    if (showRatingDialog) {
      // Prevent going back when rating dialog is shown
      window.history.pushState(null, '', window.location.pathname);
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showRatingDialog]);

  const handleConfirmRatings = async () => {
    setIsSubmittingRatings(true);
    try {
      // Push ratings to backend
      await cafeAPI.submitRatings(ratings);

      // Create checkout
      const bookingId = localStorage.getItem('currentBookingId');
      if (bookingId) {
        await cafeAPI.createCheckout(bookingId);
      }

      setIsFinished(true);
      setShowRatingDialog(false);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigate('/thank-you', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setError('Failed to submit ratings. Please try again.');
    } finally {
      setIsSubmittingRatings(false);
    }
  };

  // Get unique dishes
  const uniqueDishes = Array.from(new Set(orderItems.map(item => item.id)))
    .map(id => orderItems.find(item => item.id === id))
    .filter((item): item is OrderItem => item !== undefined)

  const OrderStatusDisplay = () => (
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
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white flex flex-col p-4"
    >
      <OrderStatusDisplay />

      <div className="bg-white rounded-3xl p-4 mb-6">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center mb-4 last:mb-0">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover mr-4" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-orange-500">₹ {item.price}</p>
              {item.instructions && (
                <p className="text-sm text-gray-500 mt-1">
                  Instructions: {item.instructions}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-500">Qty. {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-4">
        <div className="flex items-center mb-2">
          <img src={tableIcon} alt="Table" className="w-6 h-6 mr-2" />
          <h3 className="font-semibold">Table {tableNumber}</h3>
        </div>
        <div className="flex justify-between items-center font-semibold">
          <p>Total Bill</p>
          <p>₹ {totalBill}</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">Incl. of all Taxes and Charges</p>
      </div>

      <div className="mt-6 space-y-4">
        {!isFinished ? (
          <>
            <button
              onClick={handleRequestAssistance}
              className="w-full bg-white border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg"
            >
              Request Assistance
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="w-1/2 bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg"
              >
                Order More
              </button>
              <button
                onClick={handleFinishOrder}
                className="w-1/2 bg-black text-white py-4 rounded-xl font-semibold text-lg"
              >
                Finish Order
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Order Finished</h2>
            <p className="text-gray-600 mb-4">Thank you for dining with us!</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Finished ordering everything?</h3>
            <p className="mb-6">Click cancel if you might order more</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelFinishOrder}  // This line now uses the new function
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmFinishOrder}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Themed Notification */}
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
      {/* Rating Dialog */}
      {showRatingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Rate Your Order</h3>
            {uniqueDishes.map((item) => (
              <div key={item.id} className="mb-4">
                <div className="flex items-center">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover mr-3" />
                  <p className="font-medium">{item.name}</p>
                </div>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(item.id, star)}
                      className={`text-3xl ${(ratings[item.id] || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleConfirmRatings}
              disabled={isSubmittingRatings}
              className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 font-semibold disabled:bg-orange-300 flex items-center justify-center gap-2"
            >
              {isSubmittingRatings ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Confirm Ratings'
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Add this new component at the end of the file
export const ThankYouPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl flex-col items-center justify-center font-bold text-orange-500 mb-4">Thank You for Visiting Jeevic</h1>
      <p className="text-xl text-gray-600 mb-8">We hope you enjoyed your meal!</p>
    </div>
  )
}