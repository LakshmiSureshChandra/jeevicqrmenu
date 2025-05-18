import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import './styles/global.css'
import { Home } from './pages/Home'
import { CategoryPage } from './pages/CategoryPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderProvider } from './contexts/OrderContext'
import { CategoryProvider } from './contexts/CategoryContext'

// New ThankYouPage component
const ThankYouPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear navigation history
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      navigate('/');
    };

    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">Thank You for Visiting Jeevic</h1>
      <p className="text-xl text-gray-600 mb-8">We hope you enjoyed your meal!</p>
    </div>
  );
};

// New TableRedirect component
const TableRedirect = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableId) {
      localStorage.setItem('currentTableId', tableId);
      navigate('/');
    }
  }, [tableId, navigate]);

  return null;
};

function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Mobile Only</h2>
          <p className="text-gray-600">
            This website is only available on mobile devices. Please open it on your smartphone or tablet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <OrderProvider>
      <CategoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/book-table/:tableId" element={<TableRedirect />} />
          </Routes>
        </Router>
      </CategoryProvider>
    </OrderProvider>
  )
}

export default App
