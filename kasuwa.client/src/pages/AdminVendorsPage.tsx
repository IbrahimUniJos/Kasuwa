import { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/admin';
import type { UserDto, PaginatedApiResponse } from '../types/api';

interface VendorCardProps {
  vendor: UserDto;
  onApprove: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
  onViewDetails: (vendorId: string) => void;
}

function VendorCard({ vendor, onApprove, onReject, onViewDetails }: VendorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {vendor.profileImageUrl ? (
              <img 
                className="h-12 w-12 rounded-full" 
                src={vendor.profileImageUrl} 
                alt="" 
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-kasuwa-primary-200 flex items-center justify-center">
                <span className="text-lg font-medium text-kasuwa-primary-700">
                  {vendor.firstName.charAt(0)}{vendor.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {vendor.businessName || `${vendor.firstName} ${vendor.lastName}`}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <UserIcon className="h-4 w-4 mr-1" />
              {vendor.firstName} {vendor.lastName}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              {vendor.email}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {vendor.isVendorApproved ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Approved
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ClockIcon className="h-3 w-3 mr-1" />
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Applied:</strong> {new Date(vendor.dateCreated).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {vendor.isActive ? 'Active' : 'Inactive'}</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(vendor.id)}
          className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700 text-sm font-medium"
        >
          View Details
        </button>
        
        {!vendor.isVendorApproved && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReject(vendor.id)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 rounded-md text-sm hover:bg-red-50"
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Reject
            </button>
            <button
              onClick={() => onApprove(vendor.id)}
              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminVendorsPageProps {
  className?: string;
}

export default function AdminVendorsPage({ className = '' }: AdminVendorsPageProps) {
  const { isAdmin, isLoading } = useAuth();
  const [pendingVendors, setPendingVendors] = useState<UserDto[]>([]);
  const [allVendors, setAllVendors] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<UserDto | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  });

  const [allVendorsPagination, setAllVendorsPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchVendors();
    }
  }, [isAdmin, isLoading, activeTab]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const response = await adminService.getPendingVendors(
          pendingPagination.currentPage, 
          pendingPagination.pageSize
        );
        setPendingVendors(response.data || []);
        setPendingPagination(prev => ({
          ...prev,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0
        }));
      } else {
        // Fetch all vendors
        const response = await adminService.getUsers({
          page: allVendorsPagination.currentPage,
          pageSize: allVendorsPagination.pageSize,
          role: '2', // Vendor user type
          searchTerm: searchTerm || undefined
        });
        setAllVendors(response.data || []);
        setAllVendorsPagination(prev => ({
          ...prev,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors');
      // Set empty arrays on error to prevent undefined access
      if (activeTab === 'pending') {
        setPendingVendors([]);
      } else {
        setAllVendors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await adminService.approveVendor(vendorId, { isApproved: true });
      await fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error approving vendor:', error);
      alert('Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to reject this vendor application?')) {
      return;
    }

    try {
      await adminService.approveVendor(vendorId, { isApproved: false });
      await fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      alert('Failed to reject vendor');
    }
  };

  const handleViewVendorDetails = async (vendorId: string) => {
    try {
      const vendor = await adminService.getUser(vendorId);
      setSelectedVendor(vendor);
      setShowVendorModal(true);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      alert('Failed to load vendor details');
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'pending') {
      setPendingPagination(prev => ({ ...prev, currentPage: page }));
    } else {
      setAllVendorsPagination(prev => ({ ...prev, currentPage: page }));
    }
    fetchVendors();
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
          <p className="text-gray-600">You don't have permission to access vendor management.</p>
        </div>
      </div>
    );
  }

  const currentPagination = activeTab === 'pending' ? pendingPagination : allVendorsPagination;
  const currentVendors = activeTab === 'pending' ? (pendingVendors || []) : (allVendors || []);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage vendor applications and accounts.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-kasuwa-primary-500 text-kasuwa-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Applications
              {pendingPagination.totalCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs">
                  {pendingPagination.totalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-kasuwa-primary-500 text-kasuwa-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Vendors
            </button>
          </nav>
        </div>

        {/* Search for All Vendors Tab */}
        {activeTab === 'all' && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchVendors()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading vendors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchVendors}
              className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : currentVendors.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'pending' ? 'No Pending Applications' : 'No Vendors Found'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'There are no vendor applications waiting for approval.' 
                : 'No vendors match your search criteria.'}
            </p>
          </div>
        ) : (
          <>
            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentVendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onApprove={handleApproveVendor}
                  onReject={handleRejectVendor}
                  onViewDetails={handleViewVendorDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPagination.currentPage - 1) * currentPagination.pageSize) + 1} to{' '}
                {Math.min(currentPagination.currentPage * currentPagination.pageSize, currentPagination.totalCount)} of{' '}
                {currentPagination.totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPagination.currentPage} of {currentPagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage >= currentPagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Vendor Details Modal */}
        {showVendorModal && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Vendor Details</h3>
                  <button
                    onClick={() => setShowVendorModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Vendor Profile */}
                  <div className="flex items-center space-x-4">
                    {selectedVendor.profileImageUrl ? (
                      <img 
                        className="h-20 w-20 rounded-full" 
                        src={selectedVendor.profileImageUrl} 
                        alt="" 
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-kasuwa-primary-200 flex items-center justify-center">
                        <span className="text-2xl font-medium text-kasuwa-primary-700">
                          {selectedVendor.firstName.charAt(0)}{selectedVendor.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedVendor.businessName || `${selectedVendor.firstName} ${selectedVendor.lastName}`}
                      </h4>
                      <p className="text-gray-600">{selectedVendor.firstName} {selectedVendor.lastName}</p>
                      <p className="text-gray-600">{selectedVendor.email}</p>
                    </div>
                  </div>
                  
                  {/* Business Information */}
                  {selectedVendor.businessName && (
                    <div>
                      <h5 className="text-lg font-medium text-gray-900 mb-3">Business Information</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Business Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedVendor.businessName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Application Date</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedVendor.dateCreated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Account Status */}
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 mb-3">Account Status</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Account Status</label>
                        <p className="mt-1">
                          {selectedVendor.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor Status</label>
                        <p className="mt-1">
                          {selectedVendor.isVendorApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Login</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.lastLogin ? new Date(selectedVendor.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  {!selectedVendor.isVendorApproved && (
                    <>
                      <button
                        onClick={() => {
                          handleRejectVendor(selectedVendor.id);
                          setShowVendorModal(false);
                        }}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          handleApproveVendor(selectedVendor.id);
                          setShowVendorModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Approve Vendor
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowVendorModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}