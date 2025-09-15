// Authentication service for Kasuwa platform
import { apiClient } from './api';
import { UserType } from '../types/api';
import type { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  RefreshTokenRequestDto,
  UserDto,
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto
} from '../types/api';

export class AuthService {
  private readonly TOKEN_KEY = 'kasuwa_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'kasuwa_refresh_token';

  /**
   * Login user with email and password
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
    
    // Handle the backend response format
    if (response.success && response.token) {
      this.setTokens(response.token, response.refreshToken);
    }
    
    return response;
  }

  /**
   * Validate registration data before sending to server
   */
  private validateRegistrationData(userData: RegisterDto): void {
    const errors: string[] = [];

    // Required field validation
    if (!userData.email?.trim()) errors.push('Email is required');
    if (!userData.password?.trim()) errors.push('Password is required');
    if (!userData.confirmPassword?.trim()) errors.push('Confirm password is required');
    if (!userData.firstName?.trim()) errors.push('First name is required');
    if (!userData.lastName?.trim()) errors.push('Last name is required');

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (userData.password && userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Password match validation
    if (userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword) {
      errors.push('Password and confirm password do not match');
    }

    // UserType validation
    if (userData.userType === undefined || userData.userType === null) {
      errors.push('User type is required');
    }

    // Vendor-specific validation
    if (userData.userType === UserType.Vendor && !userData.businessName?.trim()) {
      errors.push('Business name is required for vendors');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Validate data before sending to server
      this.validateRegistrationData(userData);
      
      const response = await apiClient.post<AuthResponseDto>('/auth/register', userData);
      
      // Handle the backend response format
      if (response.success && response.token) {
        this.setTokens(response.token, response.refreshToken);
      }
      
      return response;
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.error('Registration error:', {
        message: error.message,
        status: error.status,
        errors: error.errors,
        userData: {
          email: userData.email,
          userType: userData.userType,
          hasPassword: !!userData.password,
          passwordLength: userData.password?.length,
          passwordsMatch: userData.password === userData.confirmPassword
        }
      });
      
      // Re-throw the error for the calling code to handle
      throw error;
    }
  }

  /**
   * Sign up a new user (alias for register)
   */
  async signup(userData: RegisterDto): Promise<AuthResponseDto> {
    return this.register(userData);
  }

  /**
   * Sign up a new customer
   */
  async signupCustomer(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth?: string;
    preferredLanguage?: string;
  }): Promise<AuthResponseDto> {
    // Ensure all required fields are present and trim whitespace
    const registerData: RegisterDto = {
      firstName: customerData.firstName.trim(),
      lastName: customerData.lastName.trim(),
      email: customerData.email.trim().toLowerCase(),
      password: customerData.password,
      confirmPassword: customerData.confirmPassword,
      userType: UserType.Customer,
      dateOfBirth: customerData.dateOfBirth,
      preferredLanguage: customerData.preferredLanguage
    };
    
    return this.register(registerData);
  }

  /**
   * Sign up a new vendor
   */
  async signupVendor(vendorData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    businessDescription?: string;
    businessAddress?: string;
    businessPhone?: string;
  }): Promise<AuthResponseDto> {
    // Ensure all required fields are present and trim whitespace
    const registerData: RegisterDto = {
      firstName: vendorData.firstName.trim(),
      lastName: vendorData.lastName.trim(),
      email: vendorData.email.trim().toLowerCase(),
      password: vendorData.password,
      confirmPassword: vendorData.confirmPassword,
      userType: UserType.Vendor,
      businessName: vendorData.businessName.trim(),
      businessDescription: vendorData.businessDescription?.trim(),
      businessAddress: vendorData.businessAddress?.trim(),
      businessPhone: vendorData.businessPhone?.trim()
    };
    
    return this.register(registerData);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponseDto> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      throw new Error('No tokens available for refresh');
    }

    const refreshTokenData: RefreshTokenRequestDto = {
      accessToken,
      refreshToken
    };

    const response = await apiClient.post<AuthResponseDto>('/auth/refresh', refreshTokenData);
    
    if (response.success && response.token) {
      this.setTokens(response.token, response.refreshToken);
    }
    
    return response;
  }

  /**
   * Logout user (clear tokens and call backend)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if the server request fails, we should clear the local tokens
      console.warn('Logout request failed:', error);
    } finally {
      // Clear tokens from storage and API client
      this.clearTokens();
    }
  }

  /**
   * Logout from all devices (revoke all refresh tokens)
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (error) {
      console.warn('Logout all request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserDto> {
    const response = await apiClient.get<UserDto>('/auth/profile');
    return response;
  }

  /**
   * Change password (when user is authenticated)
   */
  async changePassword(passwordData: ChangePasswordRequestDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/change-password', passwordData);
    return response;
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordData: ForgotPasswordRequestDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/forgot-password', forgotPasswordData);
    return response;
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordData: ResetPasswordRequestDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/reset-password', resetPasswordData);
    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get user information from stored token
   */
  getUserFromToken(): Partial<UserDto> | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.nameid,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        roles: payload.role ? (Array.isArray(payload.role) ? payload.role : [payload.role]) : []
      };
    } catch {
      return null;
    }
  }

  /**
   * Set authentication tokens
   */
  private setTokens(token?: string, refreshToken?: string): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      apiClient.setToken(token);
    }
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    apiClient.setToken(null);
  }

  /**
   * Initialize authentication on app startup
   */
  initialize(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      apiClient.setToken(token);
    } else {
      this.clearTokens();
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh(): void {
    // Check for token expiration every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated()) {
        const token = this.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - currentTime;
            
            // Refresh token if it expires in the next 5 minutes
            if (timeUntilExpiry < 300) {
              await this.refreshToken();
            }
          } catch (error) {
            console.error('Error checking token expiration:', error);
            this.clearTokens();
          }
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Create and export a default instance
export const authService = new AuthService();