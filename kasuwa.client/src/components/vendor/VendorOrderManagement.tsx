import { useState, useEffect } from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  orderDate: string;
  shippingAddress: string;
  items: OrderItem[];
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  trackingNumber?: string;
}

interface VendorOrderManagementProps {
  vendorId?: string;
}

export default function VendorOrderManagement({ vendorId }: VendorOrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [vendorId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'Amina Hassan',
          customerEmail: 'amina.hassan@email.com',
          status: 'Processing',
          totalAmount: 599.98,
          orderDate: '2024-01-15T10:30:00Z',
          shippingAddress: '123 Ahmadu Bello Way, Abuja, Nigeria',
          paymentStatus: 'Paid',
          items: [
            {
              id: '1',
              productName: 'Traditional Woven Basket',
              productSku: 'TWB001',
              quantity: 2,
              unitPrice: 299.99,
              totalPrice: 599.98
            }
          ]
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Kemi Adebayo',
          customerEmail: 'kemi.adebayo@email.com',
          status: 'Shipped',
          totalAmount: 499.99,
          orderDate: '2024-01-14T14:20:00Z',
          shippingAddress: '456 Victoria Island, Lagos, Nigeria',
          paymentStatus: 'Paid',
          trackingNumber: 'TRK123456789',
          items: [
            {
              id: '2',
              productName: 'Handcrafted Leather Bag',
              productSku: 'HLB002',
              quantity: 1,
              unitPrice: 499.99,
              totalPrice: 499.99
            }
          ]
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Ibrahim Musa',
          customerEmail: 'ibrahim.musa@email.com',
          status: 'Pending',
          totalAmount: 159.99,
          orderDate: '2024-01-16T09:15:00Z',
          shippingAddress: '789 Kaduna Road, Kano, Nigeria',
          paymentStatus: 'Pending',
          items: [
            {
              id: '3',
              productName: 'Ceramic Pottery Set',
              productSku: 'CPS003',
              quantity: 1,
              unitPrice: 159.99,
              totalPrice: 159.99
            }
          ]
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter) {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, trackingNumber: newStatus === 'Shipped' ? `TRK${Date.now()}` : order.trackingNumber }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-indigo-100 text-indigo-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Paid: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
      Refunded: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <FunnelIcon className="w-5 h-5 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      {order.trackingNumber && (
                        <div className="text-sm text-gray-500">Track: {order.trackingNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(order.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₦{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-kasuwa-primary-600 hover:text-kasuwa-primary-900"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Processing')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Accept Order"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      {order.status === 'Processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Shipped')}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Mark as Shipped"
                        >
                          <TruckIcon className="w-5 h-5" />
                        </button>
                      )}
                      
                      {(order.status === 'Pending' || order.status === 'Processing') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Order"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter || paymentFilter 
              ? 'Try adjusting your filters.'
              : 'Orders will appear here once customers start purchasing your products.'
            }
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Status and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedOrder.status)}
                      {selectedOrder.trackingNumber && (
                        <span className="text-sm text-gray-600">
                          Track: {selectedOrder.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm"><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p className="text-sm"><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.productSku}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₦{item.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">₦{item.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: ₦{selectedOrder.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedOrder.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Processing');
                          setSelectedOrder(null);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Cancelled');
                          setSelectedOrder(null);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                      >
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        Cancel Order
                      </button>
                    </>
                  )}
                  
                  {selectedOrder.status === 'Processing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Shipped');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                    >
                      <TruckIcon className="w-5 h-5 mr-2" />
                      Mark as Shipped
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}