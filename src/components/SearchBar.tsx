import { useState } from 'react'
import { Filter } from './Filter'

export const SearchBar = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <>
      <div className="relative flex items-center bg-white rounded-2xl border">
        <div className="flex items-center flex-1">
          <div className="pl-4 pr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search items by name"
            className="w-full py-3 pr-4 text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
          />
        </div>
        <button 
          className="px-4 py-2 border-l border-gray-200"
          onClick={() => setIsFilterOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="5" width="16" height="2" rx="1" fill="#F97316"/>
            <rect x="7" y="11" width="10" height="2" rx="1" fill="#F97316"/>
            <rect x="10" y="17" width="4" height="2" rx="1" fill="#F97316"/>
          </svg>
        </button>
      </div>

      <Filter isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  )
}