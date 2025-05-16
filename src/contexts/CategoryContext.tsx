import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IDishCategory as Category } from '../libs/api/types'; 

interface CategoryContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  currentCategory: string | null;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  return (
    <CategoryContext.Provider value={{ categories, setCategories, currentCategory, setCurrentCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};