import { useState, useMemo } from 'react';
import { AdjustmentsHorizontalIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
  wishlistProductIds?: Set<number>;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';

export default function ProductGrid({
  products,
  loading = false,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistProductIds = new Set(),
  title,
  subtitle,
  showFilters = true,
  className = ''
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const sortedProducts = useMemo(() => {
    const productsCopy = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-high':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'rating':
        return productsCopy.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'newest':
        return productsCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'featured':
      default:
        return productsCopy.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
    }
  }, [products, sortBy]);

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      onAddToCart={onAddToCart}
      onToggleWishlist={onToggleWishlist}
      onQuickView={onQuickView}
      isInWishlist={wishlistProductIds.has(product.id)}
      className={viewMode === 'list' ? 'flex flex-row' : ''}
    />
  );

  const renderLoadingSkeleton = () => (
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
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-3 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>}
            {subtitle && <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>}
          </div>
        )}
        {renderLoadingSkeleton()}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-gray-200">
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-kasuwa-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-kasuwa-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label="List view"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🛍️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any products matching your criteria. Try adjusting your filters or browse our featured categories.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-colors">
            Browse All Products
          </button>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
          {sortedProducts.map(renderProductCard)}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {sortedProducts.length > 0 && sortedProducts.length % 12 === 0 && (
        <div className="text-center pt-8">
          <button className="px-8 py-3 border-2 border-kasuwa-primary-600 text-kasuwa-primary-600 font-semibold rounded-lg hover:bg-kasuwa-primary-600 hover:text-white transition-colors">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}