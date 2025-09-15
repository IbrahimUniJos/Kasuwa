import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  MinusIcon, 
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';
import type { Cart, CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: Cart | null;
  onUpdateQuantity?: (itemId: number, quantity: number) => void;
  onRemoveItem?: (itemId: number) => void;
  onCheckout?: () => void;
  loading?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  loading = false
}: CartDrawerProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getItemSubtotal = (item: CartItem) => {
    return item.totalPrice;
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem?.(item.id);
    } else {
      onUpdateQuantity?.(item.id, newQuantity);
    }
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900">
                            Shopping Cart
                          </Dialog.Title>
                          <p className="text-sm text-gray-500">
                            {cart?.totalItems || 0} item{(cart?.totalItems || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto">
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBagIcon className="h-12 w-12 text-kasuwa-primary-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Your cart is empty
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-sm">
                            Discover amazing products from Northern Nigerian vendors and add them to your cart.
                          </p>
                          <button
                            onClick={onClose}
                            className="inline-flex items-center px-6 py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {cart?.items?.map((item) => (
                            <div key={item.id} className="flex space-x-4 bg-gray-50 rounded-lg p-4">
                              {/* Product Image */}
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={item.product.images[0].imageUrl}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 flex items-center justify-center">
                                    <span className="text-lg">🛍️</span>
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {item.product?.name || 'Product Name'}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {formatPrice(item.unitPrice)}
                                </p>

                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                      disabled={loading}
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                      disabled={loading}
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => onRemoveItem?.(item.id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    disabled={loading}
                                    aria-label="Remove item"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Subtotal */}
                                <div className="mt-2 text-right">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatPrice(getItemSubtotal(item))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Delivery Note */}
                          <div className="bg-kasuwa-accent-50 border border-kasuwa-accent-200 rounded-lg p-4 mt-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">🚚</span>
                              <h4 className="text-sm font-medium text-kasuwa-accent-800">
                                Delivery Information
                              </h4>
                            </div>
                            <p className="text-sm text-kasuwa-accent-700">
                              Free delivery within Kano city. Express shipping available to other Northern states.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer - Order Summary & Checkout */}
                    {!isEmpty && cart && (
                      <div className="border-t border-gray-200 p-4 space-y-4">
                        {/* Order Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{formatPrice(cart.totalAmount || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery</span>
                            <span className="font-medium text-green-600">Free</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between text-base font-semibold">
                              <span>Total</span>
                              <span>{formatPrice(cart.totalAmount || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                          onClick={onCheckout}
                          disabled={loading}
                          className="w-full py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Processing...' : `Checkout • ${formatPrice(cart.totalAmount || 0)}`}
                        </button>

                        {/* Continue Shopping */}
                        <button
                          onClick={onClose}
                          className="w-full py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          Continue Shopping
                        </button>

                        {/* Cultural Message */}
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            🌟 Supporting Northern Nigerian vendors • Na gode!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}