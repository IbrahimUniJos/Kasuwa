import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cartService, wishlistService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import type { CartDto } from '../types/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    loadCart();
    loadWishlist();
  }, [isAuthenticated, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistData = await wishlistService.getWishlist();
      const ids = new Set(wishlistData.items.map(item => item.productId));
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      const updatedCart = await cartService.updateCartItem({
        cartItemId: itemId,
        quantity: newQuantity
      });
      setCart(updatedCart);
      showSuccess('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart:', error);
      showError('Failed to update cart item');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
      showSuccess('Item removed from cart');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const toggleWishlist = async (productId: number) => {
    try {
      const isInWishlist = wishlistIds.has(productId);
      
      if (isInWishlist) {
        // Find wishlist item and remove it
        const wishlistData = await wishlistService.getWishlist();
        const item = wishlistData.items.find(item => item.productId === productId);
        if (item) {
          await wishlistService.removeFromWishlist(item.id);
          setWishlistIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          showSuccess('Removed from wishlist');
        }
      } else {
        await wishlistService.addToWishlist({ productId });
        setWishlistIds(prev => new Set([...prev, productId]));
        showSuccess('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showError('Failed to update wishlist');
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;
    
    try {
      await cartService.clearCart();
      setCart(null);
      showSuccess('Cart cleared successfully');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotals = () => {
    if (!cart || !cart.items) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    
    const subtotal = cart.totalAmount;
    const shipping = subtotal >= 10000 ? 0 : 1500; // Free shipping over ?10,000
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  const continueShopping = () => {
    navigate('/products');
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      showError('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={continueShopping}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          
          {cart && cart.items && cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to add items to your cart.
            </p>
            <button
              onClick={continueShopping}
              className="bg-kasuwa-primary-600 text-white px-8 py-3 rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0].imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 flex items-center justify-center">
                          <span className="text-kasuwa-primary-600 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            SKU: {item.product?.sku}
                          </p>
                          {item.productVariant && (
                            <p className="text-sm text-gray-600 mb-2">
                              Variant: {item.productVariant}
                            </p>
                          )}
                          <p className="text-lg font-semibold text-kasuwa-primary-600">
                            {formatPrice(item.unitPrice)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleWishlist(item.productId)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title={wishlistIds.has(item.productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            {wishlistIds.has(item.productId) ? (
                              <HeartSolidIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <HeartIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.id}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-center min-w-[60px] border-x border-gray-300">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (7.5%)</span>
                    <span>{formatPrice(totals.tax)}</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(totals.total)}</span>
                  </div>
                </div>

                {totals.subtotal < 10000 && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Add {formatPrice(10000 - totals.subtotal)} more to get free shipping!
                    </p>
                  </div>
                )}

                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-kasuwa-primary-600 text-white py-3 px-6 rounded-lg hover:bg-kasuwa-primary-700 transition-colors font-semibold mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={continueShopping}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Secure checkout powered by trusted payment providers
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}