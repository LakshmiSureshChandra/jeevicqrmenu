interface Category {
  name: string
  image: string
}

interface CategoryGridProps {
  categories: Category[]
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <section className="mt-4 mx-2">
      <h2 className="text-xl font-semibold">All Categories</h2>
      <p className="text-gray-600 text-sm mt-1 mb-6">
        Explore your favorite food in wide Categories
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.name} className="relative overflow-hidden rounded-xl shadow-sm bg-white h-36">
            <img 
              src={category.image} 
              alt={category.name}
              className="object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white py-2 px-3">
              <span className="text-black font-medium text-center block">
                {category.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}