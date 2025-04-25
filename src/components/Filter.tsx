import { useState, TouchEvent, ChangeEvent, useCallback, useEffect, useRef } from 'react'

interface FilterProps {
  isOpen: boolean
  onClose: () => void
}

export const Filter = ({ isOpen, onClose }: FilterProps) => {
  const [minValue, setMinValue] = useState(100)
  const [maxValue, setMaxValue] = useState(500)  // Changed from 1000 to 500
  const minValRef = useRef(100)
  const maxValRef = useRef(500)  // Changed from 1000 to 500
  const range = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])

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

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 100)
    setMinValue(value)
    minValRef.current = value
  }

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 100)
    setMaxValue(value)
    maxValRef.current = value
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleTypeSelect = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleRatingSelect = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    )
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
    setSelectedRatings([])
    setMinValue(100)
    setMaxValue(500)  // Changed from 1000 to 500
    minValRef.current = 100
    maxValRef.current = 500  // Changed from 1000 to 500
  }

  const handleApplyFilters = () => {
    const filters = {
      categories: selectedCategories,
      types: selectedTypes,
      ratings: selectedRatings,
      priceRange: { min: minValue, max: maxValue }
    }
    console.log('Applied filters:', filters)
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
              <h3 className="text-lg text-gray-600 mb-3">Select Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Food', 'Drink', 'Dessert'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-2 rounded-2xl ${
                      selectedCategories.includes(category)
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-200 text-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg text-gray-600 mb-3">Select Product Type</h3>
              <div className="flex flex-wrap gap-2">
                {['Pizza', 'Burger', 'Salad', 'Soup', 'Chicken', 'Grill', 'Breakfast'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className={`px-4 py-2 rounded-2xl ${
                      selectedTypes.includes(type)
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-200 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

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
              <div className="px-2">
                <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
                  {/* Track fill */}
                  <div
                    ref={range}
                    className="absolute h-full bg-orange-500 rounded-full"
                  />
                  
                  {/* Left thumb */}
                  <input
                    type="range"
                    min={100}
                    max={500}
                    step={100}
                    value={minValue}
                    onChange={handleMinChange}
                    className="absolute w-1/2 h-8 -top-3 left-0 opacity-0 cursor-pointer z-30"
                  />

                  {/* Right thumb */}
                  <input
                    type="range"
                    min={100}
                    max={500}
                    step={100}
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute w-1/2 h-8 -top-3 right-0 opacity-0 cursor-pointer z-30"
                  />

                  {/* Thumb indicators */}
                  <div 
                    className="absolute w-6 h-6 bg-orange-500 rounded-full -mt-2 -ml-3 border-2 border-white shadow-md pointer-events-none z-20"
                    style={{ 
                      left: `${getPercent(minValue)}%`
                    }}
                  />
                  <div 
                    className="absolute w-6 h-6 bg-orange-500 rounded-full -mt-2 -ml-3 border-2 border-white shadow-md pointer-events-none z-20"
                    style={{ 
                      left: `${getPercent(maxValue)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-gray-500 text-base">
                  {[100, 200, 300, 400, 500].map((value) => (
                    <span
                      key={value}
                      className={`${
                        value >= minValue && value <= maxValue
                          ? 'text-orange-500 font-medium'
                          : 'text-gray-400'
                      }`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
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