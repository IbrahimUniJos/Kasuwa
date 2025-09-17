import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { UserDto, LoginDto, RegisterDto, UserType } from '../types/api';

// Define the auth state interface
interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: UserDto }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Define the context interface
interface AuthContextType {
  // State
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  
  // User type helpers
  isCustomer: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  isVendorApproved: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Setup token refresh interval
  useEffect(() => {
    authService.setupTokenRefresh();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Initialize the auth service
      authService.initialize();
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error: any) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid tokens
      await authService.logout();
      dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired. Please log in again.' });
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse = await authService.login(credentials);
      
      if (authResponse.success && authResponse.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      } else {
        throw new Error(authResponse.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse = await authService.register(userData);
      
      if (authResponse.success && authResponse.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      } else {
        throw new Error(authResponse.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear state anyway
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const authResponse = await authService.refreshToken();
      if (authResponse.success && authResponse.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Helper computed properties
  const isCustomer = state.user?.userType === 1; // UserType.Customer
  const isVendor = state.user?.userType === 2; // UserType.Vendor
  const isAdmin = state.user?.userType === 3; // UserType.Administrator
  const isVendorApproved = isVendor && state.user?.isVendorApproved === true;

  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    refreshToken,
    
    // User type helpers
    isCustomer,
    isVendor,
    isAdmin,
    isVendorApproved,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredUserType?: UserType;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredUserType,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || <div>Please log in to access this page.</div>;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return fallback || <div>You don't have permission to access this page.</div>;
  }

  return <>{children}</>;
}

// Hook for authentication utilities
export function useAuthUtils() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  const getUserInitials = (): string => {
    if (!user) return 'G';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  return {
    hasRole,
    hasAnyRole,
    getUserDisplayName,
    getUserInitials,
    isAuthenticated,
    user,
  };
}