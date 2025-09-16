import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptRefundIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import type { OrderDto, UserDto } from '../types/api';

interface OrdersPageProps {
  user?: UserDto;
}

// Mock data for demonstration
const mockOrders: OrderDto[] = [
  {
    id: 1,
    orderNumber: 'KAS-2024-001',
    status: 'Delivered',
    totalAmount: 25000,
    subtotal: 22000,
    taxAmount: 2000,
    shippingAmount: 1000,
    discountAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    createdAt: '2024-01-15T10:30:00Z',
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        unitPrice: 11000,
        totalPrice: 22000,
        productName: 'Traditional Hausa Cap',
        productSku: 'HAU-CAP-001',
        productVariant: 'Red, Large',
        productImageUrl: '/images/hausa-cap.jpg',
        vendorId: 'vendor-1'
      }
    ],
    shippingAddress: {
      id: 1,
      addressLine1: '123 Ahmadu Bello Way',
      addressLine2: 'Suite 101',
      city: 'Kaduna',
      state: 'Kaduna State',
      postalCode: '800001',
      country: 'Nigeria',
      isDefault: true
    },
    billingAddress: {
      id: 1,
      addressLine1: '123 Ahmadu Bello Way',
      addressLine2: 'Suite 101',
      city: 'Kaduna',
      state: 'Kaduna State',
      postalCode: '800001',
      country: 'Nigeria',
      isDefault: true
    }
  },
  {
    id: 2,
    orderNumber: 'KAS-2024-002',
    status: 'Shipped',
    totalAmount: 18500,
    subtotal: 16000,
    taxAmount: 1500,
    shippingAmount: 1000,
    discountAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-01-20T14:45:00Z',
    items: [
      {
        id: 2,
        productId: 2,
        quantity: 1,
        unitPrice: 16000,
        totalPrice: 16000,
        productName: 'Ankara Print Fabric',
        productSku: 'ANK-FAB-002',
        productVariant: 'Blue Pattern, 6 yards',
        productImageUrl: '/images/ankara-fabric.jpg',
        vendorId: 'vendor-2'
      }
    ],
    shippingAddress: {
      id: 1,
      addressLine1: '123 Ahmadu Bello Way',
      addressLine2: 'Suite 101',
      city: 'Kaduna',
      state: 'Kaduna State',
      postalCode: '800001',
      country: 'Nigeria',
      isDefault: true
    }
  },
  {
    id: 3,
    orderNumber: 'KAS-2024-003',
    status: 'Processing',
    totalAmount: 32000,
    subtotal: 30000,
    taxAmount: 2000,
    shippingAmount: 0,
    discountAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    createdAt: '2024-01-25T09:15:00Z',
    items: [
      {
        id: 3,
        productId: 3,
        quantity: 1,
        unitPrice: 30000,
        totalPrice: 30000,
        productName: 'Handwoven Kente Cloth',
        productSku: 'KEN-CLO-003',
        productVariant: 'Gold & Black, Premium',
        productImageUrl: '/images/kente-cloth.jpg',
        vendorId: 'vendor-3'
      }
    ],
    shippingAddress: {
      id: 1,
      addressLine1: '123 Ahmadu Bello Way',
      addressLine2: 'Suite 101',
      city: 'Kaduna',
      state: 'Kaduna State',
      postalCode: '800001',
      country: 'Nigeria',
      isDefault: true
    }
  }
];

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'shipped':
      return <TruckIcon className="w-5 h-5 text-blue-500" />;
    case 'processing':
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case 'cancelled':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage({ user }: OrdersPageProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        case 'year':
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTrackOrder = (orderNumber: string) => {
    // Navigate to order tracking page or show tracking modal
    console.log('Track order:', orderNumber);
  };

  const handleReorder = (order: OrderDto) => {
    // Add order items to cart
    console.log('Reorder:', order);
  };

  const handleRequestReturn = (order: OrderDto) => {
    // Navigate to return request page
    console.log('Request return for order:', order);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your order history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-500">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptRefundIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search criteria.'
                : "You haven't placed any orders yet."}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => handleTrackOrder(order.orderNumber)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <TruckIcon className="w-4 h-4 mr-2" />
                      Track Order
                    </button>
                    
                    {order.status.toLowerCase() === 'delivered' && (
                      <>
                        <button
                          onClick={() => handleReorder(order)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={() => handleRequestReturn(order)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ReceiptRefundIcon className="w-4 h-4 mr-2" />
                          Return
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order.id && (
                  <div className="p-6">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.productImageUrl ? (
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">No Image</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                              </h5>
                              <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                              {item.productVariant && (
                                <p className="text-sm text-gray-500">Variant: {item.productVariant}</p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-sm text-gray-500">
                                ₦{item.unitPrice.toLocaleString()} each
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                ₦{item.totalPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary & Shipping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Summary */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">₦{order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="text-gray-900">₦{order.taxAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-900">
                              {order.shippingAmount === 0 ? 'Free' : `₦${order.shippingAmount.toLocaleString()}`}
                            </span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount:</span>
                              <span className="text-green-600">-₦{order.discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">Total:</span>
                              <span className="font-semibold text-gray-900">₦{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="text-gray-900">{order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="text-sm text-gray-900">
                              <p>{order.shippingAddress.addressLine1}</p>
                              {order.shippingAddress.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                              </p>
                              <p>{order.shippingAddress.country}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}