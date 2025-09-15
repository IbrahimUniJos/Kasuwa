import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingBagIcon,
  HeartIcon,
  ClockIcon,
  CreditCardIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CustomerDashboard() {
  const { user, isCustomer } = useAuth();

  if (!isCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be a customer to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Manage your orders and account settings.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-kasuwa-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">?0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-kasuwa-primary-200 rounded-lg hover:bg-kasuwa-primary-50 transition-colors">
              <ShoppingBagIcon className="h-8 w-8 text-kasuwa-primary-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Browse Products</h3>
              <p className="text-sm text-gray-600 mt-1">Discover amazing products</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <HeartIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">View Wishlist</h3>
              <p className="text-sm text-gray-600 mt-1">Check your saved items</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ClockIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Order History</h3>
              <p className="text-sm text-gray-600 mt-1">Track your past orders</p>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Orders</h2>
          <div className="text-center py-8">
            <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here!</p>
            <button className="bg-kasuwa-primary-600 text-white px-6 py-2 rounded-lg hover:bg-kasuwa-primary-700 transition-colors">
              Browse Products
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Customer
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">
                {user?.dateCreated ? new Date(user.dateCreated).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="bg-kasuwa-primary-600 text-white px-4 py-2 rounded-lg hover:bg-kasuwa-primary-700 transition-colors mr-4">
              Edit Profile
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Change Password
            </button>
          </div>
        </div>

        {/* Become a Vendor CTA */}
        <div className="mt-8 bg-gradient-to-r from-kasuwa-secondary-50 to-kasuwa-primary-50 rounded-lg p-6 border border-kasuwa-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interested in selling on Kasuwa?
              </h3>
              <p className="text-gray-600">
                Join thousands of vendors selling their products on Nigeria's fastest-growing marketplace.
              </p>
            </div>
            <button className="bg-kasuwa-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-kasuwa-secondary-700 transition-colors whitespace-nowrap">
              Become a Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}