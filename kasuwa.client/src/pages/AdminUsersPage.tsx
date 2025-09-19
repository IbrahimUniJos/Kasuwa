import { useState, useEffect } from 'react';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/admin';
import type { UserDto, PaginatedApiResponse, UserQueryParams } from '../types/api';
import type { SuspensionDto } from '../services/admin';

interface UserTableProps {
  users: UserDto[];
  onToggleStatus: (userId: string) => void;
  onApproveVendor: (userId: string, approved: boolean) => void;
  onSuspendUser: (userId: string) => void;
  onViewUser: (userId: string) => void;
}

function UserTable({ users, onToggleStatus, onApproveVendor, onSuspendUser, onViewUser }: UserTableProps) {
  const getUserTypeLabel = (userType: number) => {
    switch (userType) {
      case 1: return 'Customer';
      case 2: return 'Vendor';
      case 3: return 'Administrator';
      default: return 'Unknown';
    }
  };

  const getUserTypeBadge = (userType: number) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (userType) {
      case 1: 
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 2: 
        return `${baseClasses} bg-green-100 text-green-800`;
      case 3: 
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default: 
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.profileImageUrl ? (
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={user.profileImageUrl} 
                        alt="" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-kasuwa-primary-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-kasuwa-primary-700">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.businessName && (
                      <div className="text-sm text-gray-500">{user.businessName}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getUserTypeBadge(user.userType)}>
                  {getUserTypeLabel(user.userType)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                  {user.userType === 2 && ( // Vendor
                    user.isVendorApproved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.dateCreated).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => onViewUser(user.id)}
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AdminUsersPageProps {
  className?: string;
}

export default function AdminUsersPage({ className = '' }: AdminUsersPageProps) {
  const { isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, isLoading, pagination.currentPage, searchTerm, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: UserQueryParams = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        searchTerm: searchTerm || undefined,
        role: userTypeFilter || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined
      };

      const response = await adminService.getUsers(params);
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        totalCount: response.totalCount,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleApproveVendor = async (userId: string, approved: boolean) => {
    try {
      await adminService.approveVendor(userId, { isApproved: approved });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating vendor approval:', error);
      alert('Failed to update vendor approval');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowSuspendModal(true);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const user = await adminService.getUser(userId);
      setSelectedUser(user);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all platform users, vendors, and administrators.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                />
              </div>
              
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
              >
                <option value="">All User Types</option>
                <option value="1">Customers</option>
                <option value="2">Vendors</option>
                <option value="3">Administrators</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={fetchUsers}
                className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Users</h2>
              <p className="text-sm text-gray-600">
                {pagination.totalCount} users total
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onToggleStatus={handleToggleStatus}
                onApproveVendor={handleApproveVendor}
                onSuspendUser={handleSuspendUser}
                onViewUser={handleViewUser}
              />
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
                    {pagination.totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {selectedUser.profileImageUrl ? (
                      <img 
                        className="h-16 w-16 rounded-full" 
                        src={selectedUser.profileImageUrl} 
                        alt="" 
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-kasuwa-primary-200 flex items-center justify-center">
                        <span className="text-xl font-medium text-kasuwa-primary-700">
                          {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      {selectedUser.businessName && (
                        <p className="text-gray-600">{selectedUser.businessName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Type</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.userType === 1 ? 'Customer' : 
                         selectedUser.userType === 2 ? 'Vendor' : 
                         selectedUser.userType === 3 ? 'Administrator' : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        {selectedUser.isActive ? (
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
                      <label className="block text-sm font-medium text-gray-700">Joined</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.dateCreated).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedUser.userType === 2 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vendor Status</label>
                      <p className="mt-1">
                        {selectedUser.isVendorApproved ? (
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
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  {selectedUser.userType === 2 && !selectedUser.isVendorApproved && (
                    <button
                      onClick={() => {
                        handleApproveVendor(selectedUser.id, true);
                        setShowUserModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve Vendor
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleToggleStatus(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    className={`px-4 py-2 rounded-md ${
                      selectedUser.isActive 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setShowUserModal(false)}
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