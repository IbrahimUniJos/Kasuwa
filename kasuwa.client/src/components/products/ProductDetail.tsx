import { useState, useEffect } from 'react';
import { 
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';
import { productService } from '../../services/products';
import type { ProductDto, ProductVariantDto } from '../../types/api';

interface ProductDetailProps {
  productId: number;
  onAddToCart?: (productId: number, variantId?: number, quantity?: number) => void;
  onToggleWishlist?: (productId: number) => void;
  isInWishlist?: boolean;
  className?: string;
}

export default function ProductDetail({
  productId,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  className = ''
}: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productData, relatedData] = await Promise.all([
          productService.getProduct(productId),
          productService.getRelatedProducts(productId, 4)
        ]);
        
        setProduct(productData);
        setRelatedProducts(relatedData);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return product!.price + selectedVariant.priceAdjustment;
    }
    return product!.price;
  };

  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return product!.stockQuantity;
  };

  const isInStock = () => {
    const stock = getCurrentStock();
    return stock > 0 || product!.continueSellingWhenOutOfStock;
  };

  const getDiscountPercentage = () => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarSolidIcon className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const handleAddToCart = () => {
    onAddToCart?.(productId, selectedVariant?.id, quantity);
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImageIndex]?.imageUrl}
                  alt={product.images[currentImageIndex]?.altText || product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {getDiscountPercentage() > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{getDiscountPercentage()}%
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-6xl text-gray-300">🛍️</div>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index 
                      ? 'border-kasuwa-primary-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <span>Home</span> 
            <span className="mx-2">/</span>
            <span>{product.categoryName}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-kasuwa-primary-600">
                {formatPrice(getCurrentPrice())}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            {!isInStock() && (
              <p className="text-red-600 font-medium">Out of Stock</p>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Options</h3>
              <div className="space-y-3">
                {/* Group variants by name */}
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.name]) acc[variant.name] = [];
                    acc[variant.name].push(variant);
                    return acc;
                  }, {} as Record<string, ProductVariantDto[]>)
                ).map(([variantName, variants]) => (
                  <div key={variantName}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variantName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            selectedVariant?.id === variant.id
                              ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50 text-kasuwa-primary-700'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          } ${
                            variant.stockQuantity === 0 && !product.continueSellingWhenOutOfStock
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={variant.stockQuantity === 0 && !product.continueSellingWhenOutOfStock}
                        >
                          {variant.value}
                          {variant.priceAdjustment !== 0 && (
                            <span className="ml-1 text-xs">
                              ({variant.priceAdjustment > 0 ? '+' : ''}{formatPrice(variant.priceAdjustment)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  disabled={!isInStock()}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={getCurrentStock()}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-2 text-center border-0 focus:ring-0"
                  disabled={!isInStock()}
                />
                <button
                  onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  disabled={!isInStock() || quantity >= getCurrentStock()}
                >
                  +
                </button>
              </div>
              {getCurrentStock() <= 10 && getCurrentStock() > 0 && (
                <span className="text-sm text-orange-600">
                  Only {getCurrentStock()} left!
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock()}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                isInStock()
                  ? 'bg-kasuwa-primary-600 text-white hover:bg-kasuwa-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>{isInStock() ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => onToggleWishlist?.(productId)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 border rounded-lg font-medium transition-colors ${
                  isInWishlist
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 transition-colors">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <TruckIcon className="h-5 w-5" />
              <span>Free shipping on orders over ₦10,000</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <TagIcon className="h-5 w-5" />
              <span>Authentic Northern Nigerian product</span>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              Sold by <span className="font-medium text-gray-900">{product.vendorName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-t">
        <div className="flex space-x-8 border-b">
          {[
            { key: 'description', label: 'Description' },
            { key: 'shipping', label: 'Shipping & Returns' },
            { key: 'reviews', label: `Reviews (${product.reviewCount})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-kasuwa-primary-500 text-kasuwa-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
              
              {/* Specifications */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">SKU:</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.sku}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Category:</dt>
                      <dd className="text-sm font-medium text-gray-900">{product.categoryName}</dd>
                    </div>
                    {product.requiresShipping && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Weight:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {product.weight} {product.weightUnit}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Shipping Information</h4>
                <div className="text-gray-700 space-y-2">
                  {product.requiresShipping ? (
                    <>
                      <p>• Free shipping on orders over ₦10,000</p>
                      <p>• Standard delivery: 3-7 business days</p>
                      <p>• Express delivery: 1-3 business days (additional charges apply)</p>
                      <p>• Product weight: {product.weight} {product.weightUnit}</p>
                    </>
                  ) : (
                    <p>This is a digital product that doesn't require shipping.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Returns & Exchanges</h4>
                <div className="text-gray-700 space-y-2">
                  <p>• 30-day return policy</p>
                  <p>• Items must be in original condition</p>
                  <p>• Free returns for damaged or defective items</p>
                  <p>• Customer pays return shipping for change of mind</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
                <button className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700 font-medium">
                  Write a Review
                </button>
              </div>
              
              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {product.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mt-1">
                      {renderStars(product.averageRating)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {product.reviewCount} reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {product.reviewCount === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Reviews loading...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src={relatedProduct.primaryImageUrl || '/placeholder-product.jpg'}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {relatedProduct.name}
                  </h4>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(relatedProduct.averageRating || 0)}
                    <span className="text-xs text-gray-500">
                      ({relatedProduct.reviewCount || 0})
                    </span>
                  </div>
                  <p className="text-lg font-bold text-kasuwa-primary-600">
                    {formatPrice(relatedProduct.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}