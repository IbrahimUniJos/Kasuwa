// User and Address services for Kasuwa platform
import { apiClient } from './api';
import type { 
  UserDto,
  AddressDto,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateUserDto,
  ChangePasswordRequestDto
} from '../types/api';

export class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserDto> {
    const response = await apiClient.get<UserDto>('/user/profile');
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: UpdateUserDto): Promise<UserDto> {
    const response = await apiClient.put<UserDto>('/user/profile', userData);
    return response;
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequestDto): Promise<void> {
    await apiClient.post<void>('/user/change-password', passwordData);
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const response = await apiClient.uploadFile<{ imageUrl: string }>('/user/profile-image', file);
    return response;
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete<void>('/user/account');
  }
}

export class AddressService {
  /**
   * Get user's addresses
   */
  async getAddresses(): Promise<AddressDto[]> {
    const response = await apiClient.get<AddressDto[]>('/user/addresses');
    return response;
  }

  /**
   * Get a specific address
   */
  async getAddress(id: number): Promise<AddressDto> {
    const response = await apiClient.get<AddressDto>(`/user/addresses/${id}`);
    return response;
  }

  /**
   * Create a new address
   */
  async createAddress(addressData: CreateAddressDto): Promise<AddressDto> {
    const response = await apiClient.post<AddressDto>('/user/addresses', addressData);
    return response;
  }

  /**
   * Update an existing address
   */
  async updateAddress(id: number, addressData: UpdateAddressDto): Promise<AddressDto> {
    const response = await apiClient.put<AddressDto>(`/user/addresses/${id}`, addressData);
    return response;
  }

  /**
   * Delete an address
   */
  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete<void>(`/user/addresses/${id}`);
  }

  /**
   * Set default address
   */
  async setDefaultAddress(id: number): Promise<AddressDto> {
    const response = await apiClient.post<AddressDto>(`/user/addresses/${id}/set-default`);
    return response;
  }
}

// Create and export default instances
export const userService = new UserService();
export const addressService = new AddressService();