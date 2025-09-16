import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import type { UserDto, ChangePasswordRequestDto, AddressDto, CreateAddressDto } from '../types/api';

interface ProfilePageProps {
  user?: UserDto;
  onUpdateUser?: (user: UserDto) => void;
}

export default function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    profileImageUrl: user?.profileImageUrl || ''
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequestDto>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Addresses state
  const [addresses] = useState<AddressDto[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);
  const [addressForm, setAddressForm] = useState<CreateAddressDto>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Update form with user data
    setProfileForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      businessName: user.businessName || '',
      profileImageUrl: user.profileImageUrl || ''
    });

    // Load user addresses and other data
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      // Load addresses and other user-specific data
      // This would call backend APIs to get user addresses, preferences, etc.
      console.log('Loading user data...');
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call backend API to update profile
      // const updatedUser = await userService.updateProfile(profileForm);
      // For now, create updated user from current data and form
      const updatedUser = { ...user!, ...profileForm };
      onUpdateUser?.(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // await authService.changePassword(passwordForm);
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingAddress) {
        // Update existing address
        console.log('Updating address:', addressForm);
      } else {
        // Create new address
        console.log('Creating address:', addressForm);
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
      setSuccess('Address saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
      isDefault: false
    });
  };

  const tabButtons = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', label: 'Preferences', icon: BellIcon }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  `${user.firstName[0]}${user.lastName[0]}`
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-kasuwa-primary-600 rounded-full flex items-center justify-center text-white hover:bg-kasuwa-primary-700 transition-colors">
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              {user.businessName && (
                <p className="text-kasuwa-primary-600 font-medium">{user.businessName}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {user.userType === 2 && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isVendorApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isVendorApproved ? 'Approved Vendor' : 'Pending Approval'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabButtons.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-kasuwa-primary-500 text-kasuwa-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 disabled:opacity-50"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="First name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled={true}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          placeholder="Email address"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed. Contact support if you need to update your email.
                      </p>
                    </div>

                    {user.userType === 2 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="Business name"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <p className="text-sm text-gray-900">
                          {user.userType === 1 ? 'Customer' : user.userType === 2 ? 'Vendor' : 'Administrator'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Member Since
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(user.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700"
                  >
                    Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add a shipping address to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {address.addressLine1}
                            </h3>
                            {address.addressLine2 && (
                              <p className="text-sm text-gray-600">{address.addressLine2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-kasuwa-primary-100 text-kasuwa-primary-800 mt-2">
                                Default
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setAddressForm(address);
                              setShowAddressForm(true);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-lg bg-white rounded-lg shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            resetAddressForm();
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country *
                            </label>
                            <select
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                              required
                            >
                              <option value="Nigeria">Nigeria</option>
                              <option value="Ghana">Ghana</option>
                              <option value="Kenya">Kenya</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="h-4 w-4 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              resetAddressForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                        required
                        minLength={8}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 disabled:opacity-50"
                    >
                      <KeyIcon className="w-4 h-4 mr-2" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Security Settings */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 ${
                          securitySettings.twoFactorEnabled ? 'bg-kasuwa-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive order updates and important account information</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, emailNotifications: !securitySettings.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 ${
                          securitySettings.emailNotifications ? 'bg-kasuwa-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            securitySettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, smsNotifications: !securitySettings.smsNotifications })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 ${
                          securitySettings.smsNotifications ? 'bg-kasuwa-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            securitySettings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                        <p className="text-sm text-gray-500">Receive newsletters and promotional offers</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({ ...securitySettings, marketingEmails: !securitySettings.marketingEmails })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 ${
                          securitySettings.marketingEmails ? 'bg-kasuwa-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            securitySettings.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}