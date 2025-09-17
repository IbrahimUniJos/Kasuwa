import { useAuth } from '../../contexts/AuthContext';
import { 
  BuildingStorefrontIcon,
  ChartBarIcon,
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function VendorDashboard() {
  const { user, isVendor, isVendorApproved } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Manage your business on Kasuwa marketplace.
          </p>
        </div>

        {/* Vendor Status Alert */}
        {!isVendorApproved && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
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
                    <li>� Our team will review your business information within 2-3 business days</li>
                    <li>� You'll receive an email notification once your account is approved</li>
                    <li>� After approval, you can start listing and selling your products</li>
                    <li>� You can still browse and purchase products while waiting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approved Vendor Content */}
        {isVendorApproved && (
          <>
            {/* Success Message */}
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Congratulations! Your vendor account is approved.
                  </h3>
                  <p className="text-green-700 mt-1">
                    You can now start listing products and managing your business on Kasuwa.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-kasuwa-primary-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">?0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Store Views</p>
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
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-kasuwa-primary-200 rounded-lg hover:bg-kasuwa-primary-50 transition-colors">
                  <CubeIcon className="h-8 w-8 text-kasuwa-primary-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-600 mt-1">List a new product for sale</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ChartBarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your sales performance</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <BuildingStorefrontIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Manage Store</h3>
                  <p className="text-sm text-gray-600 mt-1">Update your store information</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <p className="text-gray-900">{user?.businessName || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isVendorApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isVendorApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900">{user?.email}</p>
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

          {!isVendorApproved && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-kasuwa-primary-600 text-white px-4 py-2 rounded-lg hover:bg-kasuwa-primary-700 transition-colors">
                Update Business Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}