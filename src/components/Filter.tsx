import { useState, TouchEvent, ChangeEvent, useCallback, useEffect, useRef } from 'react'

interface FilterProps {
  isOpen: boolean
  onClose: () => void
}

export const Filter = ({ isOpen, onClose }: FilterProps) => {
  const [minValue, setMinValue] = useState(100)
  const [maxValue, setMaxValue] = useState(500)
  const minValRef = useRef(100)
  const maxValRef = useRef(500)
  const range = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Food')
  const [selectedType, setSelectedType] = useState<string>('Salad')
  const [selectedRating, setSelectedRating] = useState<number>(3)

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
    setSelectedCategory(category)
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
  }

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating)
  }

  const handleApplyFilters = () => {
    // Here you would typically pass the selected filters to a parent component
    const filters = {
      category: selectedCategory,
      type: selectedType,
      rating: selectedRating,
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
          <div className="flex justify-center mb-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <h2 className="text-2xl font-semibold mb-6">Filters</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg text-gray-600 mb-3">Select Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Food', 'Drink', 'Dessert'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-2 rounded-2xl ${
                      selectedCategory === category
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
                      selectedType === type
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
                      rating === selectedRating ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {rating} <span className={rating === selectedRating ? 'text-white' : 'text-orange-500'}>★</span>
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
                    className="absolute w-1/2 h-8 -top-3 left-0 opacity-0 cursor-pointer"
                  />

                  {/* Right thumb */}
                  <input
                    type="range"
                    min={100}
                    max={500}
                    step={100}
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute w-1/2 h-8 -top-3 right-0 opacity-0 cursor-pointer"
                  />

                  {/* Thumb indicators */}
                  <div 
                    className="absolute w-6 h-6 bg-orange-500 rounded-full -mt-2 -ml-3 border-2 border-white shadow-md"
                    style={{ 
                      left: `${getPercent(minValue)}%`
                    }}
                  />
                  <div 
                    className="absolute w-6 h-6 bg-orange-500 rounded-full -mt-2 -ml-3 border-2 border-white shadow-md"
                    style={{ 
                      left: `${getPercent(maxValue)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-gray-500 text-base">
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>400</span>
                  <span>500</span>
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