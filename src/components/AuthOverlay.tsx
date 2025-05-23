import { FC, useState, useEffect } from 'react'
import { cafeAPI } from '../libs/api/cafeAPI'
import { tokenUtils } from '../libs/utils/token'

interface AuthOverlayProps {
  onPhoneSignIn: (userData: { phone: string }) => void
}

export const AuthOverlay: FC<AuthOverlayProps> = ({
  onPhoneSignIn
}) => {
  const [showOTP, setShowOTP] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOTP] = useState(['', '', '', '', '', '']) // Changed to 6 digits
  const [bookingDetails] = useState({
    table_id: '3343434',
    booking_date: '',
    booking_time: '',
    from_time: ''
  })

  useEffect(() => {
    // Check if there's a valid token on mount
    if (cafeAPI.checkAuth()) {
      const token = tokenUtils.getToken()
      if (token) {
        onPhoneSignIn({ phone: `+91${phoneNumber}` })
      }
    }
  }, [])

  // Add this with other state declarations at the top
  const [isLoading, setIsLoading] = useState(false)

  // Update handleContinue function
  const handleContinue = async () => {
    try {
      setIsLoading(true)
      if (!showOTP) {
        await cafeAPI.loginRequest(phoneNumber)
        setShowOTP(true)
        setTimer(30)
      } else {
        const otpString = otp.join('')
        const response = await cafeAPI.verifyOTP(phoneNumber, otpString)
        if (response.access_token) {
          try {
            const now = new Date()
            const formattedDate = now.toISOString().split('T')[0]
            const formattedTime = now.toISOString().slice(0, 19)
  
            const bookingResponse = await cafeAPI.createBooking({
              ...bookingDetails,
              booking_date: formattedDate,
              booking_time: formattedTime,
              from_time: formattedTime
            })
            
            if (bookingResponse.success && bookingResponse.data && bookingResponse.data.id) {
              localStorage.setItem('currentBookingId', bookingResponse.data.id)
            }
          } catch (bookingError) {
            console.error('Failed to create booking:', bookingError)
          }
          // Move these outside the try-catch to ensure they run regardless of booking success/failure
          setShowOTP(false)
          onPhoneSignIn({
            phone: `+91${phoneNumber}`
          })
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleResendOTP = async () => {
    try {
      await cafeAPI.loginRequest(phoneNumber)
      setTimer(30)
    } catch (error) {
      console.error('Failed to resend OTP:', error)
      // Here you might want to show an error message to the user
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOTP(newOTP)

    // Auto focus next input if there's a value and not the last digit
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name='otp-${index + 1}']`) as HTMLInputElement
      if (nextInput) nextInput.focus()
    }

    // If pasting multiple digits
    if (value.length > 1) {
      const pastedValues = value.slice(0, 6 - index).split('')
      const updatedOTP = [...otp]
      pastedValues.forEach((digit, i) => {
        if (index + i < 6) {
          updatedOTP[index + i] = digit
        }
      })
      setOTP(updatedOTP)
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = updatedOTP.findIndex((digit, i) => i > index && !digit)
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        const nextInput = document.querySelector(`input[name='otp-${nextEmptyIndex}']`) as HTMLInputElement
        if (nextInput) nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name='otp-${index - 1}']`) as HTMLInputElement
      if (prevInput) {
        prevInput.focus()
        const newOTP = [...otp]
        newOTP[index - 1] = ''
        setOTP(newOTP)
      }
    }
  }

  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
  
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-8 space-y-6 shadow-xl">
        <div className="text-center mb-6">
          <img src="/jeeviclogo.png" alt="Jeevic" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">
            {!showOTP ? 'Welcome to Jeevic' : 'Verify Your Number'}
          </h2>
        </div>
  
        <div className="space-y-6">
          {!showOTP ? (
            <div className="flex items-center border-2 rounded-xl p-4 gap-3 focus-within:border-orange-500 transition-colors">
              <span className="text-gray-600 font-medium text-lg">+91</span>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="flex-1 outline-none text-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Enter the 6-digit code sent to<br />
                <span className="font-medium text-gray-800">+91 {phoneNumber}</span>
              </p>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp-${index}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center border-2 rounded-xl outline-none text-xl font-semibold focus:border-orange-500 transition-colors"
                  />
                ))}
              </div>
              <div className="text-center mt-6">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">Resend code in {timer}s</p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}
  
          <button
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-medium disabled:opacity-70 relative hover:bg-orange-600 transition-colors text-lg shadow-lg shadow-orange-500/30"
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
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
                <span>{showOTP ? 'Verifying...' : 'Sending OTP...'}</span>
              </div>
            ) : (
              <span>{showOTP ? 'Verify' : 'Continue'}</span>
            )}
          </button>
  
          {/* <p className="text-xs text-center text-gray-500 mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="text-orange-500 hover:underline">
              Terms & Conditions
            </a>
          </p> */}
        </div>
      </div>
    </div>
  );
}