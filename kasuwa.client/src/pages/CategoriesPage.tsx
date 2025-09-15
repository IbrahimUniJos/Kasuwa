import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategoryService } from '../services/products';
import type { CategoryDto } from '../types/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryService = new CategoryService();
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Categories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link 
                    to={`/products?category=${category.id}`} 
                    className="hover:text-orange-600"
                  >
                    {category.name}
                  </Link>
                </h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}
                
                {/* Subcategories */}
                {category.subCategories && category.subCategories.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                    {category.subCategories.slice(0, 5).map((subCategory) => (
                      <Link
                        key={subCategory.id}
                        to={`/products?category=${subCategory.id}`}
                        className="block text-sm text-gray-600 hover:text-orange-600 pl-2 border-l-2 border-transparent hover:border-orange-300"
                      >
                        {subCategory.name}
                      </Link>
                    ))}
                    {category.subCategories.length > 5 && (
                      <p className="text-xs text-gray-500 pl-2">
                        +{category.subCategories.length - 5} more
                      </p>
                    )}
                  </div>
                )}
                
                {/* Product count */}
                {category.productCount !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {category.productCount} products
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}