import { createContext, useContext, useState, ReactNode } from 'react'

type OrderStatus = 'pending' | 'served' | 'ready' | 'preparing' | 'cancelled' | 'received'

interface OrderContextType {
  orderStatus: OrderStatus
  setOrderStatus: (status: OrderStatus) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending')

  return (
    <OrderContext.Provider value={{ orderStatus, setOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrderStatus() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrderStatus must be used within an OrderProvider')
  }
  return context
}