import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import type { LoginDto, RegisterDto, UserType } from '../../types/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (credentials: LoginDto) => Promise<void>;
  onRegister?: (userData: RegisterDto) => Promise<void>;
  defaultTab?: 'login' | 'register';
  defaultUserType?: UserType;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  defaultTab = 'login',
  defaultUserType = 1 // UserType.Customer
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(defaultUserType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState<LoginDto>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [registerForm, setRegisterForm] = useState<RegisterDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: defaultUserType,
    // Vendor fields
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    // Customer fields
    dateOfBirth: '',
    preferredLanguage: 'en'
  });

  // Update form userType when selectedUserType changes
  useEffect(() => {
    setRegisterForm(prev => ({ ...prev, userType: selectedUserType }));
  }, [selectedUserType]);

  // Update selectedUserType when defaultUserType changes
  useEffect(() => {
    setSelectedUserType(defaultUserType);
  }, [defaultUserType]);

  // Reset form when tab changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, [activeTab]);

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
    // Reset forms
    setLoginForm({
      email: '',
      password: '',
      rememberMe: false
    });
    setRegisterForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: defaultUserType,
      businessName: '',
      businessDescription: '',
      businessAddress: '',
      businessPhone: '',
      dateOfBirth: '',
      preferredLanguage: 'en'
    });
    onClose();
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const handleUserTypeChange = (userType: UserType) => {
    setSelectedUserType(userType);
    setError(null);
  };

  const validateRegistrationForm = (): string | null => {
    if (!registerForm.firstName.trim()) return 'First name is required';
    if (!registerForm.lastName.trim()) return 'Last name is required';
    if (!registerForm.email.trim()) return 'Email is required';
    if (!registerForm.email.includes('@')) return 'Please enter a valid email address';
    if (!registerForm.password) return 'Password is required';
    if (registerForm.password.length < 8) return 'Password must be at least 8 characters long';
    if (registerForm.password !== registerForm.confirmPassword) return 'Passwords do not match';

    // Vendor-specific validation
    if (selectedUserType === 2) { // UserType.Vendor
      if (!registerForm.businessName?.trim()) return 'Business name is required for vendors';
      if (!registerForm.businessDescription?.trim()) return 'Business description is required for vendors';
    }

    return null;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await onLogin?.(loginForm);
      setSuccess('Login successful! Welcome back.');
      setTimeout(() => handleClose(), 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateRegistrationForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await onRegister?.(registerForm);
      
      if (selectedUserType === 2) { // UserType.Vendor
        setSuccess('Registration successful! Your vendor account is pending approval. You can still browse and shop while we review your application.');
      } else {
        setSuccess('Registration successful! Welcome to Kasuwa marketplace.');
      }
      
      setTimeout(() => handleClose(), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeDisplayName = (userType: UserType): string => {
    switch (userType) {
      case 1: return 'Customer';
      case 2: return 'Vendor';
      case 3: return 'Administrator';
      default: return 'Customer';
    }
  };

  const getUserTypeDescription = (userType: UserType): string => {
    switch (userType) {
      case 1: return 'Shop and purchase products from verified vendors';
      case 2: return 'Sell your products and manage your business';
      case 3: return 'Manage the platform and users';
      default: return 'Shop and purchase products';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">K</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Welcome to Kasuwa
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Cultural Greeting */}
                <div className="mb-6 text-center">
                  <p className="text-sm text-kasuwa-accent-600 bg-kasuwa-accent-50 px-3 py-2 rounded-full inline-block">
                    🌟 Sannu da zuwa! Welcome to Northern Nigeria's marketplace
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleTabChange('login')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'login'
                        ? 'bg-white text-kasuwa-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleTabChange('register')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'register'
                        ? 'bg-white text-kasuwa-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={loginForm.rememberMe}
                          onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                          className="h-4 w-4 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-kasuwa-primary-600 hover:text-kasuwa-primary-700"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* User Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        I want to join as a:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange(1)} // UserType.Customer
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedUserType === 1
                              ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <UserIcon className={`h-6 w-6 mx-auto mb-2 ${
                            selectedUserType === 1 ? 'text-kasuwa-primary-600' : 'text-gray-400'
                          }`} />
                          <div className="text-sm font-medium text-gray-900">Customer</div>
                          <div className="text-xs text-gray-500 mt-1">Shop products</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleUserTypeChange(2)} // UserType.Vendor
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedUserType === 2
                              ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <BuildingOfficeIcon className={`h-6 w-6 mx-auto mb-2 ${
                            selectedUserType === 2 ? 'text-kasuwa-primary-600' : 'text-gray-400'
                          }`} />
                          <div className="text-sm font-medium text-gray-900">Vendor</div>
                          <div className="text-xs text-gray-500 mt-1">Sell products</div>
                        </button>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerForm.firstName}
                            onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                            placeholder="First name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Vendor-specific fields */}
                    {selectedUserType === 2 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <BuildingOfficeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={registerForm.businessName || ''}
                              onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                              placeholder="Your business name"
                              required={selectedUserType === 2}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={registerForm.businessDescription || ''}
                            onChange={(e) => setRegisterForm({ ...registerForm, businessDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                            placeholder="Describe your business and what you sell"
                            rows={2}
                            required={selectedUserType === 2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Address
                          </label>
                          <input
                            type="text"
                            value={registerForm.businessAddress || ''}
                            onChange={(e) => setRegisterForm({ ...registerForm, businessAddress: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                            placeholder="Your business address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Phone
                          </label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              value={registerForm.businessPhone || ''}
                              onChange={(e) => setRegisterForm({ ...registerForm, businessPhone: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                              placeholder="+234 800 000 0000"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Customer-specific fields */}
                    {selectedUserType === 1 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth (Optional)
                          </label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                              type="date"
                              value={registerForm.dateOfBirth || ''}
                              onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Language
                          </label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <select
                              value={registerForm.preferredLanguage || 'en'}
                              onChange={(e) => setRegisterForm({ ...registerForm, preferredLanguage: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                            >
                              <option value="en">English</option>
                              <option value="ha">Hausa</option>
                              <option value="ig">Igbo</option>
                              <option value="yo">Yoruba</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Password fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Create a password (min. 8 characters)"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Vendor approval notice */}
                    {selectedUserType === 2 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          <strong>Vendor Account Notice:</strong> Your vendor account will be reviewed and approved by our team. 
                          You can browse and shop immediately, but selling features will be available after approval.
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-600">
                      By creating an account, you agree to our{' '}
                      <a href="/terms" className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700">
                        Privacy Policy
                      </a>
                      .
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-kasuwa-primary-600 text-white font-semibold rounded-lg hover:bg-kasuwa-primary-700 focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Creating Account...' : `Create ${getUserTypeDisplayName(selectedUserType)} Account`}
                    </button>
                  </form>
                )}

                {/* Social Login Options */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      <span className="mr-2">📱</span>
                      Phone
                    </button>
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      <span className="mr-2">🌐</span>
                      Google
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}