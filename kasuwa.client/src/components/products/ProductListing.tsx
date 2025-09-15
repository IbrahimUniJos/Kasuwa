import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import { productService, categoryService } from '../../services/products';
import type { ProductListDto, CategoryDto, ProductQueryParams } from '../../types/api';

interface ProductListingProps {
  initialCategoryId?: number;
  initialSearchTerm?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showCategoryFilter?: boolean;
  pageSize?: number;
  className?: string;
}

interface Filters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

type ViewMode = 'grid' | 'list';

export default function ProductListing({
  initialCategoryId,
  initialSearchTerm = '',
  showSearch = true,
  showFilters = true,
  showCategoryFilter = true,
  pageSize = 20,
  className = ''
}: ProductListingProps) {
  // State management
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [tempSearchTerm, setTempSearchTerm] = useState(initialSearchTerm);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<Filters>({
    categoryId: initialCategoryId,
    sortBy: 'name',
    sortDirection: 'asc'
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when filters or pagination change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams: ProductQueryParams = {
          searchTerm: searchTerm || undefined,
          categoryId: filters.categoryId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          inStockOnly: filters.inStockOnly,
          minRating: filters.minRating,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          pageNumber: currentPage,
          pageSize
        };

        const response = await productService.getProducts(queryParams);
        setProducts(response.data);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, filters, currentPage, pageSize]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    handleFilterChange({ sortBy, sortDirection });
  };

  const resetFilters = () => {
    setFilters({
      categoryId: initialCategoryId,
      sortBy: 'name',
      sortDirection: 'asc'
    });
    setSearchTerm(initialSearchTerm);
    setTempSearchTerm(initialSearchTerm);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get flat categories for dropdown
  const flatCategories = useMemo(() => {
    const flattenCategories = (cats: CategoryDto[], level = 0): CategoryDto[] => {
      let result: CategoryDto[] = [];
      for (const cat of cats) {
        result.push({ ...cat, name: '  '.repeat(level) + cat.name });
        if (cat.subCategories && cat.subCategories.length > 0) {
          result = result.concat(flattenCategories(cat.subCategories, level + 1));
        }
      }
      return result;
    };
    return flattenCategories(categories);
  }, [categories]);

  const renderSearchBar = () => (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={tempSearchTerm}
          onChange={(e) => setTempSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-kasuwa-primary-600 hover:text-kasuwa-primary-800"
        >
          Reset
        </button>
      </div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange({ 
              categoryId: e.target.value ? Number(e.target.value) : undefined 
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {flatCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange({ 
              minPrice: e.target.value ? Number(e.target.value) : undefined 
            })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange({ 
              maxPrice: e.target.value ? Number(e.target.value) : undefined 
            })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <select
          value={filters.minRating || ''}
          onChange={(e) => handleFilterChange({ 
            minRating: e.target.value ? Number(e.target.value) : undefined 
          })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStockOnly || false}
            onChange={(e) => handleFilterChange({ inStockOnly: e.target.checked })}
            className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">In stock only</span>
        </label>
      </div>
    </div>
  );

  const renderSortAndView = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {totalCount} product{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={`${filters.sortBy}-${filters.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split('-');
              handleSortChange(sortBy, sortDirection as 'asc' | 'desc');
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Rating (High to Low)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-kasuwa-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-kasuwa-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Toggle (mobile) */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="sm:hidden flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:text-gray-900"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderProductGrid = () => {
    if (loading) {
      return (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      );
    }

    return (
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
      }`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className={viewMode === 'list' ? 'flex flex-row' : ''}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm border rounded-md ${
              page === currentPage
                ? 'bg-kasuwa-primary-600 text-white border-kasuwa-primary-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          {renderSearchBar()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className={`lg:col-span-1 ${showFilterPanel ? 'block' : 'hidden lg:block'}`}>
            {renderFilters()}
          </div>
        )}

        {/* Main Content */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="space-y-6">
            {/* Sort and View Options */}
            {renderSortAndView()}

            {/* Products Grid */}
            {renderProductGrid()}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}