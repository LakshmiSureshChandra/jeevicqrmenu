import { Banner } from '../components/Banner'
import { SearchBar } from '../components/SearchBar'
import { CategoryGrid } from '../components/CategoryGrid'
import { AuthOverlay } from '../components/AuthOverlay'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from'react'
import { motion } from 'framer-motion'

export const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const categories = [
    { name: 'Burger', image: '/burgerfeast.webp' },
    { name: 'Rice items', image: '/pizzaparty.jpg' },
    { name: 'Popular', image: '/pizzaparty.jpg' },
    { name: 'Deals', image: '/pizzaparty.jpg' },
    { name: 'Wraps', image: '/pizzaparty.jpg' },
    { name: 'Pizza', image: '/pizzaparty.jpg' },
  ]
  const banners = [
    {
      title: "Pizza Party",
      description: "Enjoy pizza from Johnny and get upto 30% off",
      price: "₹100",
      image: "/pizzaparty.jpg"
    },
    {
      title: "Burger Fest",
      description: "Get your favorite burgers with special sauce",
      price: "₹80",
      image: "/burgerfeast.webp"
    },
    // Add more banners as needed
  ]
  const [savedOrders, setSavedOrders] = useState<any[][]>([])
  const [hasActiveOrder, setHasActiveOrder] = useState(false)

  useEffect(() => {
    const currentOrder = localStorage.getItem('currentOrder')
    setHasActiveOrder(!!currentOrder)
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
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
          <CategoryGrid categories={categories} />
        </motion.div>
      </div>

      {/* Floating Action Button - Only show when there's an active order */}
      {hasActiveOrder && (
        <button
          onClick={() => {
            const currentOrder = localStorage.getItem('currentOrder')
            if (currentOrder) {
              const items = JSON.parse(currentOrder)
              navigate('/checkout', { state: { items, directConfirm: true } })
            }
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center"
        >
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
            !
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      )}

      {!isAuthenticated && (
        <AuthOverlay
          onGoogleSignIn={() => {
            setIsAuthenticated(true)
          }}
          onAppleSignIn={() => {
            setIsAuthenticated(true)
          }}
          onPhoneSignIn={(phone) => {
            setIsAuthenticated(true)
          }}
        />
      )}
    </motion.div>
  )
}
