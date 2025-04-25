import { FC, useState, useEffect } from 'react'

interface AuthOverlayProps {
  onGoogleSignIn: () => void
  onAppleSignIn: () => void
  onPhoneSignIn: (phone: string) => void
}

export const AuthOverlay: FC<AuthOverlayProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  onPhoneSignIn
}) => {
  const [showOTP, setShowOTP] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOTP] = useState('')
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', flag: '🇮🇳' })
  const [showCountryList, setShowCountryList] = useState(false)

  const countries = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    // Add more countries as needed
  ]

  const handleContinue = () => {
    if (!showOTP) {
      // Show OTP input
      setShowOTP(true)
    } else {
      // Verify OTP and close
      onPhoneSignIn(phoneNumber)
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

  const handleResendOTP = () => {
    // Here you would typically trigger the OTP resend API
    setTimer(30) // Start 30 second countdown
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center">Welcome to Jeevic</h2>
        
        <div className="space-y-4">
          {!showOTP ? (
            <div className="flex items-center border rounded-xl p-3 gap-2 relative">
              <div 
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setShowCountryList(!showCountryList)}
              >
                <span>{selectedCountry.flag}</span>
                <span className="text-gray-600">{selectedCountry.code}</span>
              </div>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="flex-1 outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
              
              {/* Country selection dropdown */}
              {showCountryList && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto w-48 z-50">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCountry(country)
                        setShowCountryList(false)
                      }}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="text-gray-500">{country.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-gray-600">
                Enter the 4-digit code sent to {selectedCountry.code} {phoneNumber}
              </p>
              <div className="flex justify-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  className="w-32 text-center border rounded-xl p-3 outline-none"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                />
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
          
          <p className="text-sm text-center text-gray-500">
            By clicking continue you agree to our{' '}
            <a href="#" className="text-orange-500">
              Terms & Conditions
            </a>
          </p>

          <button 
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
            onClick={handleContinue}
          >
            {showOTP ? 'Confirm' : 'Continue'}
          </button>
        </div>

        {!showOTP && (
          <>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="space-y-3">
              <button 
                onClick={onAppleSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl"
              >
                <img src="/apple-logo.png" alt="Apple" className="w-5 h-5" />
                <span>Continue with Apple</span>
              </button>

              <button 
                onClick={onGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl"
              >
                <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}