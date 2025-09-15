import { useAuth, useAuthUtils } from '../contexts/AuthContext';
import type { LoginDto, RegisterDto, UserType } from '../types/api';

/**
 * Custom hook that provides authentication functionality
 * This is a convenience hook that wraps the AuthContext
 */
export function useAuthentication() {
  const authContext = useAuth();
  const authUtils = useAuthUtils();

  // Extended login with success callback
  const loginWithCallback = async (credentials: LoginDto, onSuccess?: () => void) => {
    try {
      await authContext.login(credentials);
      onSuccess?.();
    } catch (error) {
      // Error is already handled in the context
      throw error;
    }
  };

  // Extended register with success callback
  const registerWithCallback = async (userData: RegisterDto, onSuccess?: () => void) => {
    try {
      await authContext.register(userData);
      onSuccess?.();
    } catch (error) {
      // Error is already handled in the context
      throw error;
    }
  };

  // Check if user can perform vendor actions
  const canManageProducts = (): boolean => {
    return authContext.isVendorApproved || authContext.isAdmin;
  };

  // Check if user can access admin features
  const canAccessAdmin = (): boolean => {
    return authContext.isAdmin;
  };

  // Check if user can make purchases
  const canMakePurchases = (): boolean => {
    return authContext.isCustomer || authContext.isVendor || authContext.isAdmin;
  };

  // Get user type display name
  const getUserTypeDisplayName = (): string => {
    if (!authContext.user) return 'Guest';
    
    switch (authContext.user.userType) {
      case 1: return 'Customer';
      case 2: return authContext.isVendorApproved ? 'Verified Vendor' : 'Pending Vendor';
      case 3: return 'Administrator';
      default: return 'User';
    }
  };

  // Get user status for vendors
  const getVendorStatus = (): 'approved' | 'pending' | 'not-vendor' => {
    if (!authContext.isVendor) return 'not-vendor';
    return authContext.isVendorApproved ? 'approved' : 'pending';
  };

  return {
    // State from context
    ...authContext,
    
    // Utils from context
    ...authUtils,
    
    // Extended methods
    loginWithCallback,
    registerWithCallback,
    
    // Permission checks
    canManageProducts,
    canAccessAdmin,
    canMakePurchases,
    
    // Display helpers
    getUserTypeDisplayName,
    getVendorStatus,
  };
}

export default useAuthentication;