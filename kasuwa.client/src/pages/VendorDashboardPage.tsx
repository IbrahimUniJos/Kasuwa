import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EyeIcon,
  StarIcon,
  ArrowUpIcon,
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PlusIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import VendorAnalytics from '../components/vendor/VendorAnalytics';
import VendorProductManagement from '../components/vendor/VendorProductManagement';
import VendorOrderManagement from '../components/vendor/VendorOrderManagement';
import VendorSettings from '../components/vendor/VendorSettings';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageRating: number;
  yesterdayRevenue: number;
  weeklyRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  thisMonthOrders: number;
  conversionRate: number;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
  url?: string;
}

interface ProductPerformance {
  productId: number;
  productName: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export default function VendorDashboardPage() {
  const { user, isVendor, isVendorApproved } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVendor && isVendorApproved) {
      loadDashboardData();
    }
  }, [isVendor, isVendorApproved]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // This will be implemented when backend is ready
      // const response = await fetch('/api/vendor/dashboard-stats');
      // const data = await response.json();
      
      // Mock data for now
      const mockStats: DashboardStats = {
        totalProducts: 12,
        activeProducts: 10,
        totalOrders: 45,
        pendingOrders: 3,
        totalRevenue: 15420.50,
        monthlyRevenue: 3200.75,
        totalCustomers: 28,
        averageRating: 4.6,
        yesterdayRevenue: 125.00,
        weeklyRevenue: 890.25,
        lowStockProducts: 2,
        outOfStockProducts: 1,
        thisMonthOrders: 12,
        conversionRate: 3.2
      };

      const mockActivities: RecentActivity[] = [
        {
          type: 'order',
          title: 'New Order Received',
          description: 'Order #1234 for ₦2,500',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: 'shopping-bag'
        },
        {
          type: 'product',
          title: 'Product Updated',
          description: 'Updated inventory for Traditional Bag',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          icon: 'cube'
        },
        {
          type: 'review',
          title: 'New Review',
          description: '5-star review on Handwoven Basket',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          icon: 'star'
        }
      ];

      const mockTopProducts: ProductPerformance[] = [
        {
          productId: 1,
          productName: 'Traditional Woven Basket',
          views: 156,
          sales: 8,
          revenue: 2400,
          conversionRate: 5.1
        },
        {
          productId: 2,
          productName: 'Handcrafted Leather Bag',
          views: 89,
          sales: 5,
          revenue: 1750,
          conversionRate: 5.6
        },
        {
          productId: 3,
          productName: 'Ceramic Pottery Set',
          views: 203,
          sales: 12,
          revenue: 3600,
          conversionRate: 5.9
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      setTopProducts(mockTopProducts);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isVendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be a vendor to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isVendorApproved) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <ClockIcon className="h-6 w-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Vendor Approval Pending
                </h3>
                <p className="text-amber-700 mb-4">
                  Your vendor account is currently under review. Our team is verifying your business information 
                  to ensure the best experience for all Kasuwa users.
                </p>
                <div className="bg-amber-100 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">What happens next?</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Our team will review your business information within 2-3 business days</li>
                    <li>• You'll receive an email notification once your account is approved</li>
                    <li>• After approval, you can start listing and selling your products</li>
                    <li>• You can still browse and purchase products while waiting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'products', name: 'Products', icon: CubeIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'analytics', name: 'Analytics', icon: EyeIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kasuwa-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName}! Manage your business on Kasuwa marketplace.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Approved Vendor
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-kasuwa-primary-500 text-kasuwa-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-kasuwa-primary-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                      {stats?.activeProducts || 0} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {stats?.pendingOrders || 0} pending
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₦{stats?.totalRevenue?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ₦{stats?.monthlyRevenue?.toLocaleString() || '0'} this month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <StarIcon className="w-4 h-4 mr-1" />
                      {stats?.averageRating || 0} avg rating
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="p-4 border border-kasuwa-primary-200 rounded-lg hover:bg-kasuwa-primary-50 transition-colors text-left"
                >
                  <PlusIcon className="h-8 w-8 text-kasuwa-primary-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-600 mt-1">List a new product for sale</p>
                </button>

                <button 
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <TruckIcon className="h-8 w-8 text-gray-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Manage Orders</h3>
                  <p className="text-sm text-gray-600 mt-1">Process and track orders</p>
                </button>

                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <ChartBarIcon className="h-8 w-8 text-gray-600 mb-2" />
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your sales performance</p>
                </button>
              </div>
            </div>

            {/* Recent Activity & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-kasuwa-primary-100 rounded-full flex items-center justify-center">
                        {activity.icon === 'shopping-bag' && <ShoppingBagIcon className="w-4 h-4 text-kasuwa-primary-600" />}
                        {activity.icon === 'cube' && <CubeIcon className="w-4 h-4 text-kasuwa-primary-600" />}
                        {activity.icon === 'star' && <StarIcon className="w-4 h-4 text-kasuwa-primary-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Products</h2>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-600">
                          {product.views} views • {product.sales} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₦{product.revenue.toLocaleString()}</p>
                        <p className="text-xs text-green-600">{product.conversionRate}% conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <VendorProductManagement vendorId={user?.id} />
        )}

        {activeTab === 'orders' && (
          <VendorOrderManagement vendorId={user?.id} />
        )}

        {activeTab === 'analytics' && (
          <VendorAnalytics vendorId={user?.id} />
        )}

        {activeTab === 'settings' && (
          <VendorSettings vendorId={user?.id} />
        )}
      </div>
    </div>
  );
}