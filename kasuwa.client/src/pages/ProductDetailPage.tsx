import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';
import { productService } from '../services/products';
import { cartService } from '../services/cart';
import { wishlistService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/products/ProductCard';
import type { ProductDto, ProductVariantDto, ProductListDto, AddToCartDto } from '../types/api';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate('/products');
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productData, relatedData] = await Promise.all([
          productService.getProduct(Number(id)),
          productService.getRelatedProducts(Number(id), 4)
        ]);
        
        setProduct(productData);
        setRelatedProducts(relatedData);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

        // Check if product is in wishlist
        if (user) {
          try {
            const inWishlist = await wishlistService.isInWishlist(Number(id));
            setIsInWishlist(inWishlist);
          } catch (error) {
            console.error('Error checking wishlist status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Product not found, redirect to products page
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, user]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    if (selectedVariant) {
      return product.price + selectedVariant.priceAdjustment;
    }
    return product.price;
  };

  const getCurrentStock = () => {
    if (!product) return 0;
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return product.stockQuantity;
  };

  const isInStock = () => {
    if (!product) return false;
    const stock = getCurrentStock();
    return stock > 0 || product.continueSellingWhenOutOfStock;
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

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    
    try {
      const addToCartData: AddToCartDto = {
        productId: product.id,
        quantity: quantity,
        productVariant: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined
      };

      if (user) {
        await cartService.addToCart(addToCartData);
        showNotification('success', `Added ${quantity} ${product.name} to cart!`);
      } else {
        // Handle guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items": [], "totalItems": 0, "totalAmount": 0}');
        const newItem = {
          id: Date.now(),
          productId: product.id,
          quantity: quantity,
          unitPrice: getCurrentPrice(),
          totalPrice: getCurrentPrice() * quantity,
          productVariant: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined,
          product: product
        };
        
        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex((item: any) => 
          item.productId === product.id && item.productVariant === newItem.productVariant
        );
        
        if (existingItemIndex >= 0) {
          guestCart.items[existingItemIndex].quantity += quantity;
          guestCart.items[existingItemIndex].totalPrice = guestCart.items[existingItemIndex].unitPrice * guestCart.items[existingItemIndex].quantity;
        } else {
          guestCart.items.push(newItem);
        }
        
        guestCart.totalItems = guestCart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        guestCart.totalAmount = guestCart.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        showNotification('success', `Added ${quantity} ${product.name} to cart!`);
      }
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!user) {
      navigate('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    setAddingToWishlist(true);
    
    try {
      if (isInWishlist) {
        // Remove from wishlist - would need to implement this in wishlist service
        // await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
        showNotification('success', 'Removed from wishlist');
      } else {
        await wishlistService.addToWishlist({ productId: product.id });
        setIsInWishlist(true);
        showNotification('success', 'Added to wishlist');
      }
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
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

  const handleShare = async () => {
    if (!product) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showNotification('success', 'Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('success', 'Product link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  const handleRelatedProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleBuyNow = async () => {
    // Add to cart and redirect to checkout
    await handleAddToCart();
    
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/auth/login?redirect=/checkout');
    }
  };

  // Notification component
  const renderNotification = () => {
    if (!notification) return null;

    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white p-4 rounded-lg shadow-lg transition-all duration-300`}>
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNotification()}
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => navigate('/')}
              className="hover:text-kasuwa-primary-600 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/products')}
              className="hover:text-kasuwa-primary-600 transition-colors"
            >
              Products
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/products?category=${product.categoryId}`)}
              className="hover:text-kasuwa-primary-600 transition-colors"
            >
              {product.categoryName}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
              {product.images.length > 0 ? (
                <React.Fragment>
                  <img
                    src={product.images[currentImageIndex]?.imageUrl}
                    alt={product.images[currentImageIndex]?.altText || product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <React.Fragment>
                      <button
                        onClick={() => handleImageNavigation('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleImageNavigation('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </React.Fragment>
                  )}

                  {/* Discount Badge */}
                  {getDiscountPercentage() > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{getDiscountPercentage()}%
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  {!isInStock() && (
                    <div className="absolute top-4 right-4 bg-gray-900 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                </React.Fragment>
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

            {/* Short Description */}
            {product.description && (
              <div className="text-gray-700 leading-relaxed">
                <p>{product.description.substring(0, 200)}...</p>
              </div>
            )}

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
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock() || addingToCart}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isInStock()
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock()}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isInStock()
                      ? 'bg-kasuwa-primary-600 text-white hover:bg-kasuwa-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleToggleWishlist}
                  disabled={addingToWishlist}
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
                  <span>
                    {addingToWishlist 
                      ? 'Updating...' 
                      : isInWishlist 
                        ? 'In Wishlist' 
                        : 'Add to Wishlist'
                    }
                  </span>
                </button>

                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center p-3 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 transition-colors"
                >
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex space-x-8 border-b px-6">
            {[
              {
                key: 'description',
                label: 'Description'
              },
              {
                key: 'shipping',
                label: 'Shipping & Returns'
              },
              {
                key: 'reviews',
                label: `Reviews (${product.reviewCount})`
              }
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

          <div className="p-6">
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
                        <React.Fragment>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Weight:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {product.weight} {product.weightUnit}
                            </dd>
                          </div>
                        </React.Fragment>
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
                      <React.Fragment>
                        <p>• Free shipping on orders over ₦10,000</p>
                        <p>• Standard delivery: 3-7 business days</p>
                        <p>• Express delivery: 1-3 business days (additional charges apply)</p>
                        <p>• Product weight: {product.weight} {product.weightUnit}</p>
                      </React.Fragment>
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
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onClick={() => handleRelatedProductClick(relatedProduct.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}