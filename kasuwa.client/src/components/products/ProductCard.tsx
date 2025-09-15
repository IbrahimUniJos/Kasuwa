import { useState } from 'react';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  EyeIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid';
import type { ProductListDto } from '../../types/api';

// Flexible product type that works with both full Product and ProductListDto
type ProductCardData = ProductListDto & {
  images?: Array<{ imageUrl: string; altText?: string; isMain?: boolean }>;
  vendor?: { firstName: string; lastName: string };
  category?: { name: string };
};

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
  onClick?: (productId: number) => void;
  isInWishlist?: boolean;
  className?: string;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onQuickView,
  onClick,
  isInWishlist = false,
  className = ''
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleCardClick = () => {
    onClick?.(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onAddToCart?.(product.id);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleWishlist?.(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onQuickView?.(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscountPercentage = () => {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const getPrimaryImage = () => {
    if (product.primaryImageUrl) return product.primaryImageUrl;
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isMain);
      return primaryImage?.imageUrl || product.images[0]?.imageUrl;
    }
    return '/placeholder-product.jpg'; // Default placeholder
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <StarIcon className="h-4 w-4 text-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <div 
      className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercentage}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 group/wishlist"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist ? (
          <HeartSolidIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5 text-gray-600 group-hover/wishlist:text-red-500 transition-colors" />
        )}
      </button>

      {/* Quick View Button */}
      {onQuickView && (
        <button
          onClick={handleQuickViewClick}
          className="absolute top-3 right-12 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          aria-label="Quick view"
        >
          <EyeIcon className="h-5 w-5 text-gray-600 hover:text-kasuwa-primary-600 transition-colors" />
        </button>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-kasuwa-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!imageError && getPrimaryImage() ? (
          <img
            src={getPrimaryImage()}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 flex items-center justify-center">
            <div className="text-4xl text-kasuwa-primary-300">🛍️</div>
          </div>
        )}

        {/* Stock Status Overlay */}
        {product.stockQuantity === 0 && !product.inStock ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        ) : null}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Vendor Location */}
        <div className="flex items-center text-xs text-gray-500">
          <MapPinIcon className="h-3 w-3 mr-1" />
          <span>Kano, Nigeria</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-kasuwa-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-sm text-gray-500 capitalize">
          {product.categoryName || product.category?.name || 'General'}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex">
            {renderStars(product.averageRating || 0)}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
          <p className="text-sm text-orange-600">
            Only {product.stockQuantity} left!
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          disabled={product.stockQuantity === 0 && !product.inStock}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
            product.stockQuantity === 0 && !product.inStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-kasuwa-primary-600 text-white hover:bg-kasuwa-primary-700 active:transform active:scale-95'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span>
            {product.stockQuantity === 0 && !product.inStock ? 'Out of Stock' : 'Add to Cart'}
          </span>
        </button>
      </div>
    </div>
  );
}