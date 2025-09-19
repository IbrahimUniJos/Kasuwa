import { useState, useEffect } from 'react';
import { 
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/admin';
import type { PlatformSettingsDto } from '../services/admin';

interface AdminSettingsPageProps {
  className?: string;
}

export default function AdminSettingsPage({ className = '' }: AdminSettingsPageProps) {
  const { isAdmin, isLoading } = useAuth();
  const [settings, setSettings] = useState<PlatformSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, isLoading]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPlatformSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      await adminService.updatePlatformSettings(settings);
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateGeneralSetting = (key: keyof typeof settings.general, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [key]: value
      }
    });
  };

  const updateModerationSetting = (key: keyof typeof settings.moderation, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      moderation: {
        ...settings.moderation,
        [key]: value
      }
    });
  };

  const updatePaymentSetting = (key: keyof typeof settings.payments, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      payments: {
        ...settings.payments,
        [key]: value
      }
    });
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
          <p className="text-gray-600">You don't have permission to access platform settings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
            className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure platform-wide settings and preferences.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {settings && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => updateGeneralSetting('platformName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.general.defaultCommissionRate}
                      onChange={(e) => updateGeneralSetting('defaultCommissionRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (?)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.general.minimumOrderAmount}
                      onChange={(e) => updateGeneralSetting('minimumOrderAmount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.general.taxRate}
                      onChange={(e) => updateGeneralSetting('taxRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Moderation Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Moderation Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.moderation.autoApproveProducts}
                      onChange={(e) => updateModerationSetting('autoApproveProducts', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Auto-approve new products</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.moderation.requireVendorVerification}
                      onChange={(e) => updateModerationSetting('requireVendorVerification', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Require vendor verification</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.moderation.reviewModerationEnabled}
                      onChange={(e) => updateModerationSetting('reviewModerationEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Enable review moderation</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Processing Fee (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.payments.paymentProcessingFee}
                      onChange={(e) => updatePaymentSetting('paymentProcessingFee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Payout Schedule
                    </label>
                    <select
                      value={settings.payments.vendorPayoutSchedule}
                      onChange={(e) => updatePaymentSetting('vendorPayoutSchedule', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Payment Methods
                  </label>
                  <div className="space-y-2">
                    {['CreditCard', 'PayPal', 'BankTransfer', 'MobileMoney'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.payments.supportedPaymentMethods.includes(method)}
                          onChange={(e) => {
                            const methods = settings.payments.supportedPaymentMethods;
                            if (e.target.checked) {
                              updatePaymentSetting('supportedPaymentMethods', [...methods, method]);
                            } else {
                              updatePaymentSetting('supportedPaymentMethods', methods.filter(m => m !== method));
                            }
                          }}
                          className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kasuwa-primary-500 ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <CogIcon className="h-5 w-5 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}