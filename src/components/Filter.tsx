import { useState, TouchEvent, useCallback, useEffect, useRef } from 'react'

interface FilterProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: { ratings: number[], priceRange: string }) => void
}

export const Filter = ({ isOpen, onClose, onApplyFilters }: FilterProps) => {
  const [minValue, setMinValue] = useState(100)
  const [maxValue, setMaxValue] = useState(500)
  const minValRef = useRef(100)
  const maxValRef = useRef(500)
  const range = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('')

  const priceRanges = [
    { label: 'Under ₹200', value: '0-200' },
    { label: '₹200 - ₹400', value: '200-400' },
    { label: '₹400 - ₹600', value: '400-600' },
    { label: '₹600 - ₹800', value: '600-800' },
    { label: 'Above ₹800', value: '800-above' }
  ]

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchEnd - touchStart
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      onClose()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - 100) / (500 - 100)) * 100),
    []
  )

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minValue)
    const maxPercent = getPercent(maxValRef.current)

    if (range.current) {
      range.current.style.left = `${minPercent}%`
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [minValue, getPercent])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current)
    const maxPercent = getPercent(maxValue)

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [maxValue, getPercent])

  const handleRatingSelect = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    )
  }

  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(prev => prev === range ? '' : range)
  }

  const handleClearFilters = () => {
    setSelectedRatings([])
    setSelectedPriceRange('')
    setMinValue(100)
    setMaxValue(500)
    minValRef.current = 100
    maxValRef.current = 500
  }

  const handleApplyFilters = () => {
    const filters = {
      ratings: selectedRatings,
      priceRange: selectedPriceRange
    }
    onApplyFilters(filters)
    onClose()
  }

  return (
    <>
      {/* Semi-transparent overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Filter drawer */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white rounded-t-2xl shadow-lg px-4 pt-6 pb-8 overflow-y-auto" style={{ maxHeight: '85vh' }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <button
              onClick={handleClearFilters}
              className="text-orange-500 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">

            <div>
              <h3 className="text-lg text-gray-600 mb-3">Rating</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating}
                    onClick={() => handleRatingSelect(rating)}
                    className={`px-4 py-2 rounded-2xl border ${
                      selectedRatings.includes(rating) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {rating} <span className={selectedRatings.includes(rating) ? 'text-white' : 'text-orange-500'}>★</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg text-gray-600 mb-3">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                {priceRanges.map((range) => (
                  <button 
                    key={range.value}
                    onClick={() => handlePriceRangeSelect(range.value)}
                    className={`px-4 py-3 rounded-2xl border ${
                      selectedPriceRange === range.value 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'border-gray-200 text-gray-600 hover:border-orange-500'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleApplyFilters}
            className="w-full bg-orange-500 text-white py-3 rounded-xl mt-8 font-semibold"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}