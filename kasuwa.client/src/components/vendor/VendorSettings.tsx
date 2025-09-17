import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface VendorSettingsProps {
  vendorId?: string;
}

interface VendorProfile {
  businessName: string;
  businessDescription: string;
  businessPhone: string;
  businessAddress: string;
  businessCategory: string;
  businessWebsite: string;
  taxId: string;
}

interface NotificationSettings {
  orderNotifications: boolean;
  paymentNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
}

export default function VendorSettings({ vendorId: _vendorId }: VendorSettingsProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>({
    businessName: user?.businessName || '',
    businessDescription: 'Traditional crafts and handmade products from local artisans.',
    businessPhone: '+234 801 234 5678',
    businessAddress: '123 Market Street, Abuja, Nigeria',
    businessCategory: 'Crafts & Handmade',
    businessWebsite: 'www.mystore.com',
    taxId: 'TX123456789'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    orderNotifications: true,
    paymentNotifications: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const categories = [
    'Crafts & Handmade',
    'Textiles & Fabrics',
    'Pottery & Ceramics',
    'Jewelry & Accessories',
    'Art & Paintings',
    'Home & Garden',
    'Clothing & Fashion',
    'Beauty & Personal Care',
    'Food & Beverages',
    'Electronics',
    'Books & Media',
    'Sports & Recreation'
  ];

  const sections = [
    { id: 'profile', name: 'Business Profile', icon: BuildingStorefrontIcon },
    { id: 'account', name: 'Account Settings', icon: UserIcon },
    { id: 'payments', name: 'Payment Settings', icon: CreditCardIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'legal', name: 'Legal & Compliance', icon: DocumentTextIcon }
  ];

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Here you would make an API call to update the vendor profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      setEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Settings</h2>
        <p className="text-gray-600 mt-1">Manage your business profile and account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  activeSection === section.id
                    ? 'bg-kasuwa-primary-100 text-kasuwa-primary-700 border-l-4 border-kasuwa-primary-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-5 h-5 mr-3" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Business Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center text-kasuwa-primary-600 hover:text-kasuwa-primary-700"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileSave}
                      disabled={loading}
                      className="flex items-center bg-kasuwa-primary-600 text-white px-3 py-1 rounded-md hover:bg-kasuwa-primary-700 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex items-center bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={vendorProfile.businessName}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Category *
                  </label>
                  {editingProfile ? (
                    <select
                      value={vendorProfile.businessCategory}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessCategory: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editingProfile ? (
                    <input
                      type="tel"
                      value={vendorProfile.businessPhone}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessPhone: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  {editingProfile ? (
                    <input
                      type="url"
                      value={vendorProfile.businessWebsite}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessWebsite: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessWebsite}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  {editingProfile ? (
                    <textarea
                      value={vendorProfile.businessAddress}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessAddress: e.target.value }))}
                      rows={2}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessAddress}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  {editingProfile ? (
                    <textarea
                      value={vendorProfile.businessDescription}
                      onChange={(e) => setVendorProfile(prev => ({ ...prev, businessDescription: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorProfile.businessDescription}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Settings Section */}
          {activeSection === 'account' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <p className="text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <p className="text-gray-900">{user?.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active Vendor
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                      />
                    </div>
                  </div>
                  <button className="mt-3 bg-kasuwa-primary-600 text-white px-4 py-2 rounded-md hover:bg-kasuwa-primary-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Order Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.orderNotifications}
                      onChange={() => handleNotificationChange('orderNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kasuwa-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kasuwa-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Payment Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified about payment updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.paymentNotifications}
                      onChange={() => handleNotificationChange('paymentNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kasuwa-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kasuwa-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Receive tips and promotional content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kasuwa-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kasuwa-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Get weekly sales and performance reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReports}
                      onChange={() => handleNotificationChange('weeklyReports')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kasuwa-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kasuwa-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder sections */}
          {(activeSection === 'payments' || activeSection === 'security' || activeSection === 'legal') && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {sections.find(s => s.id === activeSection)?.name}
              </h3>
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  {activeSection === 'payments' && <CreditCardIcon className="w-12 h-12" />}
                  {activeSection === 'security' && <ShieldCheckIcon className="w-12 h-12" />}
                  {activeSection === 'legal' && <DocumentTextIcon className="w-12 h-12" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  {activeSection === 'payments' && 'Payment methods and payout settings will be available here.'}
                  {activeSection === 'security' && 'Two-factor authentication and security settings will be available here.'}
                  {activeSection === 'legal' && 'Terms, policies, and compliance documents will be available here.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}