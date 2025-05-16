import { useState, useEffect, TouchEvent } from 'react'

interface BannerProps {
  banners: {
    id: string
    title: string
    description: string  // Make it required
    price: string       // Make it required
    image: string
  }[]
}

export const Banner = ({ banners }: BannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      )
    }, 8000)

    return () => clearInterval(interval)
  }, [banners.length])

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (Math.abs(distance) < minSwipeDistance) return

    if (distance > 0) {
      setCurrentIndex(prev => prev === banners.length - 1 ? 0 : prev + 1)
    } else {
      setCurrentIndex(prev => prev === 0 ? banners.length - 1 : prev - 1)
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
          <div 
            key={index}
            className="min-w-full px-1"
          >
            <div className="relative bg-white rounded-2xl overflow-hidden h-48">
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" /> {/* Dark overlay for better text visibility */}
              <div className="relative z-10 p-6">
                <div className="space-y-2 text-white">
                  <h2 className="text-2xl font-semibold">{banner.title}</h2>
                  <p className="text-gray-200 text-sm">{banner.description}</p>
                  <p className="text-sm">
                    Starting from <span className="text-orange-400 font-semibold">{banner.price}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              currentIndex === index ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}