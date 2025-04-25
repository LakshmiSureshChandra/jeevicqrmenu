import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  instructions?: string
}

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orderItems, setOrderItems] = useState<OrderItem[]>(location.state?.items || [])
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [tempInstructions, setTempInstructions] = useState('')
  
  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change)
        return newQuantity === 0 
          ? null 
          : { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean) as OrderItem[])
  }

  const handleInstructionsClick = (itemId: string) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null)
    } else {
      setExpandedItemId(itemId)
      const item = orderItems.find(i => i.id === itemId)
      setTempInstructions(item?.instructions || '')
    }
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        {orderItems.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-4">
            <div className="flex gap-4">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col">
                  <h3 className="font-medium text-[15px] text-gray-800">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-orange-500 text-sm">★</span>
                    <span className="text-sm text-gray-600">4.9</span>
                    <span className="text-sm text-gray-400">(120 reviews)</span>
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
          </div>
        ))}

        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h18M3 14h18M3 18h18M3 6h18"/>
            </svg>
            <span>Table EX04</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-gray-600">Total Bill</div>
            <div className="text-xl font-semibold text-orange-500">₹{totalBill}</div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Incl. of all Taxes and Charges
          </div>
        </div>
      </div>

      <div className="p-4">
        <button 
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg"
        >
          Confirm Order
        </button>
      </div>
    </div>
  )
}