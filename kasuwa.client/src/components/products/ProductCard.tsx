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
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onToggleWishlist?: (productId: number) => void;
  onQuickView?: (productId: number) => void;
  isInWishlist?: boolean;
  className?: string;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onQuickView,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscountPercentage = () => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
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
  const primaryImage = product.images?.find(img => img.isMain) || product.images?.[0];

  return (
    <div className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}>
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercentage}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => onToggleWishlist?.(product.id)}
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
      <button
        onClick={() => onQuickView?.(product.id)}
        className="absolute top-3 right-12 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
        aria-label="Quick view"
      >
        <EyeIcon className="h-5 w-5 text-gray-600 hover:text-kasuwa-primary-600 transition-colors" />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-kasuwa-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!imageError && primaryImage ? (
          <img
            src={primaryImage.imageUrl}
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
        {!product.trackQuantity || product.quantity === 0 ? (
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
          {product.category?.name || 'General'}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex">
            {renderStars(product.averageRating || 0)}
          </div>
          <span className="text-sm text-gray-600">
            ({product.totalReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.trackQuantity && product.quantity > 0 && product.quantity <= 10 && (
          <p className="text-sm text-orange-600">
            Only {product.quantity} left!
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product.id)}
          disabled={!product.trackQuantity || product.quantity === 0}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
            !product.trackQuantity || product.quantity === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-kasuwa-primary-600 text-white hover:bg-kasuwa-primary-700 active:transform active:scale-95'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span>
            {!product.trackQuantity || product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </span>
        </button>

        {/* Cultural Badge */}
        {Array.isArray(product.tags) && product.tags.some(tag => 
          ['traditional', 'handmade', 'cultural', 'arewa', 'northern'].includes(tag.toLowerCase())
        ) && (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-2 py-1 bg-kasuwa-accent-100 text-kasuwa-accent-800 text-xs font-medium rounded-full">
              🌟 Authentic Arewa
            </span>
          </div>
        )}
      </div>
    </div>
  );
}