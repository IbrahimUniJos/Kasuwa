import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  TruckIcon,
  MapPinIcon,
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { cartService } from '../services/cart';
import { orderService } from '../services/orders';
import { addressService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { 
  CartDto, 
  AddressDto, 
  CreateOrderDto, 
  CreateAddressDto,
  PaymentDto 
} from '../types/api';

interface CheckoutStep {
  id: string;
  name: string;
  completed: boolean;
}

const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: 'cart', name: 'Cart Review', completed: false },
  { id: 'shipping', name: 'Shipping', completed: false },
  { id: 'payment', name: 'Payment', completed: false },
  { id: 'confirmation', name: 'Confirmation', completed: false },
];

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Verve',
    icon: CreditCardIcon,
    provider: 'Paystack'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: BanknotesIcon,
    provider: 'Flutterwave'
  },
  {
    id: 'ussd',
    name: 'USSD',
    description: 'Pay with *737# or *901#',
    icon: BanknotesIcon,
    provider: 'Paystack'
  }
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  'Federal Capital Territory'
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState<string>('cart');
  const [cart, setCart] = useState<CartDto | null>(null);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<AddressDto | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<AddressDto | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<CreateAddressDto>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: user?.email || '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth/login?redirect=/checkout');
      return;
    }
    
    loadCheckoutData();
  }, [user, navigate]);

  const loadCheckoutData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [cartData, addressesData] = await Promise.all([
        cartService.getCart(),
        addressService.getAddresses()
      ]);

      if (!cartData.items || cartData.items.length === 0) {
        navigate('/cart');
        return;
      }

      setCart(cartData);
      setAddresses(addressesData);
      
      // Set default shipping address if available
      const defaultAddress = addressesData.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedShippingAddress(defaultAddress);
        if (useSameAddress) {
          setSelectedBillingAddress(defaultAddress);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
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
    if (!cart) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    
    const subtotal = cart.totalAmount;
    const shipping = subtotal >= 10000 ? 0 : 1500; // Free shipping over ?10,000
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  const handleStepNavigation = (stepId: string) => {
    if (stepId === 'cart' || 
        (stepId === 'shipping' && currentStep !== 'cart') ||
        (stepId === 'payment' && ['shipping', 'payment', 'confirmation'].includes(currentStep))) {
      setCurrentStep(stepId);
    }
  };

  const handleContinueToShipping = () => {
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setCurrentStep('shipping');
  };

  const handleContinueToPayment = () => {
    if (!selectedShippingAddress) {
      setError('Please select a shipping address');
      return;
    }
    
    if (!useSameAddress && !selectedBillingAddress) {
      setError('Please select a billing address');
      return;
    }
    
    setCurrentStep('payment');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const newAddress = await addressService.createAddress(addressForm);
      
      setAddresses([...addresses, newAddress]);
      setSelectedShippingAddress(newAddress);
      
      if (useSameAddress) {
        setSelectedBillingAddress(newAddress);
      }
      
      setShowAddressForm(false);
      setAddressForm({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        isDefault: false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add address');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      if (!selectedShippingAddress) {
        throw new Error('Shipping address is required');
      }

      if (!selectedPaymentMethod) {
        throw new Error('Payment method is required');
      }

      // Create order
      const orderData: CreateOrderDto = {
        shippingAddressId: selectedShippingAddress.id,
        billingAddressId: useSameAddress ? selectedShippingAddress.id : selectedBillingAddress?.id,
        paymentMethod: selectedPaymentMethod,
        notes: ''
      };

      const order = await orderService.createOrder(orderData);
      
      // For demo purposes, simulate successful payment
      // In a real app, this would integrate with payment providers
      setOrderNumber(order.orderNumber || `KAS-${Date.now()}`);
      setOrderPlaced(true);
      setCurrentStep('confirmation');
      
      // Clear cart after successful order
      await cartService.clearCart();
      
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {CHECKOUT_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepNavigation(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep === step.id
                    ? 'bg-kasuwa-primary-600 text-white'
                    : step.completed || CHECKOUT_STEPS.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed || CHECKOUT_STEPS.findIndex(s => s.id === currentStep) > index ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </button>
              <span className={`mt-2 text-sm font-medium ${
                currentStep === step.id ? 'text-kasuwa-primary-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
            
            {index < CHECKOUT_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                CHECKOUT_STEPS.findIndex(s => s.id === currentStep) > index
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderCartReview = () => {
    if (!cart) return null;
    
    const totals = calculateTotals();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Order</h3>
          
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0].imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-kasuwa-primary-100 to-kasuwa-secondary-100 flex items-center justify-center">
                      <span className="text-lg">???</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} � {formatPrice(item.unitPrice)}
                  </p>
                  {item.productVariant && (
                    <p className="text-sm text-gray-500">{item.productVariant}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">
                  {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (7.5%):</span>
                <span className="text-gray-900">{formatPrice(totals.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">{formatPrice(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 inline mr-2" />
            Back to Cart
          </button>
          <button
            onClick={handleContinueToShipping}
            className="flex-1 py-3 px-6 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
          >
            Continue to Shipping
          </button>
        </div>
      </div>
    );
  };

  const renderShipping = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
        
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <label key={address.id} className="block">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedShippingAddress?.id === address.id
                    ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingAddress"
                      value={address.id}
                      checked={selectedShippingAddress?.id === address.id}
                      onChange={() => {
                        setSelectedShippingAddress(address);
                        if (useSameAddress) {
                          setSelectedBillingAddress(address);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 text-kasuwa-primary-600 border-gray-300 focus:ring-kasuwa-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No saved addresses found</p>
          </div>
        )}
        
        <button
          onClick={() => setShowAddressForm(true)}
          className="mt-4 flex items-center space-x-2 text-kasuwa-primary-600 hover:text-kasuwa-primary-700 font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Billing Address */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
        
        <label className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => {
              setUseSameAddress(e.target.checked);
              if (e.target.checked) {
                setSelectedBillingAddress(selectedShippingAddress);
              } else {
                setSelectedBillingAddress(null);
              }
            }}
            className="h-4 w-4 text-kasuwa-primary-600 border-gray-300 rounded focus:ring-kasuwa-primary-500"
          />
          <span className="text-sm text-gray-900">Same as shipping address</span>
        </label>
        
        {!useSameAddress && (
          <div className="space-y-4">
            {addresses.map((address) => (
              <label key={address.id} className="block">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedBillingAddress?.id === address.id
                    ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="billingAddress"
                      value={address.id}
                      checked={selectedBillingAddress?.id === address.id}
                      onChange={() => setSelectedBillingAddress(address)}
                      className="mt-0.5 h-4 w-4 text-kasuwa-primary-600 border-gray-300 focus:ring-kasuwa-primary-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('cart')}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Cart
        </button>
        <button
          onClick={handleContinueToPayment}
          disabled={!selectedShippingAddress || (!useSameAddress && !selectedBillingAddress)}
          className="flex-1 py-3 px-6 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPayment = () => {
    if (!cart) return null;
    
    const totals = calculateTotals();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-4">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.id} className="block">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-kasuwa-primary-600 border-gray-300 focus:ring-kasuwa-primary-500"
                    />
                    <method.icon className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className="text-xs text-gray-500">Powered by {method.provider}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Form (for card payments) */}
        {selectedPaymentMethod === 'card' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={paymentForm.email}
                  onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.totalItems} items):</span>
              <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">
                {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT (7.5%):</span>
              <span className="text-gray-900">{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-semibold text-kasuwa-primary-600 text-lg">
                {formatPrice(totals.total)}
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-2 text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Secure payment powered by Paystack & Flutterwave</span>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('shipping')}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Shipping
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={processing}
            className="flex-1 py-3 px-6 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : `Place Order � ${formatPrice(totals.total)}`}
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Order Placed Successfully! ??
        </h2>
        
        <p className="text-gray-600 mb-6">
          Thank you for your order. We've received your order and will start processing it soon.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="text-lg font-semibold text-gray-900">#{orderNumber}</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-6">
          <TruckIcon className="h-4 w-4" />
          <span>Expected delivery: 3-7 business days</span>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders`)}
            className="w-full py-3 px-6 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
          >
            View Your Orders
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full py-2 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ?? Na gode! Thank you for supporting Northern Nigerian vendors
          </p>
        </div>
      </div>
    </div>
  );

  // Address form modal
  const renderAddressForm = () => {
    if (!showAddressForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
            
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="state"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="h-4 w-4 text-kasuwa-primary-600 border-gray-300 rounded focus:ring-kasuwa-primary-500"
                  />
                  <span className="text-sm text-gray-900">Set as default address</span>
                </label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2 px-4 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order securely</p>
        </div>

        {renderStepIndicator()}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {currentStep === 'cart' && renderCartReview()}
        {currentStep === 'shipping' && renderShipping()}
        {currentStep === 'payment' && renderPayment()}
        {currentStep === 'confirmation' && renderConfirmation()}

        {renderAddressForm()}
      </div>
    </div>
  );
}