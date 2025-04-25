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
  // Initialize cartItems with items from localStorage if they exist
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cartItems')
    return savedCart ? JSON.parse(savedCart) : []
  })
  
  // This would typically come from an API
  const categories: Category[] = [
    { name: 'Popular', count: 46 },
    { name: 'Deals', count: 62 },
    { name: 'Wraps', count: 17 },
    { name: 'Pizzas', count: 28 },
    { name: 'Burger', count: 35 },
    { name: 'Rice items', count: 42 }
  ]

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Classic Power Bowl',
      description: 'Fresh vegetables with grilled chicken',
      price: 141,
      image: '/burgerfeast.webp',
      rating: 5.0,
      category: 'Popular'
    },
    {
      id: '2',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with fresh basil',
      price: 199,
      image: '/pizzaparty.jpg',
      rating: 4.8,
      category: 'Pizzas'
    },
    {
      id: '3',
      name: 'Chicken Wrap',
      description: 'Grilled chicken with fresh veggies',
      price: 159,
      image: '/burgerfeast.webp',
      rating: 4.5,
      category: 'Wraps'
    },
    {
      id: '4',
      name: 'Special Burger',
      description: 'Double patty with cheese and special sauce',
      price: 249,
      image: '/burgerfeast.webp',
      rating: 4.9,
      category: 'Burger'
    },
    {
      id: '5',
      name: 'Chicken Biryani',
      description: 'Aromatic rice with tender chicken pieces',
      price: 299,
      image: '/pizzaparty.jpg',
      rating: 4.7,
      category: 'Rice items'
    },
    {
      id: '6',
      name: 'Combo Meal Deal',
      description: 'Burger + Fries + Drink',
      price: 399,
      image: '/burgerfeast.webp',
      rating: 4.6,
      category: 'Deals'
    },
    {
      id: '7',
      name: 'Veggie Supreme Pizza',
      description: 'Loaded with fresh vegetables',
      price: 249,
      image: '/pizzaparty.jpg',
      rating: 4.4,
      category: 'Pizzas'
    },
    {
      id: '8',
      name: 'Falafel Wrap',
      description: 'Middle eastern wrap with hummus',
      price: 179,
      image: '/burgerfeast.webp',
      rating: 4.3,
      category: 'Wraps'
    }
  ]

  const filteredItems = category 
    ? menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase())
    : menuItems

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      const newCart = existingItem
        ? prev.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { ...item, quantity: 1 }]
      
      // Save to localStorage after updating
      localStorage.setItem('cartItems', JSON.stringify(newCart))
      return newCart
    })
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const itemNames = cartItems.length > 0 
    ? cartItems[0].name + (cartItems.length > 1 ? '...' : '')
    : ''

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pb-24 relative"
    >
      <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3">
        <SearchBar />
        
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
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full mt-3 bg-white text-orange-500 border border-orange-500 rounded-full py-1.5 text-[13px] font-medium flex items-center justify-center"
                >
                  Add to Order
                  <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1 text-sm leading-none">+</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <img src="/spoonandfork.png" alt="" className="w-6 h-6" />
              <div>
                <div className="font-medium">{itemNames}</div>
                <div className="bg-gray-700/20 rounded-full pl-2 items-center flex justify-start text-[10px] text-white/80">+ {totalItems} more Items</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout', { state: { items: cartItems } })}
              className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
            >
              Proceed to Order
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}