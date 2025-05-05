import { FC, useState, useEffect } from 'react'

interface AuthOverlayProps {
  onGoogleSignIn: () => void
  onAppleSignIn: () => void
  onPhoneSignIn: (userData: { phone: string, firstName: string, lastName: string }) => void
}

export const AuthOverlay: FC<AuthOverlayProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  onPhoneSignIn
}) => {
  const [showOTP, setShowOTP] = useState(false)
  const [showNameForm, setShowNameForm] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOTP] = useState(['', '', '', ''])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
      setShowOTP(true)
    } else if (showOTP && !showNameForm) {
      setShowNameForm(true)
    } else {
      // Submit all user data
      onPhoneSignIn({
        phone: `${selectedCountry.code}${phoneNumber}`,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value
    setOTP(newOTP)

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[name='otp-${index + 1}']`) as HTMLInputElement
      if (nextInput) nextInput.focus()
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

  const handleResendOTP = () => {
    // Here you would typically trigger the OTP resend API
    setTimer(30) // Start 30 second countdown
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-6 space-y-6">

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
          ) : showNameForm ? (
            <div className="space-y-3">
              <p className="text-center text-gray-600">
                Please enter your name
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border rounded-xl p-3 outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border rounded-xl p-3 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-gray-600">
                Enter the 4-digit code sent to {selectedCountry.code} {phoneNumber}
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
                    className="w-12 h-12 text-center border rounded-xl outline-none text-lg"
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

          <p className="text-[12px] text-center text-gray-500">
            By clicking continue you agree to our{' '}
            <a href="#" className="text-orange-500">
              Terms & Conditions
            </a>
          </p>

          <button
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
            onClick={handleContinue}
            disabled={showNameForm && (!firstName.trim() || !lastName.trim())}
          >
            {showNameForm ? 'Submit' : showOTP ? 'Confirm' : 'Continue'}
          </button>
        </div>

        {!showOTP && !showNameForm && (
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