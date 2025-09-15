// Authentication service for Kasuwa platform
import { apiClient, unwrapApiResponse } from './api';
import type { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  RefreshTokenDto,
  UserDto,
  ApiResponseDto 
} from '../types/api';

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponseDto<AuthResponseDto>>('/auth/login', credentials);
    const authData = unwrapApiResponse(response);
    
    // Store the token in the API client
    apiClient.setToken(authData.token);
    
    return authData;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponseDto<AuthResponseDto>>('/auth/register', userData);
    const authData = unwrapApiResponse(response);
    
    // Store the token in the API client
    apiClient.setToken(authData.token);
    
    return authData;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshTokenData: RefreshTokenDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<ApiResponseDto<AuthResponseDto>>('/auth/refresh-token', refreshTokenData);
    const authData = unwrapApiResponse(response);
    
    // Update the token in the API client
    apiClient.setToken(authData.token);
    
    return authData;
  }

  /**
   * Logout user (clear token)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if the server request fails, we should clear the local token
      console.warn('Logout request failed:', error);
    } finally {
      // Clear the token from storage and API client
      apiClient.setToken(null);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserDto> {
    const response = await apiClient.get<ApiResponseDto<UserDto>>('/auth/profile');
    return unwrapApiResponse(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserDto>): Promise<UserDto> {
    const response = await apiClient.put<ApiResponseDto<UserDto>>('/auth/profile', profileData);
    return unwrapApiResponse(response);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/auth/forgot-password', { email });
    unwrapApiResponse(response);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/auth/reset-password', {
      token,
      newPassword
    });
    unwrapApiResponse(response);
  }

  /**
   * Confirm email address
   */
  async confirmEmail(token: string, email: string): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/auth/confirm-email', {
      token,
      email
    });
    unwrapApiResponse(response);
  }

  /**
   * Resend email confirmation
   */
  async resendEmailConfirmation(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/auth/resend-confirmation', { email });
    unwrapApiResponse(response);
  }

  /**
   * Change password (when user is authenticated)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/auth/change-password', {
      currentPassword,
      newPassword
    });
    unwrapApiResponse(response);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }
}

// Create and export a default instance
export const authService = new AuthService();