import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/products/ProductCard';
import { productService, categoryService } from '../services/products';
import { cartService, wishlistService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import type { ProductListDto, CategoryDto, ProductQueryParams } from '../types/api';

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

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;
  
  const [filters, setFilters] = useState<Filters>({
    categoryId: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    sortBy: searchParams.get('sortBy') || 'name',
    sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc'
  });

  // Fetch categories and wishlist on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);

        // Load wishlist if authenticated
        if (isAuthenticated) {
          try {
            const wishlistData = await wishlistService.getWishlist();
            const wishlistProductIds = new Set(wishlistData.items.map(item => item.productId));
            setWishlistIds(wishlistProductIds);
          } catch (error) {
            console.error('Error fetching wishlist:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchInitialData();
  }, [isAuthenticated]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (filters.categoryId) params.set('category', filters.categoryId.toString());
    if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
    if (filters.sortDirection !== 'asc') params.set('sortDirection', filters.sortDirection);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.inStockOnly) params.set('inStock', 'true');
    if (filters.minRating) params.set('minRating', filters.minRating.toString());

    setSearchParams(params);
  }, [searchTerm, filters, currentPage, setSearchParams]);

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
  }, [searchTerm, filters, currentPage]);

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
      sortBy: 'name',
      sortDirection: 'asc'
    });
    setSearchTerm('');
    setTempSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product handlers
  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  // Cart handler with immediate UI feedback
  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setCartLoading(true);
    try {
      await cartService.addToCart({
        productId,
        quantity: 1
      });
      
      // Trigger a custom event that the Header/App can listen to
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Show success feedback with toast notification
      showToast('Product added to cart successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      showToast('Failed to add product to cart. Please try again.', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  // Wishlist handler with loading state
  const handleToggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setWishlistLoading(productId);
    try {
      const isInWishlist = wishlistIds.has(productId);
      
      if (isInWishlist) {
        // Remove from wishlist
        const wishlistData = await wishlistService.getWishlist();
        const wishlistItem = wishlistData.items.find(item => item.productId === productId);
        
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id);
          setWishlistIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          showToast('Removed from wishlist', 'success');
        }
      } else {
        // Add to wishlist
        await wishlistService.addToWishlist({ productId });
        setWishlistIds(prev => new Set([...prev, productId]));
        showToast('Added to wishlist', 'success');
      }
      
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      showToast('Failed to update wishlist. Please try again.', 'error');
    } finally {
      setWishlistLoading(null);
    }
  };

  // Simple toast notification function
  const showToast = (message: string, type: 'success' | 'error') => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={tempSearchTerm}
            onChange={(e) => setTempSearchTerm(e.target.value)}
            placeholder="Search for products, brands, categories..."
            className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Quick category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <button
            onClick={() => handleFilterChange({ categoryId: undefined })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !filters.categoryId 
                ? 'bg-kasuwa-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.slice(0, 6).map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterChange({ categoryId: category.id })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.categoryId === category.id 
                  ? 'bg-kasuwa-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-kasuwa-primary-600 hover:text-kasuwa-primary-800 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Category Filter */}
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

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range (?)
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {totalCount.toLocaleString()} product{totalCount !== 1 ? 's' : ''}
          {searchTerm && (
            <span className="ml-1">
              for "<span className="font-medium text-gray-900">{searchTerm}</span>"
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
          <select
            value={`${filters.sortBy}-${filters.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split('-');
              handleSortChange(sortBy, sortDirection as 'asc' | 'desc');
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
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
            title="Grid view"
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-kasuwa-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            title="List view"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Toggle (mobile) */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="sm:hidden flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:text-gray-900"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
        </button>
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
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? `We couldn't find any products matching "${searchTerm}". Try adjusting your search or filters.`
              : 'No products match your current filter criteria. Try adjusting your filters.'}
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
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
            onClick={() => handleProductClick(product.id)}
            onAddToCart={() => handleAddToCart(product.id)}
            onToggleWishlist={() => handleToggleWishlist(product.id)}
            onQuickView={() => handleProductClick(product.id)}
            isInWishlist={wishlistIds.has(product.id)}
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
          className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
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
            className={`px-3 py-2 text-sm border rounded-md font-medium ${
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
          className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find everything you need from authentic Northern Nigerian vendors
            </p>
          </div>
          
          {/* Search Bar */}
          {renderSearchBar()}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilterPanel ? 'block' : 'hidden lg:block'}`}>
            {renderFilters()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
    </div>
  );
}