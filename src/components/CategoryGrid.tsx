
import React from 'react';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (id: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mt-4 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform duration-300 hover:scale-105"
          onClick={() => onCategoryClick(category.id)}
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
            <h3 className="text-white text-lg font-semibold">{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;