import { useParams, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  rating: number
  category: string
}

interface Category {
  name: string
  count: number
}

interface CartItem extends MenuItem {
  quantity: number
}

export const CategoryPage = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  
  // Clear cart items when component mounts
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    ratings: [] as number[],
    priceRange: ''
  })

  // Sample menu items data
  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce and mozzarella',
      price: 299,
      image: '/pizza1.jpg',
      rating: 4.5,
      category: 'Pizza'
    },
    {
      id: '2',
      name: 'Chicken Burger',
      description: 'Juicy chicken patty with fresh veggies',
      price: 199,
      image: '/burger1.jpg',
      rating: 4.2,
      category: 'Burger'
    },
    {
      id: '3',
      name: 'Veg Supreme Pizza',
      description: 'Loaded with fresh vegetables and cheese',
      price: 349,
      image: '/pizza2.jpg',
      rating: 4.0,
      category: 'Pizza'
    },
    {
      id: '4',
      name: 'Double Cheese Burger',
      description: 'Extra cheesy burger with double patty',
      price: 249,
      image: '/burger2.jpg',
      rating: 4.8,
      category: 'Burger'
    },
    {
      id: '5',
      name: 'Chicken Biryani',
      description: 'Aromatic rice with tender chicken pieces',
      price: 399,
      image: '/rice1.jpg',
      rating: 4.6,
      category: 'Rice items'
    },
    {
      id: '6',
      name: 'Veg Fried Rice',
      description: 'Stir-fried rice with mixed vegetables',
      price: 199,
      image: '/rice2.jpg',
      rating: 4.1,
      category: 'Rice items'
    },
    {
      id: '7',
      name: 'Chicken Wrap',
      description: 'Grilled chicken with fresh veggies in tortilla',
      price: 179,
      image: '/wrap1.jpg',
      rating: 4.3,
      category: 'Wraps'
    }
  ]

  // Sample categories data
  const categories: Category[] = [
    { name: 'All', count: menuItems.length },
    { name: 'Pizza', count: menuItems.filter(item => item.category === 'Pizza').length },
    { name: 'Burger', count: menuItems.filter(item => item.category === 'Burger').length },
    { name: 'Rice items', count: menuItems.filter(item => item.category === 'Rice items').length },
    { name: 'Wraps', count: menuItems.filter(item => item.category === 'Wraps').length }
  ]

  // Filter items based on search query and filters
  const filteredItems = category 
    ? menuItems
        .filter(item => item.category.toLowerCase() === category.toLowerCase())
        .filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.description.toLowerCase().includes(searchQuery.toLowerCase())
          
          const matchesRating = activeFilters.ratings.length === 0 || 
                              activeFilters.ratings.includes(Math.floor(item.rating))
          
          let matchesPrice = true
          if (activeFilters.priceRange) {
            const [min, max] = activeFilters.priceRange.split('-').map(Number)
            matchesPrice = max === undefined 
              ? item.price >= min
              : item.price >= min && item.price <= max
          }

          return matchesSearch && matchesRating && matchesPrice
        })
    : menuItems

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilters = (filters: { ratings: number[], priceRange: string }) => {
    setActiveFilters(filters)
  }

  // Add to cart function
  // Modify addToCart to save to localStorage
  const addToCart = (item: MenuItem) => {
    const cartItem = cartItems.find(i => i.id === item.id)
    if (!cartItem) {
      const newCartItems = [...cartItems, { ...item, quantity: 1 }]
      setCartItems(newCartItems)
      localStorage.setItem('cartItems', JSON.stringify(newCartItems))
    }
  }

  // Modify updateQuantity to save to localStorage
  const updateQuantity = (itemId: string, change: number) => {
    setCartItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
        }
        return item
      }).filter((item): item is CartItem => item !== null)
      
      localStorage.setItem('cartItems', JSON.stringify(updatedItems))
      return updatedItems
    })
  }

  // Calculate cart summary
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Modify the cart summary text creation
  const getCartSummaryText = () => {
    if (cartItems.length === 0) return ''
    
    const firstItem = cartItems[0]
    const remainingCount = cartItems.length - 1
    
    const firstItemText = `${firstItem.quantity}x ${firstItem.name}`
    if (remainingCount === 0) return firstItemText
    
    return `${firstItemText} + ${remainingCount} more item${remainingCount > 1 ? 's' : ''}`
  }

  // Add function to get item quantity from cart
  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId)
    return cartItem?.quantity || 0
  }


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pb-24 relative"
    >
      <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3">
        <SearchBar 
          showFilter={true} 
          onSearch={handleSearch}
          onApplyFilters={handleFilters}
        />
        
        {/* Scrollable Categories */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 -mx-4 px-4"
        >
          <div className="flex gap-8 overflow-x-auto overflow-y-hidden pb-3 scrollbar-hide border-b border-gray-200 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  category?.toLowerCase() === cat.name.toLowerCase()
                    ? 'text-orange-500 border-b-2 border-orange-500 -mb-[13px] pb-2'
                    : 'text-gray-500'
                }`}
              >
                <span className="text-sm font-medium">{cat.name}</span>
                <span className={`text-xs ${
                  category?.toLowerCase() === cat.name.toLowerCase()
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
          </motion.div>
    </div>

    {/* Rest of the content */}
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="p-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div 
            key={item.id} 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="bg-white rounded-2xl p-4 flex flex-col"
          >
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full aspect-square rounded-xl object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-2xl px-2 py-1 flex items-center gap-1">
                <span className="text-orange-500 text-sm">★</span>
                <span className="text-sm">{item.rating}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[13px]">{item.name}</h3>
                <span className="font-medium pl-2 text-[15px] text-gray-400">₹{item.price}</span>
              </div>
              
              {getItemQuantity(item.id) > 0 ? (
                <div className="flex items-center justify-between mt-3 border border-orange-500 rounded-full py-1.5">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 text-orange-500 font-medium"
                  >
                    -
                  </button>
                  <span className="text-[13px] font-medium">{getItemQuantity(item.id)}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 text-orange-500 font-medium"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full mt-3 bg-white text-orange-500 border border-orange-500 rounded-full py-1.5 text-[13px] font-medium flex items-center justify-center"
                >
                  Add to Order
                  <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1 text-sm leading-none">+</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {cartItems.length > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src="/spoonandfork.png" alt="" className="w-6 h-6 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">{getCartSummaryText()}</div>
              <div className="bg-gray-700/20 rounded-full w-[60px] pl-2 items-center flex justify-start text-[10px] text-white/80">
                {totalItems} items
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout', { state: { items: cartItems } })}
            className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 flex-shrink-0"
          >
            Proceed to Order
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    )}
  </motion.div>
  )}
