import { createContext, useContext, useState, ReactNode } from 'react'

type OrderStatus = 'pending' | 'served' | 'ready' | 'preparing' | 'cancelled' | 'received' | string;

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

export const useOrderStatus = () => {
  const context = useContext(OrderContext); // Changed from OrderStatusContext to OrderContext
  if (!context) {
    throw new Error('useOrderStatus must be used within an OrderStatusProvider');
  }
  return context; // Return the entire context instead of destructuring
};