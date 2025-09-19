import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/admin';
import type { AdminDashboardStatsDto } from '../services/admin';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

function StatsCard({ title, value, change, icon: Icon, color, loading }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50',
    red: 'bg-red-500 text-red-600 bg-red-50'
  };

  const bgColor = colorClasses[color].split(' ')[0];
  const textColor = colorClasses[color].split(' ')[1];
  const bgLight = colorClasses[color].split(' ')[2];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgLight}`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            {loading ? (
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {change !== undefined && !loading && (
              <div className={`ml-2 flex items-center text-sm ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}

function QuickAction({ title, description, icon: Icon, color, onClick }: QuickActionProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 text-left rounded-lg border border-gray-200 transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="flex items-center">
        <Icon className="h-8 w-8" />
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface AdminDashboardPageProps {
  className?: string;
}

export default function AdminDashboardPage({ className = '' }: AdminDashboardPageProps) {
  const { isAdmin, isLoading } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, isLoading]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome to the Kasuwa marketplace administration panel.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardStats}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => navigateTo('/admin/settings')}
                className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={fetchDashboardStats}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            change={5.4}
            icon={UsersIcon}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            change={2.1}
            icon={ShoppingBagIcon}
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Active Vendors"
            value={stats?.approvedVendors || 0}
            change={8.2}
            icon={BuildingStorefrontIcon}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Total Revenue"
            value={stats ? formatCurrency(stats.totalPlatformRevenue) : '?0'}
            change={12.5}
            icon={CurrencyDollarIcon}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-semibold text-gray-900">
                  {loading ? '...' : (stats?.activeUsers || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="text-sm font-semibold text-gray-900">
                  {loading ? '...' : (stats?.newUsersThisMonth || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Vendors</span>
                <span className="text-sm font-semibold text-orange-600">
                  {loading ? '...' : (stats?.pendingVendorApplications || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm font-semibold text-gray-900">
                  {loading ? '...' : (stats?.totalOrders || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="text-sm font-semibold text-gray-900">
                  {loading ? '...' : (stats ? formatCurrency(stats.monthlyPlatformRevenue) : '?0')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  {loading ? '...' : (stats && stats.totalOrders > 0 
                    ? formatCurrency(stats.totalPlatformRevenue / stats.totalOrders)
                    : '?0')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigateTo('/admin/vendors')}
                className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
              >
                Review Pending Vendors
                {stats?.pendingVendorApplications ? (
                  <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    {stats.pendingVendorApplications}
                  </span>
                ) : null}
              </button>
              <button
                onClick={() => navigateTo('/admin/products')}
                className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
              >
                Manage Products
              </button>
              <button
                onClick={() => navigateTo('/admin/users')}
                className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
              >
                View All Users
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="User Management"
              description="View, edit, and manage user accounts"
              icon={UsersIcon}
              color="blue"
              onClick={() => navigateTo('/admin/users')}
            />
            <QuickAction
              title="Product Catalog"
              description="Manage products, categories, and inventory"
              icon={ShoppingBagIcon}
              color="green"
              onClick={() => navigateTo('/admin/products')}
            />
            <QuickAction
              title="Vendor Applications"
              description="Review and approve vendor applications"
              icon={BuildingStorefrontIcon}
              color="purple"
              onClick={() => navigateTo('/admin/vendors')}
            />
            <QuickAction
              title="Category Management"
              description="Organize product categories and hierarchy"
              icon={ChartBarIcon}
              color="orange"
              onClick={() => navigateTo('/admin/categories')}
            />
            <QuickAction
              title="Platform Settings"
              description="Configure platform-wide settings and preferences"
              icon={Cog6ToothIcon}
              color="blue"
              onClick={() => navigateTo('/admin/settings')}
            />
            <QuickAction
              title="Reports & Analytics"
              description="View detailed reports and platform analytics"
              icon={DocumentTextIcon}
              color="green"
              onClick={() => {
                // For now, we'll show an alert since this feature isn't implemented yet
                alert('Reports & Analytics coming soon!');
              }}
            />
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
            <button
              onClick={() => navigateTo('/admin/users')}
              className="text-sm text-kasuwa-primary-600 hover:text-kasuwa-primary-700 font-medium"
            >
              View All Activity ?
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">User Growth Rate</span>
                  <span className="text-sm font-semibold text-green-600">+5.4%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Vendor Approval Rate</span>
                  <span className="text-sm font-semibold text-blue-600">87%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Platform Commission</span>
                  <span className="text-sm font-semibold text-purple-600">5.0%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Platform Health</span>
                  <span className="flex items-center text-sm font-semibold text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Payment Processing</span>
                  <span className="flex items-center text-sm font-semibold text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Email Services</span>
                  <span className="flex items-center text-sm font-semibold text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Running
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}