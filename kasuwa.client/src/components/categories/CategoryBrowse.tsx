import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { categoryService, productService } from '../../services/products';
import ProductCard from '../products/ProductCard';
import type { CategoryDto, ProductListDto } from '../../types/api';

interface CategoryBrowseProps {
  className?: string;
  showProducts?: boolean; // Whether to show products inline or navigate to products page
  maxProductsPerCategory?: number;
}

export default function CategoryBrowse({ 
  className = '', 
  showProducts = false,
  maxProductsPerCategory = 4 
}: CategoryBrowseProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && showProducts) {
      fetchCategoryProducts();
    }
  }, [selectedCategory, currentPage, showProducts]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    if (!selectedCategory) return;

    setProductsLoading(true);
    try {
      const response = await productService.getProductsByCategory(selectedCategory.id, {
        pageNumber: currentPage,
        pageSize: showProducts ? pageSize : maxProductsPerCategory,
        sortBy: 'name',
        sortDirection: 'asc'
      });
      setProducts(response.data);
      setTotalProducts(response.totalCount);
    } catch (error) {
      console.error('Error fetching category products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategorySelect = (category: CategoryDto) => {
    if (showProducts) {
      setSelectedCategory(category);
      setCurrentPage(1);
      setProducts([]);
    } else {
      // Navigate to products page with category filter
      navigate(`/products?category=${category.id}`);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (productId: number) => {
    // TODO: Integrate with cart functionality
    console.log('Add to cart:', productId);
    alert('Product added to cart! (Feature coming soon)');
  };

  const handleToggleWishlist = (productId: number) => {
    // TODO: Integrate with wishlist functionality
    console.log('Toggle wishlist:', productId);
    alert('Added to wishlist! (Feature coming soon)');
  };

  const handleViewAllInCategory = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
  };

  const buildCategoryTree = (categories: CategoryDto[], parentId?: number): CategoryDto[] => {
    return categories
      .filter(cat => cat.parentCategoryId === parentId)
      .sort((a, b) => (a.sortOrder || a.displayOrder) - (b.sortOrder || b.displayOrder));
  };

  const renderCategoryTree = (categories: CategoryDto[], level: number = 0) => {
    const rootCategories = buildCategoryTree(categories);
    
    return rootCategories.map(category => (
      <div key={category.id}>
        <button
          onClick={() => handleCategorySelect(category)}
          className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors ${
            selectedCategory?.id === category.id ? 'bg-kasuwa-primary-50 text-kasuwa-primary-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: 12 + level * 24 }}
        >
          <FolderIcon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{category.name}</span>
          <span className="ml-auto text-sm text-gray-500">
            {category.productCount || 0}
          </span>
        </button>
        
        {category.subCategories && category.subCategories.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.subCategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderBreadcrumb = () => {
    if (!selectedCategory) return null;

    const breadcrumbs = [];
    let current: CategoryDto | null = selectedCategory;
    
    while (current) {
      breadcrumbs.unshift(current);
      current = categories.find(cat => cat.id === current!.parentCategoryId) || null;
    }

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="hover:text-kasuwa-primary-600"
        >
          Categories
        </button>
        {breadcrumbs.map((category, index) => (
          <div key={category.id} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4" />
            <button
              onClick={() => handleCategorySelect(category)}
              className={`hover:text-kasuwa-primary-600 ${
                index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''
              }`}
            >
              {category.name}
            </button>
          </div>
        ))}
      </nav>
    );
  };

  // For homepage display - show category cards
  const renderCategoryCards = () => {
    const rootCategories = buildCategoryTree(categories);
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {rootCategories.slice(0, 12).map(category => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-primary-200 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-kasuwa-primary-200 group-hover:to-kasuwa-primary-300 transition-colors">
              <FolderIcon className="h-6 w-6 text-kasuwa-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1 group-hover:text-kasuwa-primary-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              {category.productCount || 0} items
            </p>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="animate-pulse">
          {showProducts ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Homepage view - just show category cards
  if (!showProducts) {
    return (
      <div className={className}>
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No categories available
            </h3>
            <p className="text-gray-600">
              Categories will appear here once they are added.
            </p>
          </div>
        ) : (
          renderCategoryCards()
        )}
      </div>
    );
  }

  // Full category browser with products
  return (
    <div className={`py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No categories available</p>
              ) : (
                renderCategoryTree(categories)
              )}
            </div>
          </div>
        </div>

        {/* Products Area */}
        <div className="lg:col-span-3">
          {!selectedCategory ? (
            // Category Overview
            <div className="text-center py-16">
              <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Browse by Category
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select a category from the sidebar to view products. We have organized our products
                to make it easy for you to find what you're looking for.
              </p>
            </div>
          ) : (
            // Selected Category Products
            <div>
              {renderBreadcrumb()}
              
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h1>
                  {selectedCategory.description && (
                    <p className="text-gray-600 mt-2">{selectedCategory.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid' 
                        ? 'bg-kasuwa-primary-100 text-kasuwa-primary-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Grid view"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list' 
                        ? 'bg-kasuwa-primary-100 text-kasuwa-primary-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="List view"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Products Grid/List */}
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products in this category
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check back later or browse other categories to find great products.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
                  >
                    Browse All Products
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleProductClick}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                  
                  {totalProducts > maxProductsPerCategory && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => handleViewAllInCategory(selectedCategory.id)}
                        className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
                      >
                        View All {totalProducts} Products
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Pagination (only for full product view) */}
              {totalProducts > pageSize && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.ceil(totalProducts / pageSize) }).map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === currentPage;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            isCurrentPage
                              ? 'bg-kasuwa-primary-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(totalProducts / pageSize), currentPage + 1))}
                      disabled={currentPage === Math.ceil(totalProducts / pageSize)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
