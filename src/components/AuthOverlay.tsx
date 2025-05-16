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

  const handleContinue = async () => {
    try {
      if (!showOTP) {
        await cafeAPI.loginRequest(phoneNumber)
        setShowOTP(true)
        setTimer(30)
      } else {
        const otpString = otp.join('')
        const response = await cafeAPI.verifyOTP(phoneNumber, otpString)
        if (response.access_token) {
          // OTP verified successfully, now create the booking
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
            console.log('Booking created:', bookingResponse)
            
            // Store the booking ID in local storage
            if (bookingResponse.success && bookingResponse.data && bookingResponse.data.id) {
              localStorage.setItem('currentBookingId', bookingResponse.data.id)
            }
            
            onPhoneSignIn({
              phone: `+91${phoneNumber}`
            })
          } catch (bookingError) {
            console.error('Failed to create booking:', bookingError)
            // Handle booking creation error (e.g., show an error message to the user)
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      // Handle authentication error (e.g., show an error message to the user)
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-6 space-y-6">
        <div className="space-y-4">
          {!showOTP ? (
            <div className="flex items-center border rounded-xl p-3 gap-2">
              <span className="text-gray-600">+91</span>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="flex-1 outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-gray-600">
                Enter the 6-digit code sent to +91 {phoneNumber}
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp-${index}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center border rounded-xl outline-none text-lg" // Adjusted width for 6 digits
                  />
                ))}
              </div>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in {timer}s</p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm text-orange-500 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* <p className="text-[12px] text-center text-gray-500">
            By clicking continue you agree to our{' '}
            <a href="#" className="text-orange-500">
              Terms & Conditions
            </a>
          </p> */}

          <button
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
            onClick={handleContinue}
          >
            {showOTP ? 'Confirm' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}