import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStatus } from '../contexts/OrderContext'
// Remove unused import
// import { tokenUtils } from '../libs/utils/token'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}

export const OrderConfirmationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setOrderStatus } = useOrderStatus()
  const [orderItems] = useState<OrderItem[]>(location.state?.orderItems || [])
  const [tableNumber] = useState(location.state?.tableNumber || '')
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    setOrderStatus('received')
  }, [setOrderStatus])

  const totalBill = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleRequestAssistance = () => {
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const [isFinished, setIsFinished] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [ratings, setRatings] = useState<{[key: string]: number}>({})

  const handleFinishOrder = () => {
    setShowConfirmDialog(true)
  }

  const confirmFinishOrder = () => {
    setIsFinished(true)
    setShowConfirmDialog(false)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const cancelFinishOrder = () => {
    setShowConfirmDialog(false)
  }

  const handleRating = (itemId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }))
  }

  const handleConfirmRatings = () => {
    setIsFinished(true)
    setShowRatingDialog(false)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
    // Here you can send the ratings to your backend if needed
    console.log('Ratings:', ratings)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col p-4"
    >
      <div className="bg-white rounded-3xl p-6 text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">Order Received</h2>
        <p className="text-gray-600">Your Order has been received and our chefs will start preparing your order soon!</p>
      </div>

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
          <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
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
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg"
            >
              Order More
            </button>
            <button 
              onClick={handleFinishOrder}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg"
            >
              Finish Order
            </button>
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
            <h3 className="text-xl font-semibold mb-4">Finish Order?</h3>
            <p className="mb-6">Are you sure you want to finish this order?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelFinishOrder}
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
            {isFinished ? "Thank you for your feedback!" : "Your assistance is on the way!"}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Rating Dialog */}
      {showRatingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Rate Your Order</h3>
            {orderItems.map((item) => (
              <div key={item.id} className="mb-4">
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(item.id, star)}
                      className={`text-2xl ${
                        (ratings[item.id] || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
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
              className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4"
            >
              Confirm Ratings
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}