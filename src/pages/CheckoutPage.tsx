import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useOrderStatus } from '../contexts/OrderContext'
import { cafeAPI } from '../libs/api/cafeAPI'  // Import cafeAPI

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}

import { useEffect } from 'react'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    return location.state?.items || []
  })

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [tempInstructions, setTempInstructions] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasPastOrders, setHasPastOrders] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('Your assistance is on the way!')
  const { orderStatus, setOrderStatus } = useOrderStatus();
  const [orderStatusPolling, setOrderStatusPolling] = useState<NodeJS.Timeout | null>(null);
  const [tableNumber, setTableNumber] = useState('')
  const storedTableId = localStorage.getItem('currentTableId')
  const [isConfirming, setIsConfirming] = useState(false)
  useEffect(() => {
    if (storedTableId) {
      setTableNumber(storedTableId)
    }
  }, [])

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

    // Start polling when order is confirmed
    if (orderStatus !== 'cancelled') {
      const intervalId = setInterval(pollOrderStatus, 10000); // Poll every 10 seconds
      setOrderStatusPolling(intervalId);
    }

    return () => {
      if (orderStatusPolling) {
        clearInterval(orderStatusPolling);
      }
    };
  }, [orderStatus, setOrderStatus]);

  // Check for past orders on mount
  useEffect(() => {
    const checkPastOrders = async () => {
      const bookingId = localStorage.getItem('currentBookingId');
      if (!bookingId) {
        setHasPastOrders(false);
        return;
      }
      // getOrdersById expects bookingId
      const ordersResp = await cafeAPI.getOrdersByID();
      if (ordersResp.success && Array.isArray(ordersResp.data) && ordersResp.data.length > 0) {
        setHasPastOrders(true);
      } else {
        setHasPastOrders(false);
      }
    };
    checkPastOrders();
  }, []);

  const handleInstructionsClick = (itemId: string) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null)
    } else {
      setExpandedItemId(itemId)
      const item = orderItems.find((item: OrderItem) => item.id === itemId)
      setTempInstructions(item?.instructions || '')
    }
  }

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change
          return newQuantity < 1 ? null : { ...item, quantity: newQuantity }
        }
        return item
      })
      return updatedItems.filter((item): item is OrderItem => item !== null)
    })
  }

  const saveInstructions = (itemId: string) => {
    setOrderItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, instructions: tempInstructions }
        : item
    ))
    setExpandedItemId(null)
  }

  const clearInstructions = (itemId: string) => {
    setTempInstructions('')
    setOrderItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, instructions: '' }
        : item
    ))
    setExpandedItemId(null)
  }

  const totalBill = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleConfirmOrder = async () => {
    try {
      setIsConfirming(true)
      const orderData = {
        table_id: tableNumber,
        booking_id: localStorage.getItem('currentBookingId') || '',
        items: orderItems.map(item => ({
          dish_id: item.id,
          quantity: item.quantity,
          instructions: item.instructions
        }))
      };
  
      const response = await cafeAPI.createOrder(orderData);
      if (response.success) {
        if (!localStorage.getItem('currentOrderId')) {
          localStorage.setItem('currentOrderId', response.data.data.id);
        }
        setOrderStatus('received');
        navigate('/order-confirmation', { state: { orderItems } });
      } else {
        throw new Error('Failed to create/update order');
      }
    } catch (error) {
      console.error('Error creating/updating order:', error);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsConfirming(false)
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white flex flex-col"
    >
      <div className="flex-1 p-4 space-y-4">
        <AnimatePresence>
          {orderItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-white rounded-3xl p-4"
            >
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex-col">
                    <h3 className="font-medium text-[15px] text-gray-800">{item.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-orange-500 text-sm">★</span>
                      <span className="text-sm text-gray-600">4.9</span>
                      <span className="text-sm text-gray-400">(120 ratings)</span>
                    </div>
                    <div className="text-orange-500 text-lg mt-1">₹{item.price}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500"
                    onClick={() => updateQuantity(item.id, -1)}
                  >−</button>
                  <span className="text-lg w-4 text-center">{item.quantity}</span>
                  <button
                    className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500"
                    onClick={() => updateQuantity(item.id, 1)}
                  >+</button>
                </div>
              </div>

              <button
                className="mt-3 flex items-center gap-2 text-gray-500 text-sm w-full py-2 px-4 bg-gray-50 rounded-xl"
                onClick={() => handleInstructionsClick(item.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {item.instructions || 'Add Custom Instructions'}
              </button>

              {expandedItemId === item.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={tempInstructions}
                    onChange={(e) => setTempInstructions(e.target.value)}
                    placeholder="Add your special instructions here..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveInstructions(item.id)}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => clearInstructions(item.id)}
                      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="bg-white rounded-3xl p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <svg className="text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h18M3 14h18M3 18h18M3 6h18" />
              </svg>
              <div>
                <div className="text-gray-400">Table</div>
                <div className="text-xl font-medium">{storedTableId}</div>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Bill</div>
              <div className="text-xl font-semibold text-orange-500">₹{totalBill}</div>
              <div className="text-xs text-gray-400">
                Incl. of all Taxes and Charges
              </div>
            </div>
            <button className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-orange-500">X {item.quantity}</span>
                  </div>
                  <span className="text-gray-500">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="p-4 space-y-3"
      >
        <button
          onClick={handleRequestAssistance}
          className="w-full bg-white border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg"
        >
          Request Assistance
        </button>
        <button
  onClick={handleConfirmOrder}
  disabled={isConfirming}
  className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-70"
>
  {isConfirming ? (
    <div className="flex items-center justify-center gap-2">
      <svg 
        className="animate-spin h-5 w-5 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Confirming Order...</span>
    </div>
  ) : (
    'Confirm Order'
  )}
</button>
      </motion.div>

      {/* Side button for past orders */}
      {hasPastOrders && (
        <button
          className="fixed right-6 bottom-32 z-50 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg"
          onClick={() => {
            // Implement your logic to show past orders
            navigate('/past-orders');
          }}
        >
          View Past Orders
        </button>
      )}

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
          {notificationMessage}
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  )
}
