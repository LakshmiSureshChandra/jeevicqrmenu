
import React from 'react';

interface CategoryGridProps {
  categories: {
    id: string;    // Add id to the interface
    name: string;
    image: string;
  }[];
  onCategoryClick?: (id: string) => void;  // Update to use id instead of name
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative rounded-xl overflow-hidden shadow-md cursor-pointer"
          onClick={() => onCategoryClick?.(category.id)}
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-32 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <h3 className="text-white text-center font-medium">{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;