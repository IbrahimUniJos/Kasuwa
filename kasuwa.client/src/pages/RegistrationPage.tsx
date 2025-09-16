import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import type { RegisterDto, UserType } from '../types/api';

interface RegistrationPageProps {
  onRegister?: (userData: RegisterDto) => Promise<void>;
}

export default function RegistrationPage({ onRegister }: RegistrationPageProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(1); // Default to Customer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<RegisterDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 1,
    // Vendor-specific fields
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    // Customer-specific fields
    dateOfBirth: '',
    preferredLanguage: 'en'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Account type validation - no specific validation needed
    }

    if (step === 2) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (step === 3) {
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password && formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 4) {
      if (userType === 2) { // Vendor
        if (!formData.businessName?.trim()) errors.businessName = 'Business name is required';
        if (!formData.businessDescription?.trim()) errors.businessDescription = 'Business description is required';
        if (!formData.businessAddress?.trim()) errors.businessAddress = 'Business address is required';
        if (!formData.businessPhone?.trim()) errors.businessPhone = 'Business phone is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setError(null);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setFormData(prev => ({ ...prev, userType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4) || !validateStep(3) || !validateStep(2)) {
      setError('Please correct the errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRegister?.(formData);
      navigate('/'); // Redirect to home page after successful registration
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Account Type', description: 'Choose your account type' },
    { number: 2, title: 'Personal Info', description: 'Basic personal information' },
    { number: 3, title: 'Security', description: 'Create your password' },
    { number: 4, title: 'Details', description: 'Additional information' },
    { number: 5, title: 'Review', description: 'Review and confirm' }
  ];

  const passwordStrength = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-kasuwa-primary-50 to-kasuwa-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-kasuwa-primary-600 hover:text-kasuwa-primary-700 mb-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Kasuwa
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-kasuwa-primary-500 to-kasuwa-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join Kasuwa</h1>
          </div>
          <p className="text-lg text-gray-600">
            Welcome to Northern Nigeria's premier marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center space-x-2 ${
                  step.number <= currentStep ? 'text-kasuwa-primary-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number < currentStep 
                      ? 'bg-kasuwa-primary-600 text-white' 
                      : step.number === currentStep
                      ? 'bg-kasuwa-primary-100 text-kasuwa-primary-600 border-2 border-kasuwa-primary-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number < currentStep ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    step.number < currentStep ? 'bg-kasuwa-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Choose Your Account Type
                  </h2>
                  <p className="text-gray-600">
                    Select the type of account that best describes you
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {/* Customer Option */}
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange(1)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      userType === 1
                        ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        userType === 1 ? 'bg-kasuwa-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Shop for authentic Northern Nigerian products
                        </p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                          <li>• Browse and purchase products</li>
                          <li>• Create wishlists</li>
                          <li>• Track orders</li>
                          <li>• Leave reviews</li>
                        </ul>
                      </div>
                    </div>
                  </button>

                  {/* Vendor Option */}
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange(2)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      userType === 2
                        ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        userType === 2 ? 'bg-kasuwa-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <BuildingOfficeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Vendor</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Sell your products to customers across the region
                        </p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                          <li>• List and manage products</li>
                          <li>• Process orders</li>
                          <li>• Access analytics</li>
                          <li>• Grow your business</li>
                        </ul>
                      </div>
                    </div>
                  </button>
                </div>

                {userType === 2 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Vendor Approval Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Vendor accounts require approval from our team. You can browse and shop immediately, 
                          but selling features will be available after approval (usually within 24-48 hours).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Personal Information
                  </h2>
                  <p className="text-gray-600">
                    Tell us about yourself
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                            validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                      </div>
                      {validationErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                            validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                      </div>
                      {validationErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                          validationErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      We'll use this to send you order updates and important notifications
                    </p>
                  </div>

                  {/* Customer-specific fields */}
                  {userType === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth (Optional)
                        </label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            value={formData.dateOfBirth || ''}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Language
                        </label>
                        <div className="relative">
                          <GlobeAltIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <select
                            value={formData.preferredLanguage || 'en'}
                            onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="ha">Hausa</option>
                            <option value="ig">Igbo</option>
                            <option value="yo">Yoruba</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Create Your Password
                  </h2>
                  <p className="text-gray-600">
                    Choose a strong password to secure your account
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                          validationErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Create a strong password"
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
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordScore >= 4 ? 'bg-green-500' :
                                passwordScore >= 3 ? 'bg-yellow-500' :
                                passwordScore >= 2 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(passwordScore / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordScore >= 4 ? 'text-green-600' :
                            passwordScore >= 3 ? 'text-yellow-600' :
                            passwordScore >= 2 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {passwordScore >= 4 ? 'Strong' :
                             passwordScore >= 3 ? 'Good' :
                             passwordScore >= 2 ? 'Fair' : 'Weak'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center space-x-1 ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Uppercase letter</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Lowercase letter</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Number</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                          validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your password"
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
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {userType === 2 ? 'Business Information' : 'Additional Information'}
                  </h2>
                  <p className="text-gray-600">
                    {userType === 2 
                      ? 'Tell us about your business' 
                      : 'Help us personalize your experience'}
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {userType === 2 ? (
                    // Vendor-specific fields
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.businessName || ''}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                              validationErrors.businessName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your business name"
                          />
                        </div>
                        {validationErrors.businessName && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.businessName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.businessDescription || ''}
                          onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                          rows={4}
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                            validationErrors.businessDescription ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Describe your business and what you sell..."
                        />
                        {validationErrors.businessDescription && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.businessDescription}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.businessAddress || ''}
                          onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                          rows={3}
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                            validationErrors.businessAddress ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your business address..."
                        />
                        {validationErrors.businessAddress && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.businessAddress}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.businessPhone || ''}
                            onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                              validationErrors.businessPhone ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="+234 800 000 0000"
                          />
                        </div>
                        {validationErrors.businessPhone && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.businessPhone}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    // Customer additional info
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Almost Done!</h3>
                      <p className="text-gray-600">
                        Your customer account is ready. Click next to review and complete your registration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Review Your Information
                  </h2>
                  <p className="text-gray-600">
                    Please review your details before creating your account
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Account Type:</span>
                          <p className="font-medium">{userType === 1 ? 'Customer' : 'Vendor'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                      </div>
                    </div>

                    {userType === 2 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Business Name:</span>
                            <p className="font-medium">{formData.businessName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Business Phone:</span>
                            <p className="font-medium">{formData.businessPhone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {userType === 1 && formData.dateOfBirth && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date of Birth:</span>
                            <p className="font-medium">
                              {new Date(formData.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Language:</span>
                            <p className="font-medium">{formData.preferredLanguage}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mt-6 text-sm text-gray-600">
                    <p className="mb-4">
                      By creating an account, you agree to our{' '}
                      <Link to="/terms" className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700 underline">
                        Privacy Policy
                      </Link>.
                    </p>
                    
                    {userType === 2 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-800">Vendor Account Notice</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Your vendor account will be reviewed and approved by our team. 
                              You can browse and shop immediately, but selling features will be available after approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Already have account */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="text-kasuwa-primary-600 hover:text-kasuwa-primary-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}